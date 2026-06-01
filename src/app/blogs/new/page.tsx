'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bold, Italic, Heading2, List, Link2, Image as ImageIcon, Quote, ArrowLeft, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import FileUpload from '@/components/FileUpload';
import toast from 'react-hot-toast';

interface Category { id: string; name: string; slug: string; }

function insertMarkdown(
  textarea: HTMLTextAreaElement,
  before: string,
  after = '',
  placeholder = 'text'
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || placeholder;
  const newValue =
    textarea.value.slice(0, start) +
    before + selected + after +
    textarea.value.slice(end);
  return { value: newValue, cursor: start + before.length + selected.length + after.length };
}

const toolbar = [
  { icon: Bold,     title: 'Bold',        before: '**', after: '**', placeholder: 'bold text' },
  { icon: Italic,   title: 'Italic',      before: '_',  after: '_',  placeholder: 'italic text' },
  { icon: Heading2, title: 'Heading',     before: '## ', after: '', placeholder: 'Heading' },
  { icon: List,     title: 'List',        before: '- ', after: '', placeholder: 'item' },
  { icon: Quote,    title: 'Quote',       before: '> ', after: '', placeholder: 'quote' },
  { icon: Link2,    title: 'Link',        before: '[', after: '](https://)', placeholder: 'link text' },
];

export default function NewBlogPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', image: '', categoryId: '', tags: '', readTime: 5,
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, [user, router]);

  const applyFormat = (before: string, after: string, placeholder: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { value, cursor } = insertMarkdown(ta, before, after, placeholder);
    setForm(f => ({ ...f, content: value }));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(cursor, cursor); }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) { toast.error('Please upload a cover image'); return; }
    setLoading(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const { data } = await api.post('/blogs', { ...form, tags, readTime: Number(form.readTime) });
      toast.success('Story published!');
      router.push(`/blogs/${data.slug}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--bg)' }}>
      {/* Sticky top bar */}
      <div className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="flex items-center gap-1.5 transition"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </Link>
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Write a Story</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPreview(p => !p)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition"
            style={{ color: 'var(--text-muted)' }}>
            {preview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{preview ? 'Edit' : 'Preview'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* Title */}
        <div>
          <input
            type="text" required
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Story title..."
            className="w-full text-2xl font-semibold border-0 outline-none resize-none leading-snug py-2"
            style={{
              background: 'transparent',
              color: 'var(--text)',
            }}
          />
        </div>

        {/* Excerpt */}
        <div>
          <textarea
            required rows={2}
            value={form.excerpt}
            onChange={e => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Short summary shown in the feed..."
            className="w-full text-sm border-0 outline-none resize-none leading-relaxed pt-3"
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border)',
            }}
          />
        </div>

        {/* Cover image */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Cover Image</p>
          <FileUpload
            accept="image"
            label="Upload cover image"
            currentUrl={form.image}
            onUpload={url => setForm({ ...form, image: url })}
          />
        </div>

        {/* Markdown toolbar + editor */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Content</p>
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Markdown supported</span>
          </div>

          {/* Toolbar */}
          {!preview && (
            <div className="flex items-center gap-1 rounded-t-lg px-2 py-1.5 flex-wrap"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              {toolbar.map(({ icon: Icon, title, before, after, placeholder }) => (
                <button key={title} type="button" title={title}
                  onClick={() => applyFormat(before, after, placeholder)}
                  className="p-1.5 rounded transition"
                  style={{ color: 'var(--text-muted)' }}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}

          {preview ? (
            <div className="min-h-[280px] p-4 rounded-lg prose prose-sm max-w-none"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text)',
              }}>
              {form.content
                ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                : <p className="italic" style={{ color: 'var(--text-faint)' }}>Nothing to preview yet...</p>
              }
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              required
              rows={14}
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Write your story here... Use **bold**, _italic_, ## headings, - lists"
              className="w-full px-4 py-3 rounded-b-lg text-sm resize-none leading-relaxed font-mono focus:outline-none"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderTop: 'none',
              }}
            />
          )}
        </div>

        {/* Category + Read time row */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Category *</label>
            <select required value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)]"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Read Time (min)</label>
            <input type="number" min={1} max={60}
              value={form.readTime}
              onChange={e => setForm({ ...form, readTime: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)]"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }} />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Tags</label>
          <input type="text" value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
            placeholder="sustainability, eco-tips, nature"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)]"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }} />
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Separate with commas</p>
        </div>

        {/* Actions */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}
          className="flex flex-col sm:flex-row gap-3 pb-6">
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-60"
            style={{ background: 'var(--eco)', color: '#050C07' }}>
            {loading ? 'Publishing...' : 'Publish Story'}
          </button>
          <Link href="/"
            className="flex-1 text-center py-3 rounded-xl text-sm font-medium transition"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
