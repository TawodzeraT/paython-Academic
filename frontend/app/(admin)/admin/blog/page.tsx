'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText } from 'lucide-react';

interface Post {
  id: string; title: string; slug: string;
  published: boolean; readTime: number;
  createdAt: string; tags: string[];
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = () => {
    api.get('/api/blog')
      .then(({ data }) => setPosts(data.posts))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/api/blog/${id}`);
      setPosts((p) => p.filter((post) => post.id !== id));
      toast.success('Post deleted.');
    } catch {
      toast.error('Failed to delete post.');
    }
  };

  const togglePublish = async (post: Post) => {
    try {
      await api.patch(`/api/blog/${post.id}`, { published: !post.published });
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, published: !p.published } : p));
      toast.success(post.published ? 'Post unpublished.' : 'Post published!');
    } catch {
      toast.error('Failed to update post.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog</h1>
          <p className="text-gray-500 mt-1">{posts.length} posts</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center">
            <FileText size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-500">No posts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {['Title', 'Tags', 'Read Time', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{post.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">/blog/{post.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {post.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{post.readTime} min</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        post.published
                          ? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                          : 'text-gray-500 bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${post.published ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditing(post); setShowModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => togglePublish(post)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                        >
                          {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => deletePost(post.id, post.title)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <BlogPostModal
          post={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { fetchPosts(); setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function BlogPostModal({
  post, onClose, onSaved,
}: {
  post: Post | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: '',
    content: '',
    thumbnail: '',
    tags: post?.tags.join(', ') ?? '',
    readTime: String(post?.readTime ?? 5),
    published: post?.published ?? false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = async () => {
    if (!form.title || !form.slug || !form.excerpt) {
      toast.error('Title, slug and excerpt are required.'); return;
    }
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        readTime: parseInt(form.readTime),
      };
      if (post) {
        await api.patch(`/api/blog/${post.id}`, payload);
      } else {
        await api.post('/api/blog', payload);
      }
      toast.success(post ? 'Post updated!' : 'Post created!');
      onSaved();
    } catch {
      toast.error('Failed to save post.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {post ? 'Edit Post' : 'New Blog Post'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({
                  ...p, title: e.target.value,
                  slug: p.slug || autoSlug(e.target.value),
                }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Slug *</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {[
            { label: 'Excerpt *', key: 'excerpt', placeholder: 'Brief summary shown in listing' },
            { label: 'Thumbnail URL', key: 'thumbnail', placeholder: 'https://...' },
            { label: 'Tags (comma-separated)', key: 'tags', placeholder: 'python, tutorial, beginner' },
            { label: 'Read Time (minutes)', key: 'readTime', placeholder: '5', type: 'number' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
              <input
                type={type ?? 'text'}
                placeholder={placeholder}
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Content (HTML or Markdown)
            </label>
            <textarea
              rows={10}
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              placeholder="Write your blog post content here..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm((p) => ({ ...p, published: !p.published }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.published ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Publish immediately</span>
          </label>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {isLoading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
