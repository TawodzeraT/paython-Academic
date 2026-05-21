'use client';

import { clsx } from 'clsx';
import { CheckCircle, Circle, PlayCircle, FileText, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Lesson {
  id: string;
  title: string;
  duration: number | null;
  videoUrl: string | null;
  quiz: { id: string } | null;
  progress: { completed: boolean } | null;
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

interface Props {
  course: Course;
  activeLesson: Lesson;
  onSelectLesson: (lesson: Lesson) => void;
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerSidebar({ course, activeLesson, onSelectLesson }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (moduleId: string) =>
    setCollapsed((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));

  const totalLessons = course.modules.flatMap((m) => m.lessons).length;
  const completedLessons = course.modules
    .flatMap((m) => m.lessons)
    .filter((l) => l.progress?.completed).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <p className="text-white font-semibold text-sm">Course Content</p>
        <p className="text-gray-400 text-xs mt-1">
          {completedLessons}/{totalLessons} completed
        </p>
        <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${Math.round((completedLessons / totalLessons) * 100)}%` }}
          />
        </div>
      </div>

      {/* Modules */}
      <div className="flex-1 overflow-y-auto">
        {course.modules.map((module) => {
          const isCollapsed = collapsed[module.id];
          const moduleCompleted = module.lessons.every((l) => l.progress?.completed);
          const moduleProgress = module.lessons.filter((l) => l.progress?.completed).length;

          return (
            <div key={module.id} className="border-b border-gray-800">
              {/* Module header */}
              <button
                onClick={() => toggle(module.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={clsx(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0',
                    moduleCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  )}>
                    {moduleCompleted ? '✓' : module.order}
                  </span>
                  <div className="min-w-0">
                    <p className="text-gray-200 text-sm font-medium truncate">{module.title}</p>
                    <p className="text-gray-500 text-xs">
                      {moduleProgress}/{module.lessons.length} lessons
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={clsx(
                    'text-gray-500 flex-shrink-0 transition-transform',
                    isCollapsed && '-rotate-90'
                  )}
                />
              </button>

              {/* Lessons */}
              {!isCollapsed && (
                <div>
                  {module.lessons.map((lesson) => {
                    const isActive = lesson.id === activeLesson.id;
                    const isDone = lesson.progress?.completed;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson)}
                        className={clsx(
                          'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                          isActive
                            ? 'bg-brand-900/30 border-l-2 border-brand-500'
                            : 'border-l-2 border-transparent hover:bg-gray-800/40'
                        )}
                      >
                        {/* Status icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {isDone ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : isActive ? (
                            <PlayCircle size={16} className="text-brand-400" />
                          ) : lesson.videoUrl ? (
                            <Circle size={16} className="text-gray-600" />
                          ) : (
                            <FileText size={16} className="text-gray-600" />
                          )}
                        </div>

                        {/* Lesson info */}
                        <div className="flex-1 min-w-0">
                          <p className={clsx(
                            'text-sm leading-snug line-clamp-2',
                            isActive ? 'text-white font-medium' : isDone ? 'text-gray-400' : 'text-gray-300'
                          )}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.duration && (
                              <span className="text-xs text-gray-500">
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                            {lesson.quiz && (
                              <span className="text-xs bg-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded">
                                Quiz
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
