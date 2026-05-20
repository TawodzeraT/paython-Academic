'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import { BookOpen, Trophy, Clock, TrendingUp } from 'lucide-react';

interface EnrolledCourse {
  id: string;
  title: string;
  thumbnail: string | null;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastWatchedAt: string | null;
}

interface DashboardStats {
  enrolledCourses: number;
  completedCourses: number;
  certificates: number;
  totalMinutes: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/api/student/dashboard');
        setCourses(data.courses);
        setStats(data.stats);
      } catch {
        // Will be real data once backend route is wired
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    { label: 'Enrolled Courses',   value: stats?.enrolledCourses ?? 0,  icon: BookOpen,   color: 'text-blue-600  bg-blue-50  dark:bg-blue-900/20' },
    { label: 'Courses Completed',  value: stats?.completedCourses ?? 0, icon: TrendingUp, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: 'Certificates',       value: stats?.certificates ?? 0,     icon: Trophy,     color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Minutes Learned',    value: stats?.totalMinutes ?? 0,     icon: Clock,      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Pick up where you left off.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Continue learning */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Continue Learning</h2>
          <Link href="/dashboard/courses" className="text-sm text-brand-600 hover:underline">
            View all
          </Link>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
                <div className="h-36 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <BookOpen size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No courses yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Browse our Python courses and start learning today.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: EnrolledCourse }) {
  return (
    <Link
      href={`/dashboard/courses/${course.id}`}
      className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all"
    >
      {/* Thumbnail */}
      <div className="h-36 bg-gradient-to-br from-brand-500 to-brand-700 relative overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={36} className="text-white/60" />
          </div>
        )}
        {/* Progress pill */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {course.progress}%
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {course.completedLessons} / {course.totalLessons} lessons
        </p>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all"
            style={{ width: `${course.progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-brand-600 font-medium">
            {course.progress === 100 ? '✓ Completed' : 'Continue →'}
          </span>
          {course.lastWatchedAt && (
            <span className="text-xs text-gray-400">
              {new Date(course.lastWatchedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
