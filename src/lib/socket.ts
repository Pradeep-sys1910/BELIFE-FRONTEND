import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

export function getSocket(token: string): Socket {
  if (!socket || !socket.connected) {
    // Reuse a disconnected instance if we have one — just reconnect it with a fresh token.
    if (socket) {
      socket.auth = { token };
      socket.connect();
      return socket;
    }
    socket = io(SOCKET_URL, {
      auth: { token },
      // Allow long-polling fallback: many mobile networks / proxies block raw WebSocket,
      // and websocket-only means the socket silently never connects (missed messages).
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
