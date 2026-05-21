import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={17} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              Paython <span className="text-brand-600">Academy</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/courses" className="hover:text-gray-900 dark:hover:text-white transition-colors">Courses</Link>
            <Link href="/#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="/#faq" className="hover:text-gray-900 dark:hover:text-white transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 mt-auto">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                <GraduationCap size={14} className="text-white" />
              </div>
              <span className="font-bold text-white text-sm">Paython Academy</span>
            </div>
            <p className="text-sm leading-relaxed">
              Master Python programming and automation with self-paced courses.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Courses</p>
            <div className="space-y-2 text-sm">
              <Link href="/courses" className="block hover:text-white transition-colors">All Courses</Link>
              <Link href="/courses" className="block hover:text-white transition-colors">Python Fundamentals</Link>
              <Link href="/courses" className="block hover:text-white transition-colors">Advanced Python</Link>
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Company</p>
            <div className="space-y-2 text-sm">
              <Link href="/about" className="block hover:text-white transition-colors">About</Link>
              <Link href="/blog" className="block hover:text-white transition-colors">Blog</Link>
              <Link href="/contact" className="block hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Legal</p>
            <div className="space-y-2 text-sm">
              <Link href="/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-800 text-center text-sm">
          © {new Date().getFullYear()} Paython Academy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
