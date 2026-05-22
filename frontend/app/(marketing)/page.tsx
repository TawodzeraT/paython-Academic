import Link from 'next/link';
import { BookOpen, Award, Clock, Users, Star, CheckCircle, Zap, Code2, TrendingUp } from 'lucide-react';

const courses = [
  {
    title: 'Python Fundamentals Bootcamp',
    subtitle: 'Go from zero to confident Python developer',
    difficulty: 'BEGINNER',
    lessons: 48,
    price: 49,
  },
  {
    title: 'Advanced Python Engineering',
    subtitle: 'Master OOP, async, decorators and more',
    difficulty: 'ADVANCED',
    lessons: 62,
    price: 79,
  },
  {
    title: 'Making Money with Python',
    subtitle: 'Build income streams through automation',
    difficulty: 'INTERMEDIATE',
    lessons: 55,
    price: 69,
  },
];

const testimonials = [
  {
    name: 'Marcus T.',
    role: 'Freelance Developer',
    text: 'I landed my first freelance Python contract within 3 months of finishing the course. The hands-on projects made all the difference.',
    rating: 5,
  },
  {
    name: 'Priya S.',
    role: 'Data Analyst',
    text: 'The course pace was perfect. I could learn after work at my own speed without feeling rushed. Highly recommend.',
    rating: 5,
  },
  {
    name: 'Jake M.',
    role: 'Software Engineer',
    text: 'Best Python course I\'ve taken. The automation section alone is worth the price. Clear, practical, no fluff.',
    rating: 5,
  },
];

const benefits = [
  { icon: Code2,      title: 'Real-world projects',      desc: 'Build actual Python scripts, automation tools, and apps you can show employers.' },
  { icon: Clock,      title: 'Learn at your pace',        desc: 'No live sessions, no deadlines. Watch and rewatch lessons whenever you want.' },
  { icon: Award,      title: 'Earn certificates',         desc: 'Verifiable certificates you can share on LinkedIn and your portfolio.' },
  { icon: Zap,        title: 'Instant access',            desc: 'Start learning the moment you enroll. No waiting, no scheduling.' },
  { icon: TrendingUp, title: 'Career-focused content',    desc: 'Learn skills employers are actively hiring for right now.' },
  { icon: Users,      title: 'Growing community',         desc: 'Join thousands of Python learners on the same journey.' },
];

const difficultyColor: Record<string, string> = {
  BEGINNER:     'text-green-600 bg-green-50',
  INTERMEDIATE: 'text-amber-600 bg-amber-50',
  ADVANCED:     'text-red-600 bg-red-50',
};

const faqs = [
  {
    q: 'Do I need prior coding experience?',
    a: 'No. The Python Fundamentals Bootcamp starts from absolute zero. No experience required.',
  },
  {
    q: 'How long do I have access?',
    a: 'Lifetime access. Pay once and revisit the course content anytime, including future updates.',
  },
  {
    q: 'What if I want a refund?',
    a: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, email us for a full refund.',
  },
  {
    q: 'Will I get a certificate?',
    a: 'Yes. You receive a verifiable certificate with a unique URL when you complete the course.',
  },
  {
    q: 'Can I learn on mobile?',
    a: 'Yes. The platform is fully responsive and works on any device.',
  },
];

export default function HomePage() {
  return (
    <div className="bg-white dark:bg-gray-950">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-brand-950 to-gray-900 py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-800/20 via-transparent to-transparent" />

        {/* Floating code decoration */}
        <div className="absolute right-10 top-20 hidden lg:block opacity-20 font-mono text-xs text-brand-300 leading-loose select-none">
          <div>def learn_python():</div>
          <div>&nbsp;&nbsp;skills = []</div>
          <div>&nbsp;&nbsp;for lesson in course:</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;skills.append(lesson)</div>
          <div>&nbsp;&nbsp;return skills</div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-900/60 border border-brand-700/50 text-brand-300 text-xs font-medium px-4 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Self-paced · Start today · No expiry
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Master Python.<br />
            <span className="text-brand-400">Build your future.</span>
          </h1>

          <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Learn Python programming and automation through practical, self-paced courses.
            Go from beginner to job-ready at your own speed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/courses"
              className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-brand-600/30"
            >
              Browse Courses →
            </Link>
            <Link
              href="/register"
              className="text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 px-8 py-4 rounded-xl text-base transition-colors"
            >
              Create Free Account
            </Link>
          </div>

          {/* Social proof bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Users size={15} className="text-brand-400" /> 2,000+ students
            </span>
            <span className="flex items-center gap-1.5">
              <Star size={15} className="text-amber-400 fill-amber-400" /> 4.9 average rating
            </span>
            <span className="flex items-center gap-1.5">
              <Award size={15} className="text-brand-400" /> Verifiable certificates
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={15} className="text-green-400" /> 30-day money-back
            </span>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Python courses for every level
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Whether you&apos;re starting from zero or levelling up, we have a course for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.title}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-40 bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center">
                  <Code2 size={40} className="text-white/40" />
                </div>
                <div className="p-5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColor[course.difficulty]}`}>
                    {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
                  </span>
                  <h3 className="font-bold text-gray-900 dark:text-white mt-3 mb-1 text-base leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{course.subtitle}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <BookOpen size={12} /> {course.lessons} lessons
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">${course.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:underline"
            >
              View all courses →
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Why Paython Academy?
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Everything you need to go from zero to Python developer.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-800 transition-colors"
              >
                <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={20} className="text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Students who made the leap
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating }) => (
              <div key={name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  &ldquo;{text}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Simple, one-time pricing
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-12">
            Pay once. Own the course forever. No subscriptions.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.title}
                className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 hover:border-brand-400 dark:hover:border-brand-600 p-6 transition-all hover:shadow-lg"
              >
                <p className="font-bold text-gray-900 dark:text-white mb-1 text-sm leading-snug">
                  {course.title}
                </p>
                <p className="text-3xl font-bold text-brand-600 my-4">${course.price}</p>
                <div className="space-y-2 mb-6 text-left">
                  {['Lifetime access', `${course.lessons} lessons`, 'Certificate', 'All updates'].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
                <Link
                  href="/courses"
                  className="block w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-lg text-center transition-colors"
                >
                  Enroll Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <p className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{q}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-brand-600 to-brand-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start learning Python?
          </h2>
          <p className="text-brand-200 text-lg mb-8">
            Join thousands of students already building with Python.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition-colors text-base shadow-lg"
          >
            Browse Courses →
          </Link>
        </div>
      </section>
    </div>
  );
}
