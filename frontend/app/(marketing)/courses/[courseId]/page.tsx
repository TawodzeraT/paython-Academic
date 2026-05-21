'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import {
  BookOpen, Clock, Users, Star, ChevronDown,
  CheckCircle, Lock, PlayCircle, FileText, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Lesson {
  id: string; title: string; duration: number | null; isFree: boolean;
}
interface Module {
  id: string; title: string; order: number;
  lessons: Lesson[];
  _count: { lessons: number };
}
interface Review {
  id: string; rating: number; comment: string | null;
  user: { name: string; avatar: string | null };
}
interface Course {
  id: string; title: string; subtitle: string | null;
  description: string; thumbnail: string | null;
  price: number; difficulty: string; duration: number | null;
  tags: string[]; modules: Module[]; reviews: Review[];
  avgRating: number | null; totalStudents: number; totalReviews: number;
}

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/api/courses/${courseId}`);
        setCourse(data.course);
        // Expand first module by default
        if (data.course.modules[0]) {
          setExpandedModules(new Set([data.course.modules[0].id]));
        }

        if (isAuthenticated) {
          const { data: enrollment } = await api.get(`/api/payments/enrollment/${courseId}`);
          setEnrolled(enrollment.enrolled);
        }
      } catch {
        router.push('/courses');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, isAuthenticated, router]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }
    if (enrolled) {
      router.push(`/learn/${courseId}`);
      return;
    }
    setPurchasing(true);
    try {
      const { data } = await api.post('/api/payments/checkout', { courseId });
      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error ?? 'Failed to start checkout.';
      toast.error(msg);
    } finally {
      setPurchasing(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = course.modules.reduce((a, m) => a + m._count.lessons, 0);
  const difficultyColor: Record<string, string> = {
    BEGINNER: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    INTERMEDIATE: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    ADVANCED: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-brand-950 py-16 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-10">

          {/* Left: Course info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/courses" className="text-brand-400 text-sm hover:underline">Courses</Link>
              <span className="text-gray-600">/</span>
              <span className="text-gray-400 text-sm truncate">{course.title}</span>
            </div>

            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${difficultyColor[course.difficulty]}`}>
              {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
            </span>

            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="text-gray-300 text-lg mb-6">{course.subtitle}</p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {course.avgRating && (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <Star size={15} fill="currentColor" />
                  {course.avgRating} ({course.totalReviews} reviews)
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users size={15} /> {course.totalStudents.toLocaleString()} students
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={15} /> {totalLessons} lessons
              </span>
              {course.duration && (
                <span className="flex items-center gap-1">
                  <Clock size={15} /> {Math.round(course.duration / 60)} hours
                </span>
              )}
            </div>

            {/* Tags */}
            {course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {course.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Purchase card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden sticky top-6">
              {/* Thumbnail */}
              <div className="h-44 bg-gradient-to-br from-brand-500 to-brand-700 relative">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={48} className="text-white/40" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </span>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={purchasing}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
                >
                  {purchasing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Redirecting...
                    </span>
                  ) : enrolled ? 'Continue Learning →'
                    : course.price === 0 ? 'Enroll Free'
                    : 'Enroll Now'}
                </button>

                {!enrolled && (
                  <p className="text-center text-xs text-gray-400 mt-3">
                    30-day money-back guarantee
                  </p>
                )}

                {/* Includes list */}
                <div className="mt-5 space-y-2.5">
                  {[
                    `${totalLessons} video lessons`,
                    'Downloadable resources',
                    'Quizzes & exercises',
                    'Certificate of completion',
                    'Lifetime access',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">

          {/* Description */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About this course</h2>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {course.description}
            </div>
          </section>

          {/* Curriculum */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Curriculum
              <span className="text-sm font-normal text-gray-400 ml-2">
                {course.modules.length} modules · {totalLessons} lessons
              </span>
            </h2>
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              {course.modules.map((module, idx) => {
                const isOpen = expandedModules.has(module.id);
                return (
                  <div key={module.id} className={idx > 0 ? 'border-t border-gray-200 dark:border-gray-800' : ''}>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {module.order}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {module.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-gray-400">{module._count.lessons} lessons</span>
                        <ChevronDown
                          size={16}
                          className={`text-gray-400 transition-transform ${isOpen ? '' : '-rotate-90'}`}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="bg-white dark:bg-gray-950">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-5 py-3 border-t border-gray-100 dark:border-gray-800"
                          >
                            {lesson.isFree
                              ? <PlayCircle size={16} className="text-brand-500 flex-shrink-0" />
                              : <Lock size={16} className="text-gray-400 flex-shrink-0" />
                            }
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                              {lesson.title}
                            </span>
                            {lesson.isFree && (
                              <span className="text-xs text-brand-600 font-medium">Preview</span>
                            )}
                            {lesson.duration && (
                              <span className="text-xs text-gray-400">
                                {Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2,'0')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Reviews */}
          {course.reviews.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Student Reviews
              </h2>
              {course.avgRating && (
                <div className="flex items-center gap-4 mb-6 p-5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-amber-500">{course.avgRating}</p>
                    <div className="flex gap-0.5 justify-center mt-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= Math.round(course.avgRating!) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{course.totalReviews} ratings</p>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {course.reviews.map((review) => (
                  <div key={review.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                        {review.user.avatar
                          ? <img src={review.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                          : review.user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{review.user.name}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={11}
                              className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column — sticky on desktop (hidden on mobile, shown in hero) */}
        <div className="hidden lg:block lg:col-span-1" />
      </div>
    </div>
  );
}
