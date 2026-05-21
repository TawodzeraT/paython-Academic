'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Search, ShieldOff, ShieldCheck, Users } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isBanned: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  _count: { purchases: number; certificates: number };
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/api/admin/students', {
        params: { page, limit: 20, search },
      });
      setStudents(data.students);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load students.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const toggleBan = async (userId: string, isBanned: boolean) => {
    try {
      const { data } = await api.patch(`/api/admin/students/${userId}/ban`);
      setStudents((prev) =>
        prev.map((s) => s.id === userId ? { ...s, isBanned: data.isBanned } : s)
      );
      toast.success(data.isBanned ? 'Student banned.' : 'Student unbanned.');
    } catch {
      toast.error('Failed to update student.');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{total.toLocaleString()} total students</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center">
            <Users size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-500">No students found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {['Student', 'Joined', 'Courses', 'Certificates', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-400 font-semibold text-sm flex-shrink-0">
                          {student.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-gray-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                      {student._count.purchases}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                      {student._count.certificates}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        student.isBanned
                          ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                          : student.isEmailVerified
                          ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          student.isBanned ? 'bg-red-500' : student.isEmailVerified ? 'bg-green-500' : 'bg-amber-500'
                        }`} />
                        {student.isBanned ? 'Banned' : student.isEmailVerified ? 'Active' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleBan(student.id, student.isBanned)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          student.isBanned
                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        {student.isBanned
                          ? <><ShieldCheck size={14} /> Unban</>
                          : <><ShieldOff size={14} /> Ban</>
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
