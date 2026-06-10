'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, ShoppingCart, TrendingUp,
  Download, Search,
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  createdAt: string;
  status: string;
  user: { name: string; email: string };
  course: { title: string };
}

interface MonthlyData {
  month: string;
  revenue: number;
  count: number;
}

export default function AdminRevenuePage() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/revenue')
      .then(({ data }) => {
        setTotalRevenue(data.totalRevenue);
        setTotalSales(data.totalSales);
        setMonthlyData(data.monthlyData);
        setTransactions(data.recentTransactions);
        setFiltered(data.recentTransactions);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!search) { setFiltered(transactions); return; }
    setFiltered(transactions.filter((t) =>
      t.user.name.toLowerCase().includes(search.toLowerCase()) ||
      t.user.email.toLowerCase().includes(search.toLowerCase()) ||
      t.course.title.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, transactions]);

  const exportCsv = () => {
    const rows = [
      ['Date', 'Student', 'Email', 'Course', 'Amount', 'Status'],
      ...filtered.map((t) => [
        new Date(t.createdAt).toLocaleDateString(),
        t.user.name,
        t.user.email,
        t.course.title,
        `$${t.amount.toFixed(2)}`,
        t.status,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paython-revenue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const avgOrderValue = totalSales > 0
    ? (totalRevenue / totalSales).toFixed(2)
    : '0.00';

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          All transactions and earnings.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
          },
          {
            label: 'Total Sales',
            value: totalSales.toLocaleString(),
            icon: ShoppingCart,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
          },
          {
            label: 'Avg Order Value',
            value: `$${avgOrderValue}`,
            icon: TrendingUp,
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">
          Monthly Revenue
        </h2>
        <p className="text-sm text-gray-400 mb-6">Last 12 months</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyData}>
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

      {/* Transactions table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Transactions
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
              />
            </div>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {['Date', 'Student', 'Course', 'Amount', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {t.user.name}
                      </p>
                      <p className="text-xs text-gray-400">{t.user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400 max-w-xs">
                      <p className="truncate">{t.course.title}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-green-600">
                      +${t.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        t.status === 'completed'
                          ? 'text-green-700 bg-green-50 dark:bg-green-900/20'
                          : t.status === 'refunded'
                          ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          t.status === 'completed' ? 'bg-green-500'
                          : t.status === 'refunded' ? 'bg-red-500'
                          : 'bg-amber-500'
                        }`} />
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
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
