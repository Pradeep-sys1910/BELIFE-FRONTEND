/**
 * Smart API client with load-balancing patterns:
 *  - Exponential-backoff retry (5xx + network errors)
 *  - GET deduplication (concurrent identical calls share one request)
 *  - Stale-while-revalidate cache (30s TTL, serves stale on error)
 *  - Circuit breaker (stops hammering a down server, auto-resets after 30s)
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_RETRIES    = 2;
const RETRY_DELAY_MS = 900;
const CACHE_TTL_MS   = 30_000;
const TIMEOUT_MS     = 60_000;  // accommodate Render free-tier cold starts

const FAILURE_THRESHOLD = 6;
const CIRCUIT_RESET_MS  = 30_000;

// ── Circuit breaker state ─────────────────────────────────────────────────────
let _failures        = 0;
let _circuitOpenUntil = 0;

function circuitIsOpen(): boolean {
  if (_circuitOpenUntil && Date.now() > _circuitOpenUntil) {
    _failures = 0;
    _circuitOpenUntil = 0;
  }
  return _circuitOpenUntil > 0;
}

function recordFailure() {
  _failures++;
  if (_failures >= FAILURE_THRESHOLD) {
    _circuitOpenUntil = Date.now() + CIRCUIT_RESET_MS;
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[api] Circuit breaker OPEN — backend unreachable, serving cache');
    }
  }
}

function recordSuccess() {
  _failures = 0;
  _circuitOpenUntil = 0;
}

// ── Stale-while-revalidate cache ──────────────────────────────────────────────
interface CacheEntry { data: unknown; ts: number }
const _cache = new Map<string, CacheEntry>();

function cacheKey(url: string, params?: Record<string, unknown>): string {
  return url + (params ? '?' + new URLSearchParams(params as any).toString() : '');
}

function getCached(key: string): CacheEntry | null {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts < CACHE_TTL_MS) return entry;   // fresh
  return entry;                                               // stale but returnable on error
}

function setCached(key: string, data: unknown) {
  _cache.set(key, { data, ts: Date.now() });
}

// ── In-flight deduplication ───────────────────────────────────────────────────
const _inflight = new Map<string, Promise<AxiosResponse>>();

// ── Retry helper ──────────────────────────────────────────────────────────────
function isRetryable(err: AxiosError): boolean {
  if (!err.response) return true;                            // network / timeout
  return err.response.status >= 500 && err.response.status !== 501;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay   = RETRY_DELAY_MS,
): Promise<T> {
  try {
    const result = await fn();
    recordSuccess();
    return result;
  } catch (err: unknown) {
    const axErr = err as AxiosError;
    if (retries > 0 && isRetryable(axErr)) {
      await new Promise(r => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    recordFailure();
    throw err;
  }
}

// ── Axios instance ────────────────────────────────────────────────────────────
const _axios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: TIMEOUT_MS,
});

_axios.interceptors.request.use(config => {
  const token = Cookies.get('belife_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

_axios.interceptors.response.use(
  res => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      Cookies.remove('belife_token');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ── Smart GET with cache + dedup + circuit breaker ────────────────────────────
function smartGet(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
  const key = cacheKey(url, config?.params);

  // Serve fresh cache immediately
  const cached = getCached(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return Promise.resolve({ data: cached.data } as AxiosResponse);
  }

  // Circuit breaker — serve stale rather than fail
  if (circuitIsOpen()) {
    if (cached) return Promise.resolve({ data: cached.data } as AxiosResponse);
    return Promise.reject(new Error('Service temporarily unavailable. Please try again shortly.'));
  }

  // Dedup: reuse in-flight request
  const existing = _inflight.get(key);
  if (existing) return existing;

  const req = withRetry(() => _axios.get(url, config))
    .then(res => {
      setCached(key, res.data);
      _inflight.delete(key);
      return res;
    })
    .catch(err => {
      _inflight.delete(key);
      if (cached) {
        // Serve stale data gracefully
        return { data: cached.data } as AxiosResponse;
      }
      throw err;
    });

  _inflight.set(key, req);
  return req;
}

// ── Public API surface ────────────────────────────────────────────────────────
const api = {
  get:    (url: string, config?: AxiosRequestConfig) =>
    smartGet(url, config),

  post:   (url: string, data?: unknown, config?: AxiosRequestConfig) =>
    withRetry(() => _axios.post(url, data, config)),

  put:    (url: string, data?: unknown, config?: AxiosRequestConfig) =>
    withRetry(() => _axios.put(url, data, config), 1),

  patch:  (url: string, data?: unknown, config?: AxiosRequestConfig) =>
    withRetry(() => _axios.patch(url, data, config), 1),

  delete: (url: string, config?: AxiosRequestConfig) =>
    withRetry(() => _axios.delete(url, config), 1),

  /** Force a fresh request, bypassing cache. Use after mutations that affect feed data. */
  fresh:  (url: string, config?: AxiosRequestConfig) => {
    const key = cacheKey(url, config?.params);
    _cache.delete(key);
    return smartGet(url, config);
  },

  /** Invalidate cache entries whose URL contains the given prefix. */
  invalidate: (prefix: string) => {
    for (const key of _cache.keys()) {
      if (key.startsWith(prefix)) _cache.delete(key);
    }
  },

  clearCache: () => _cache.clear(),
};

export default api;
