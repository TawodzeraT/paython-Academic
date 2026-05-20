'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { BookOpen, Search } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  thumbnail: string | null;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: string;
  duration: number | null;
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/student/courses')
      .then(({ data }) => { setCourses(data.courses); setFiltered(data.courses); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let result = courses;
    if (search) {
      result = result.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (filter === 'in-progress') result = result.filter((c) => c.progress > 0 && c.progress < 100);
    if (filter === 'completed') result = result.filter((c) => c.progress === 100);
    setFiltered(result);
  }, [search, filter, courses]);

  const filterButtons: { label: string; value: typeof filter }[] = [
    { label: 'All',         value: 'all' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed',   value: 'completed' },
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">All your enrolled courses in one place.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-2">
          {filterButtons.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-16 text-center">
          <BookOpen size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No courses found</h3>
          <p className="text-gray-500 text-sm mb-4">
            {search ? 'Try a different search term.' : "You haven't enrolled in any courses yet."}
          </p>
          {!search && (
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Browse Courses
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <Link
              key={course.id}
              href={`/learn/${course.id}`}
              className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all"
            >
              <div className="h-40 bg-gradient-to-br from-brand-500 to-brand-700 relative">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={32} className="text-white/50" />
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 text-xs font-medium px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-300">
                  {course.difficulty}
                </span>
                {course.progress === 100 && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    ✓ Done
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-brand-600 transition-colors line-clamp-2 mb-1">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-400">
                  {course.completedLessons}/{course.totalLessons} lessons
                  {course.duration && ` · ${Math.round(course.duration / 60)}h`}
                </p>
                <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-brand-600 font-medium">
                  {course.progress === 0 ? 'Start course →'
                    : course.progress === 100 ? 'Review course →'
                    : `${course.progress}% complete →`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
