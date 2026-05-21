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
    <div className="min-h-screen bg-white pb-24 md:pb-8">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </Link>
        <span className="text-sm font-semibold text-gray-900">Write a Story</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPreview(p => !p)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
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
            className="w-full text-2xl font-semibold text-gray-900 placeholder:text-gray-300 border-0 outline-none resize-none leading-snug py-2"
          />
        </div>

        {/* Excerpt */}
        <div>
          <textarea
            required rows={2}
            value={form.excerpt}
            onChange={e => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Short summary shown in the feed..."
            className="w-full text-sm text-gray-600 placeholder:text-gray-300 border-0 outline-none resize-none leading-relaxed border-t border-gray-100 pt-3"
          />
        </div>

        {/* Cover image */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Cover Image</p>
          <FileUpload
            accept="image"
            label="Upload cover image"
            currentUrl={form.image}
            onUpload={url => setForm({ ...form, image: url })}
          />
        </div>

        {/* Markdown toolbar + editor */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Content</p>
            <span className="text-xs text-gray-400">Markdown supported</span>
          </div>

          {/* Toolbar */}
          {!preview && (
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-t-lg px-2 py-1.5 flex-wrap">
              {toolbar.map(({ icon: Icon, title, before, after, placeholder }) => (
                <button key={title} type="button" title={title}
                  onClick={() => applyFormat(before, after, placeholder)}
                  className="p-1.5 rounded hover:bg-white hover:shadow-sm transition text-gray-500 hover:text-gray-900">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}

          {preview ? (
            <div className="min-h-[280px] p-4 border border-gray-200 rounded-lg prose prose-sm prose-forest max-w-none text-gray-800">
              {form.content
                ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                : <p className="text-gray-300 italic">Nothing to preview yet...</p>
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
              className="w-full px-4 py-3 bg-white border border-gray-200 border-t-0 rounded-b-lg text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent resize-none leading-relaxed font-mono"
            />
          )}
        </div>

        {/* Category + Read time row */}
        <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
            <select required value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent">
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Read Time (min)</label>
            <input type="number" min={1} max={60}
              value={form.readTime}
              onChange={e => setForm({ ...form, readTime: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent" />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Tags</label>
          <input type="text" value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
            placeholder="sustainability, eco-tips, nature"
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent" />
          <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row gap-3 pb-6">
          <button type="submit" disabled={loading}
            className="flex-1 bg-forest-700 hover:bg-forest-800 text-white py-3 rounded-xl text-sm font-semibold transition disabled:opacity-60">
            {loading ? 'Publishing...' : 'Publish Story'}
          </button>
          <Link href="/"
            className="flex-1 text-center border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
