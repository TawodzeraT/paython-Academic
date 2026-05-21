'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { CheckCircle, BookOpen } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  thumbnail: string | null;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      router.push('/courses');
      return;
    }

    api.get(`/api/payments/verify/${sessionId}`)
      .then(({ data }) => setCourse(data.course))
      .catch(() => setError('Could not verify your purchase. Please contact support.'))
      .finally(() => setIsLoading(false));
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-gray-500 text-sm">Confirming your purchase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-10 max-w-md w-full text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/dashboard" className="text-brand-600 hover:underline text-sm">
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-10 max-w-md w-full text-center shadow-xl">

        {/* Success icon */}
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          You&apos;re enrolled! 🎉
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Payment confirmed. Your course is ready to start.
        </p>

        {/* Course card */}
        {course && (
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-8 text-left">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex-shrink-0 overflow-hidden">
              {course.thumbnail
                ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={24} className="text-white/60" />
                  </div>
              }
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{course.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">Lifetime access</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {course && (
            <Link
              href={`/learn/${course.id}`}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Start Learning Now →
            </Link>
          )}
          <Link
            href="/dashboard"
            className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl transition-colors text-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
