'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Clock, Tag } from 'lucide-react';

interface Post {
  id: string; title: string; slug: string;
  excerpt: string; thumbnail: string | null;
  createdAt: string; readTime: number; tags: string[];
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/blog')
      .then(({ data }) => setPosts(data.posts))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Python Blog</h1>
          <p className="text-brand-200">Tutorials, tips, and career advice for Python developers.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="space-y-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No posts yet. Check back soon!</div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex gap-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all"
              >
                <div className="w-48 flex-shrink-0 bg-gradient-to-br from-brand-500 to-brand-700 hidden sm:block">
                  {post.thumbnail && (
                    <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-5 flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} /> {post.readTime} min read
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-brand-600 transition-colors mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                  {post.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
                          <Tag size={9} /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
