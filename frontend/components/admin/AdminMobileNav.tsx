'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { clsx } from 'clsx';
import {
  Menu, X, GraduationCap, LayoutDashboard, BookOpen,
  Users, CreditCard, Award, BarChart2, LogOut,
} from 'lucide-react';

const navItems = [
  { label: 'Overview',  href: '/admin',              icon: LayoutDashboard },
  { label: 'Courses',   href: '/admin/courses',      icon: BookOpen },
  { label: 'Students',  href: '/admin/students',     icon: Users },
  { label: 'Revenue',   href: '/admin/revenue',      icon: CreditCard },
  { label: 'Certificates', href: '/admin/certificates', icon: Award },
  { label: 'Analytics', href: '/admin/analytics',    icon: BarChart2 },
];

export default function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <>
      <header className="sticky top-0 z-30 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={15} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">Admin Panel</span>
        </Link>
        <button onClick={() => setOpen(true)} className="p-2 text-gray-400 hover:text-white">
          <Menu size={20} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-gray-900 h-full flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <span className="font-bold text-white">Admin Menu</span>
              <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <Icon size={17} /> {label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 py-4 border-t border-gray-800">
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/20 hover:text-red-400"
              >
                <LogOut size={17} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
