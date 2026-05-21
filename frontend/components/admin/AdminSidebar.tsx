'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { clsx } from 'clsx';
import {
  LayoutDashboard, BookOpen, Users, CreditCard,
  Award, Settings, GraduationCap, LogOut,
  BarChart2, FileText, ShieldCheck,
} from 'lucide-react';

const navItems = [
  { label: 'Overview',     href: '/admin',                icon: LayoutDashboard },
  { label: 'Courses',      href: '/admin/courses',        icon: BookOpen },
  { label: 'Students',     href: '/admin/students',       icon: Users },
  { label: 'Revenue',      href: '/admin/revenue',        icon: CreditCard },
  { label: 'Certificates', href: '/admin/certificates',   icon: Award },
  { label: 'Analytics',    href: '/admin/analytics',      icon: BarChart2 },
  { label: 'Blog',         href: '/admin/blog',           icon: FileText },
  { label: 'Settings',     href: '/admin/settings',       icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-40">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">Paython Academy</span>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
              <ShieldCheck size={10} /> {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </aside>
  );
}
