'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bold, Italic, Heading2, List, Link2, Quote, ArrowLeft, Eye, Edit3,
  ImageIcon, Paperclip, Tag, Clock, FolderOpen, X, HardDrive,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import FileUpload from '@/components/FileUpload';
import toast from 'react-hot-toast';

interface Category { id: string; name: string; slug: string; }
interface Attachment { url: string; name: string; type: string; size: number }

function insertMarkdown(textarea: HTMLTextAreaElement, before: string, after = '', placeholder = 'text') {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || placeholder;
  const newValue = textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end);
  return { value: newValue, cursor: start + before.length + selected.length + after.length };
}

const toolbar = [
  { icon: Bold,     title: 'Bold',    before: '**', after: '**', placeholder: 'bold text' },
  { icon: Italic,   title: 'Italic',  before: '_',  after: '_',  placeholder: 'italic text' },
  { icon: Heading2, title: 'Heading', before: '## ', after: '', placeholder: 'Heading' },
  { icon: List,     title: 'List',    before: '- ', after: '', placeholder: 'item' },
  { icon: Quote,    title: 'Quote',   before: '> ', after: '', placeholder: 'quote' },
  { icon: Link2,    title: 'Link',    before: '[', after: '](https://)', placeholder: 'link text' },
];

const fileIcon = (a: Attachment) => {
  if (a.type.startsWith('image/')) return '🖼️';
  if (a.type.startsWith('video/')) return '🎬';
  if (a.type.includes('presentation') || a.type.includes('powerpoint')) return '📑';
  if (a.type.includes('spreadsheet') || a.type.includes('excel')) return '📊';
  return '📎';
};
const fmtSize = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

// Section wrapper for the redesigned, card-based layout.
function Section({ icon: Icon, title, hint, children }: {
  icon: typeof ImageIcon; title: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: 'var(--eco-bright)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
        </div>
        {hint && <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{hint}</span>}
      </div>
      {children}
    </section>
  );
}

export default function NewBlogPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [storage, setStorage] = useState<{ usedMB: number; limitGB: number; percentUsed: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', image: '', categoryId: '', tags: '', readTime: 5,
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => {});
    refreshStorage();
  }, [user, router]);

  const refreshStorage = () => {
    api.fresh('/upload/storage').then(r => setStorage(r.data as any)).catch(() => {});
  };

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
      const { data } = await api.post('/blogs', {
        ...form, tags, readTime: Number(form.readTime),
        attachments: attachments.map(a => a.url),
      });
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
      <div className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between backdrop-blur"
        style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="flex items-center gap-1.5 transition" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </Link>
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Write a Story</span>
        <button type="button" onClick={() => setPreview(p => !p)}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition"
          style={{ color: 'var(--text-muted)' }}>
          {preview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="hidden sm:inline">{preview ? 'Edit' : 'Preview'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 pt-6 space-y-4">

        {/* Title + excerpt card */}
        <section className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <input
            type="text" required value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Story title..."
            className="w-full text-2xl font-semibold border-0 outline-none leading-snug"
            style={{ background: 'transparent', color: 'var(--text)' }}
          />
          <textarea
            required rows={2} value={form.excerpt}
            onChange={e => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Short summary shown in the feed..."
            className="w-full text-sm border-0 outline-none resize-none leading-relaxed mt-3 pt-3"
            style={{ background: 'transparent', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}
          />
        </section>

        {/* Cover image */}
        <Section icon={ImageIcon} title="Cover Image" hint="Required · image only">
          <FileUpload accept="image" label="Upload cover image" currentUrl={form.image}
            onUpload={url => { setForm({ ...form, image: url }); refreshStorage(); }} />
        </Section>

        {/* Content */}
        <Section icon={Edit3} title="Content" hint="Markdown supported">
          {!preview && (
            <div className="flex items-center gap-1 rounded-t-lg px-2 py-1.5 flex-wrap"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              {toolbar.map(({ icon: Icon, title, before, after, placeholder }) => (
                <button key={title} type="button" title={title}
                  onClick={() => applyFormat(before, after, placeholder)}
                  className="p-1.5 rounded transition hover:text-eco-400" style={{ color: 'var(--text-muted)' }}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}
          {preview ? (
            <div className="min-h-[280px] p-4 rounded-lg prose prose-sm max-w-none"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text)' }}>
              {form.content
                ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                : <p className="italic" style={{ color: 'var(--text-faint)' }}>Nothing to preview yet...</p>}
            </div>
          ) : (
            <textarea
              ref={textareaRef} required rows={14} value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Write your story here... Use **bold**, _italic_, ## headings, - lists"
              className="w-full px-4 py-3 rounded-b-lg text-sm resize-none leading-relaxed font-mono focus:outline-none"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text)', border: '1px solid var(--border)', borderTop: 'none' }}
            />
          )}
        </Section>

        {/* Attachments */}
        <Section icon={Paperclip} title="Attachments" hint="Images · Videos · PPT · Excel">
          {attachments.length > 0 && (
            <div className="space-y-2 mb-3">
              {attachments.map((a, i) => (
                <div key={a.url} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <span className="text-lg shrink-0">{fileIcon(a)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: 'var(--text)' }}>{a.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{fmtSize(a.size)}</p>
                  </div>
                  <button type="button" aria-label="Remove attachment"
                    onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                    className="p-1 rounded-full transition hover:text-red-400" style={{ color: 'var(--text-faint)' }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {attachments.length < 10 ? (
            <FileUpload
              accept="media"
              label="Add an attachment"
              resetAfterUpload
              onUpload={(url, meta) => {
                setAttachments(prev => [...prev, { url, name: meta?.name || 'file', type: meta?.type || '', size: meta?.size || 0 }]);
                refreshStorage();
              }}
            />
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Maximum of 10 attachments reached.</p>
          )}

          {/* Storage quota meter */}
          {storage && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> Storage</span>
                <span>{storage.usedMB} MB of {storage.limitGB} GB</span>
              </div>
              <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, storage.percentUsed)}%`,
                    background: storage.percentUsed > 90 ? '#F87171' : 'var(--eco)' }} />
              </div>
            </div>
          )}
        </Section>

        {/* Meta: category, read time, tags */}
        <Section icon={FolderOpen} title="Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <Tag className="w-3 h-3" /> Category *
              </label>
              <select required value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)]"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3 h-3" /> Read Time (min)
              </label>
              <input type="number" min={1} max={60} value={form.readTime}
                onChange={e => setForm({ ...form, readTime: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)]"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text)', border: '1px solid var(--border)' }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Tags</label>
            <input type="text" value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              placeholder="sustainability, eco-tips, nature"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--eco)]"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text)', border: '1px solid var(--border)' }} />
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Separate with commas</p>
          </div>
        </Section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-60"
            style={{ background: 'var(--eco)', color: '#050C07' }}>
            {loading ? 'Publishing...' : 'Publish Story'}
          </button>
          <Link href="/" className="flex-1 text-center py-3 rounded-xl text-sm font-medium transition"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
