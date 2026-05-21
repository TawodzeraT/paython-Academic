'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  price: number;
  difficulty: string;
  isPublished: boolean;
  modules: number;
  students: number;
  revenue: number;
  createdAt: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    api.get('/api/admin/courses')
      .then(({ data }) => setCourses(data.courses))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const togglePublish = async (courseId: string) => {
    try {
      const { data } = await api.patch(`/api/admin/courses/${courseId}/publish`);
      setCourses((prev) =>
        prev.map((c) => c.id === courseId ? { ...c, isPublished: data.isPublished } : c)
      );
      toast.success(data.isPublished ? 'Course published!' : 'Course unpublished.');
    } catch {
      toast.error('Failed to update course.');
    }
  };

  const deleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast.success('Course deleted.');
    } catch {
      toast.error('Failed to delete course.');
    }
  };

  const difficultyColor: Record<string, string> = {
    BEGINNER: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    INTERMEDIATE: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    ADVANCED: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{courses.length} total courses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Course
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="p-16 text-center">
            <BookOpen size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-500">No courses yet. Create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {['Course', 'Difficulty', 'Price', 'Students', 'Revenue', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{course.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{course.modules} modules</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[course.difficulty]}`}>
                        {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                      ${course.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                      {course.students.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-green-600 font-medium">
                      ${course.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        course.isPublished
                          ? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                          : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => togglePublish(course.id)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                          title={course.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {course.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id, course.title)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
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

      {/* Create course modal */}
      {showModal && (
        <CreateCourseModal
          onClose={() => setShowModal(false)}
          onCreated={() => { fetchCourses(); setShowModal(false); }}
        />
      )}
    </div>
  );
}

function CreateCourseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: '', subtitle: '', description: '',
    price: '', difficulty: 'BEGINNER', tags: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.price) {
      toast.error('Please fill in all required fields.'); return;
    }
    setIsLoading(true);
    try {
      await api.post('/api/admin/courses', {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      toast.success('Course created!');
      onCreated();
    } catch {
      toast.error('Failed to create course.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Create New Course</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: 'Title *', key: 'title', placeholder: 'Python Fundamentals Bootcamp' },
            { label: 'Subtitle', key: 'subtitle', placeholder: 'A brief tagline for the course' },
            { label: 'Price ($) *', key: 'price', placeholder: '49.99', type: 'number' },
            { label: 'Tags (comma-separated)', key: 'tags', placeholder: 'python, beginner, automation' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
              <input
                type={type ?? 'text'}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
            <textarea
              rows={4}
              placeholder="What will students learn in this course?"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
}
