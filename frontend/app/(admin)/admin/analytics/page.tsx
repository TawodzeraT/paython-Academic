'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react';

interface MonthlyData {
  month: string;
  revenue: number;
  count: number;
}

interface TopCourse {
  title: string;
  students: number;
  revenue: number;
}

interface Stats {
  totalStudents: number;
  totalRevenue: number;
  totalCourses: number;
  totalCertificates: number;
}

const COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669'];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [revenueData, setRevenueData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/overview'),
      api.get('/api/admin/revenue'),
    ])
      .then(([overview, revenue]) => {
        setStats(overview.data.stats);
        setMonthlyData(overview.data.monthlyRevenue);
        setTopCourses(overview.data.topCourses);
        setRevenueData(revenue.data.monthlyData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const pieData = topCourses.map((c) => ({
    name: c.title.length > 20 ? c.title.slice(0, 20) + '…' : c.title,
    value: c.students,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Full platform performance breakdown.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students',      value: stats?.totalStudents ?? 0,      icon: Users,     color: 'text-blue-600   bg-blue-50   dark:bg-blue-900/20',   fmt: (v: number) => v.toLocaleString() },
          { label: 'Total Revenue',       value: stats?.totalRevenue ?? 0,       icon: TrendingUp, color: 'text-green-600  bg-green-50  dark:bg-green-900/20',  fmt: (v: number) => `$${v.toFixed(2)}` },
          { label: 'Active Courses',      value: stats?.totalCourses ?? 0,       icon: BookOpen,  color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', fmt: (v: number) => v.toLocaleString() },
          { label: 'Certificates Issued', value: stats?.totalCertificates ?? 0,  icon: Award,     color: 'text-amber-600  bg-amber-50  dark:bg-amber-900/20',  fmt: (v: number) => v.toLocaleString() },
        ].map(({ label, value, icon: Icon, color, fmt }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(value)}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue over 12 months */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Revenue (12 months)</h2>
        <p className="text-sm text-gray-400 mb-6">Monthly revenue trend</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
              contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb', fontSize: '13px' }}
            />
            <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} dot={{ fill: '#4f46e5', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Sales count per month */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Sales Volume</h2>
          <p className="text-sm text-gray-400 mb-6">Number of purchases per month</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [value, 'Sales']}
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb', fontSize: '13px' }}
              />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Student distribution by course */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Students by Course</h2>
          <p className="text-sm text-gray-400 mb-6">Enrollment distribution</p>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No enrollment data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, 'Students']}
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb', fontSize: '13px' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top courses table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Top Courses by Revenue</h2>
        </div>
        {topCourses.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No data yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {['Course', 'Students', 'Revenue', 'Avg per student'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topCourses.map((course, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{course.title}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{course.students.toLocaleString()}</td>
                    <td className="px-6 py-4 text-green-600 font-medium">${course.revenue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      ${course.students > 0 ? (course.revenue / course.students).toFixed(2) : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
