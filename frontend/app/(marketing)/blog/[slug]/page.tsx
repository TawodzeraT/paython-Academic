'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Clock, ArrowLeft, Tag } from 'lucide-react';

interface Post {
  id: string; title: string; slug: string; excerpt: string;
  content: string; thumbnail: string | null;
  createdAt: string; readTime: number; tags: string[];
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/blog/${slug}`)
      .then(({ data }) => setPost(data.post))
      .catch(() => router.push('/blog'))
      .finally(() => setIsLoading(false));
  }, [slug, router]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-600 transition-colors mb-8"
        >
          <ArrowLeft size={15} /> Back to Blog
        </Link>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-2.5 py-1 rounded-full">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> {post.readTime} min read
          </span>
          <span>
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
        </div>

        {post.thumbnail && (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-64 object-cover rounded-xl mb-8"
          />
        )}

        {/* Content */}
        <div
          className="prose prose-gray dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline
            prose-code:text-pink-600 dark:prose-code:text-pink-400
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800
            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:rounded-xl
            prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Want to learn Python? Check out our courses.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Browse Courses →
          </Link>
        </div>
      </div>
    </div>
  );
}
