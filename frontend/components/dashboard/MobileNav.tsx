'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { clsx } from 'clsx';
import { Menu, X, GraduationCap, LayoutDashboard, BookOpen, Trophy, User, LogOut } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard },
  { label: 'My Courses',   href: '/dashboard/courses',      icon: BookOpen },
  { label: 'Certificates', href: '/dashboard/certificates', icon: Trophy },
  { label: 'Profile',      href: '/dashboard/profile',      icon: User },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={15} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm">Paython Academy</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-white dark:bg-gray-900 h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-white">Menu</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 font-semibold text-sm">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
