'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  User,
  LogOut,
  GraduationCap,
  BarChart2,
  Users,
  ShieldCheck,
} from 'lucide-react';

const studentNav = [
  { label: 'Dashboard',   href: '/dashboard',              icon: LayoutDashboard },
  { label: 'My Courses',  href: '/dashboard/courses',      icon: BookOpen },
  { label: 'Certificates',href: '/dashboard/certificates', icon: Trophy },
  { label: 'Profile',     href: '/dashboard/profile',      icon: User },
];

const adminNav = [
  { label: 'Overview',    href: '/admin',                  icon: BarChart2 },
  { label: 'Courses',     href: '/admin/courses',          icon: BookOpen },
  { label: 'Students',    href: '/admin/students',         icon: Users },
  { label: 'Certificates',href: '/admin/certificates',     icon: Trophy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const navItems = isAdmin ? adminNav : studentNav;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-40">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
            Paython<br />
            <span className="text-brand-600">Academy</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {isAdmin && (
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
            Admin Panel
          </p>
        )}
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}

        {/* Admin toggle link for super admins */}
        {user?.role === 'SUPER_ADMIN' && (
          <>
            <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
            <Link
              href={pathname.startsWith('/admin') ? '/dashboard' : '/admin'}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ShieldCheck size={18} />
              {pathname.startsWith('/admin') ? 'Student View' : 'Admin View'}
            </Link>
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-sm flex-shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              : user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
