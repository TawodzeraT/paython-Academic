'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import {
  Users, BookOpen, DollarSign, Award,
  TrendingUp, ArrowUpRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

interface Stats {
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  totalCertificates: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface TopCourse {
  id: string;
  title: string;
  students: number;
  revenue: number;
}

interface RecentPurchase {
  id: string;
  amount: number;
  createdAt: string;
  user: { name: string; email: string };
  course: { title: string };
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/overview')
      .then(({ data }) => {
        setStats(data.stats);
        setMonthlyRevenue(data.monthlyRevenue);
        setTopCourses(data.topCourses);
        setRecentPurchases(data.recentPurchases);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const statCards = [
    {
      label: 'Total Students',
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Total Revenue',
      value: stats?.totalRevenue ?? 0,
      icon: DollarSign,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
      format: (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      label: 'Active Courses',
      value: stats?.totalCourses ?? 0,
      icon: BookOpen,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Certificates Issued',
      value: stats?.totalCertificates ?? 0,
      icon: Award,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
      format: (v: number) => v.toLocaleString(),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Paython Academy at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, format }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{format(value)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Monthly Revenue</h2>
            <p className="text-sm text-gray-400 mt-0.5">Last 6 months</p>
          </div>
          <TrendingUp size={20} className="text-brand-600" />
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
              contentStyle={{
                background: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#f9fafb',
                fontSize: '13px',
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{ fill: '#4f46e5', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Top courses */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Top Courses</h2>
          {topCourses.length === 0 ? (
            <p className="text-gray-400 text-sm">No courses yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topCourses} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="title"
                  width={120}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + '…' : v}
                />
                <Tooltip
                  formatter={(value: number) => [value, 'Students']}
                  contentStyle={{
                    background: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f9fafb',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="students" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent purchases */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Sales</h2>
          </div>
          {recentPurchases.length === 0 ? (
            <p className="text-gray-400 text-sm">No purchases yet.</p>
          ) : (
            <div className="space-y-3">
              {recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-400 font-semibold text-xs flex-shrink-0">
                    {purchase.user.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {purchase.user.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{purchase.course.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-green-600">
                      +${purchase.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
