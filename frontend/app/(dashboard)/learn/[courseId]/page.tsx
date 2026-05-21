'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import PlayerSidebar from '@/components/player/PlayerSidebar';
import VideoPlayer from '@/components/player/VideoPlayer';
import LessonContent from '@/components/player/LessonContent';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

interface Attachment { id: string; name: string; url: string; size: number | null }
interface LessonProgress { completed: boolean; watchedSecs: number }
interface Quiz { id: string; title: string }

interface Lesson {
  id: string;
  title: string;
  videoUrl: string | null;
  content: string | null;
  duration: number | null;
  isFree: boolean;
  order: number;
  attachments: Attachment[];
  quiz: Quiz | null;
  progress: LessonProgress | null;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  modules: Module[];
}

export default function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completing, setCompleting] = useState(false);

  const allLessons = course?.modules.flatMap((m) => m.lessons) ?? [];
  const activeLessonIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = activeLessonIndex > 0 ? allLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex < allLessons.length - 1 ? allLessons[activeLessonIndex + 1] : null;

  useEffect(() => {
    api.get(`/api/courses/${courseId}/player`)
      .then(({ data }) => {
        setCourse(data.course);
        const firstIncomplete = data.course.modules
          .flatMap((m: Module) => m.lessons)
          .find((l: Lesson) => !l.progress?.completed);
        const lessonId = searchParams.get('lesson');
        const target = lessonId
          ? data.course.modules.flatMap((m: Module) => m.lessons).find((l: Lesson) => l.id === lessonId)
          : firstIncomplete ?? data.course.modules[0]?.lessons[0];
        setActiveLesson(target ?? null);
      })
      .catch(() => router.push('/dashboard/courses'))
      .finally(() => setIsLoading(false));
  }, [courseId, router, searchParams]);

  const selectLesson = useCallback((lesson: Lesson) => {
    setActiveLesson(lesson);
    setSidebarOpen(false);
    router.replace(`/learn/${courseId}?lesson=${lesson.id}`, { scroll: false });
  }, [courseId, router]);

  const markComplete = useCallback(async () => {
    if (!activeLesson || activeLesson.progress?.completed || completing) return;
    setCompleting(true);
    try {
      await api.patch(`/api/courses/lessons/${activeLesson.id}/progress`, {
        completed: true,
      });
      // Update local state
      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === activeLesson.id
                ? { ...l, progress: { completed: true, watchedSecs: l.duration ?? 0 } }
                : l
            ),
          })),
        };
      });
      setActiveLesson((prev) =>
        prev ? { ...prev, progress: { completed: true, watchedSecs: prev.duration ?? 0 } } : prev
      );
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  }, [activeLesson, completing]);

  const goNext = useCallback(() => {
    if (nextLesson) {
      markComplete().then(() => selectLesson(nextLesson));
    }
  }, [nextLesson, markComplete, selectLesson]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
    );
  }

  if (!course || !activeLesson) return null;

  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => l.progress?.completed).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 z-30">
        <button
          onClick={() => router.push('/dashboard/courses')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{course.title}</p>
          <p className="text-gray-400 text-xs">{completedLessons}/{totalLessons} lessons · {progress}%</p>
        </div>
        {/* Progress bar */}
        <div className="hidden sm:block w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">

          {/* Video */}
          {activeLesson.videoUrl && (
            <VideoPlayer
              url={activeLesson.videoUrl}
              onComplete={markComplete}
              lessonId={activeLesson.id}
            />
          )}

          {/* Lesson info */}
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">

            {/* Title + complete button */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-bold text-white">{activeLesson.title}</h1>
                {activeLesson.progress?.completed && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-green-400">
                    ✓ Completed
                  </span>
                )}
              </div>
              {!activeLesson.progress?.completed && (
                <button
                  onClick={markComplete}
                  disabled={completing}
                  className="flex-shrink-0 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  {completing ? 'Saving...' : 'Mark Complete'}
                </button>
              )}
            </div>

            <LessonContent lesson={activeLesson} />

            {/* Prev / Next */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-800">
              <button
                onClick={() => prevLesson && selectLesson(prevLesson)}
                disabled={!prevLesson}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                onClick={goNext}
                disabled={!nextLesson}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block w-80 border-l border-gray-800 overflow-y-auto bg-gray-900 flex-shrink-0">
          <PlayerSidebar
            course={course}
            activeLesson={activeLesson}
            onSelectLesson={selectLesson}
          />
        </div>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="relative ml-auto w-80 bg-gray-900 h-full overflow-y-auto shadow-xl">
              <PlayerSidebar
                course={course}
                activeLesson={activeLesson}
                onSelectLesson={(l) => { selectLesson(l); setSidebarOpen(false); }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
