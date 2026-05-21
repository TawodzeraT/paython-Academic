'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { BookOpen, Star, Users, Clock, Search } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  subtitle: string | null;
  thumbnail: string | null;
  price: number;
  difficulty: string;
  duration: number | null;
  totalLessons: number;
  totalStudents: number;
  avgRating: number | null;
  totalReviews: number;
  tags: string[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/courses')
      .then(({ data }) => { setCourses(data.courses); setFiltered(data.courses); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let result = courses;
    if (search) result = result.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subtitle?.toLowerCase().includes(search.toLowerCase())
    );
    if (difficulty !== 'ALL') result = result.filter((c) => c.difficulty === difficulty);
    setFiltered(result);
  }, [search, difficulty, courses]);

  const difficulties = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Python Courses</h1>
          <p className="text-brand-200 text-lg mb-8">
            Learn Python from zero to production. Self-paced. No deadlines.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Level:</span>
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                difficulty === d
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-400'
              }`}
            >
              {d === 'ALL' ? 'All Levels' : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-400">
            {filtered.length} course{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-pulse">
                <div className="h-44 bg-gray-200 dark:bg-gray-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No courses found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const difficultyColor: Record<string, string> = {
    BEGINNER:     'text-green-600  bg-green-50  dark:bg-green-900/20  dark:text-green-400',
    INTERMEDIATE: 'text-amber-600  bg-amber-50  dark:bg-amber-900/20  dark:text-amber-400',
    ADVANCED:     'text-red-600    bg-red-50    dark:bg-red-900/20    dark:text-red-400',
  };

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="h-44 bg-gradient-to-br from-brand-500 to-brand-800 relative overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={40} className="text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColor[course.difficulty] ?? ''}`}>
          {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-2 mb-1">
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">{course.subtitle}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 flex-wrap">
          {course.avgRating && (
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <Star size={12} fill="currentColor" />
              {course.avgRating} ({course.totalReviews})
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users size={12} /> {course.totalStudents.toLocaleString()}
          </span>
          {course.duration && (
            <span className="flex items-center gap-1">
              <Clock size={12} /> {Math.round(course.duration / 60)}h
            </span>
          )}
          <span className="flex items-center gap-1">
            <BookOpen size={12} /> {course.totalLessons} lessons
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            ${course.price === 0 ? 'Free' : course.price.toFixed(2)}
          </span>
          <span className="text-sm text-brand-600 font-medium group-hover:underline">
            View course →
          </span>
        </div>
      </div>
    </Link>
  );
}
