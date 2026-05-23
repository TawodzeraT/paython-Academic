'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, ChevronDown, ChevronUp,
  Save, ArrowLeft, GripVertical, Eye, EyeOff,
} from 'lucide-react';

interface Attachment { id: string; name: string; url: string }
interface Lesson {
  id: string; title: string; description: string | null;
  videoUrl: string | null; content: string | null;
  duration: number | null; isFree: boolean; order: number;
  attachments: Attachment[];
}
interface Module {
  id: string; title: string; order: number; lessons: Lesson[];
}
interface Course {
  id: string; title: string; subtitle: string | null;
  description: string; price: number; difficulty: string;
  isPublished: boolean; tags: string[]; thumbnail: string | null;
  duration: number | null; modules: Module[];
}

export default function AdminCourseEditorPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'curriculum' | 'details'>('details');

  // Course form state
  const [form, setForm] = useState({
    title: '', subtitle: '', description: '',
    price: '', difficulty: 'BEGINNER', tags: '', thumbnail: '', duration: '',
  });

  useEffect(() => {
    api.get(`/api/courses/${courseId}/player`)
      .then(({ data }) => {
        const c = data.course;
        setCourse(c);
        setForm({
          title: c.title,
          subtitle: c.subtitle ?? '',
          description: c.description,
          price: String(c.price),
          difficulty: c.difficulty,
          tags: c.tags.join(', '),
          thumbnail: c.thumbnail ?? '',
          duration: c.duration ? String(c.duration) : '',
        });
        // Expand all modules by default
        setExpandedModules(new Set(c.modules.map((m: Module) => m.id)));
      })
      .catch(() => router.push('/admin/courses'))
      .finally(() => setIsLoading(false));
  }, [courseId, router]);

  const saveCourseDetails = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/admin/courses/${courseId}`, {
        ...form,
        price: parseFloat(form.price),
        duration: form.duration ? parseInt(form.duration) : null,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      toast.success('Course saved!');
    } catch {
      toast.error('Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    try {
      const { data } = await api.patch(`/api/admin/courses/${courseId}/publish`);
      setCourse((prev) => prev ? { ...prev, isPublished: data.isPublished } : prev);
      toast.success(data.isPublished ? 'Course published!' : 'Course unpublished.');
    } catch {
      toast.error('Failed to update publish status.');
    }
  };

  const addModule = async () => {
    const title = prompt('Module title:');
    if (!title?.trim()) return;
    try {
      const { data } = await api.post(`/api/admin/courses/${courseId}/modules`, { title });
      setCourse((prev) => prev ? {
        ...prev,
        modules: [...prev.modules, { ...data.module, lessons: [] }],
      } : prev);
      setExpandedModules((prev) => new Set([...prev, data.module.id]));
      toast.success('Module added!');
    } catch {
      toast.error('Failed to add module.');
    }
  };

  const addLesson = async (moduleId: string) => {
    const title = prompt('Lesson title:');
    if (!title?.trim()) return;
    try {
      const { data } = await api.post(`/api/admin/modules/${moduleId}/lessons`, { title });
      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId
              ? { ...m, lessons: [...m.lessons, data.lesson] }
              : m
          ),
        };
      });
      setExpandedLessons((prev) => new Set([...prev, data.lesson.id]));
      toast.success('Lesson added!');
    } catch {
      toast.error('Failed to add lesson.');
    }
  };

  const saveLesson = async (lessonId: string, lessonData: Partial<Lesson>) => {
    try {
      await api.patch(`/api/admin/lessons/${lessonId}`, lessonData);
      toast.success('Lesson saved!');
    } catch {
      toast.error('Failed to save lesson.');
    }
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/api/admin/lessons/${lessonId}`);
      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId
              ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
              : m
          ),
        };
      });
      toast.success('Lesson deleted.');
    } catch {
      toast.error('Failed to delete lesson.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-7 w-7 text-brand-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/courses')}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {course.title}
            </h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              course.isPublished
                ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                : 'text-gray-500 bg-gray-100 dark:bg-gray-800'
            }`}>
              {course.isPublished ? '● Published' : '○ Draft'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePublish}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              course.isPublished
                ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                : 'border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          >
            {course.isPublished ? <><EyeOff size={15}/> Unpublish</> : <><Eye size={15}/> Publish</>}
          </button>
          <button
            onClick={saveCourseDetails}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {(['details', 'curriculum'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {activeTab === 'details' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[
              { label: 'Course Title', key: 'title', placeholder: 'Python Fundamentals Bootcamp' },
              { label: 'Subtitle', key: 'subtitle', placeholder: 'A brief tagline' },
              { label: 'Thumbnail URL', key: 'thumbnail', placeholder: 'https://...' },
              { label: 'Price ($)', key: 'price', placeholder: '49.99', type: 'number' },
              { label: 'Duration (minutes)', key: 'duration', placeholder: '600', type: 'number' },
              { label: 'Tags (comma-separated)', key: 'tags', placeholder: 'python, beginner' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {label}
                </label>
                <input
                  type={type ?? 'text'}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={16}
              placeholder="Describe what students will learn..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
        </div>
      )}

      {/* Curriculum tab */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {course.modules.length} modules ·{' '}
              {course.modules.reduce((a, m) => a + m.lessons.length, 0)} lessons
            </p>
            <button
              onClick={addModule}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} /> Add Module
            </button>
          </div>

          {course.modules.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-16 text-center">
              <p className="text-gray-400 mb-3">No modules yet</p>
              <button
                onClick={addModule}
                className="text-sm text-brand-600 hover:underline font-medium"
              >
                Add your first module →
              </button>
            </div>
          ) : (
            course.modules.map((module, mIdx) => (
              <ModuleEditor
                key={module.id}
                module={module}
                index={mIdx}
                isExpanded={expandedModules.has(module.id)}
                expandedLessons={expandedLessons}
                onToggleModule={() =>
                  setExpandedModules((prev) => {
                    const next = new Set(prev);
                    next.has(module.id) ? next.delete(module.id) : next.add(module.id);
                    return next;
                  })
                }
                onToggleLesson={(lessonId) =>
                  setExpandedLessons((prev) => {
                    const next = new Set(prev);
                    next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId);
                    return next;
                  })
                }
                onAddLesson={() => addLesson(module.id)}
                onSaveLesson={saveLesson}
                onDeleteLesson={(lessonId) => deleteLesson(module.id, lessonId)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Module Editor Component ──────────────────────────────────────────────────
interface ModuleEditorProps {
  module: Module;
  index: number;
  isExpanded: boolean;
  expandedLessons: Set<string>;
  onToggleModule: () => void;
  onToggleLesson: (lessonId: string) => void;
  onAddLesson: () => void;
  onSaveLesson: (lessonId: string, data: Partial<Lesson>) => void;
  onDeleteLesson: (lessonId: string) => void;
}

function ModuleEditor({
  module, index, isExpanded, expandedLessons,
  onToggleModule, onToggleLesson,
  onAddLesson, onSaveLesson, onDeleteLesson,
}: ModuleEditorProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Module header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 dark:bg-gray-800/50">
        <GripVertical size={16} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
        <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <p className="flex-1 font-semibold text-gray-900 dark:text-white text-sm">{module.title}</p>
        <span className="text-xs text-gray-400">{module.lessons.length} lessons</span>
        <button
          onClick={onToggleModule}
          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Lessons */}
      {isExpanded && (
        <div>
          {module.lessons.map((lesson) => (
            <LessonEditor
              key={lesson.id}
              lesson={lesson}
              isExpanded={expandedLessons.has(lesson.id)}
              onToggle={() => onToggleLesson(lesson.id)}
              onSave={(data) => onSaveLesson(lesson.id, data)}
              onDelete={() => onDeleteLesson(lesson.id)}
            />
          ))}

          {/* Add lesson button */}
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={onAddLesson}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <Plus size={15} /> Add lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Lesson Editor Component ──────────────────────────────────────────────────
interface LessonEditorProps {
  lesson: Lesson;
  isExpanded: boolean;
  onToggle: () => void;
  onSave: (data: Partial<Lesson>) => void;
  onDelete: () => void;
}

function LessonEditor({ lesson, isExpanded, onToggle, onSave, onDelete }: LessonEditorProps) {
  const [form, setForm] = useState({
    title: lesson.title,
    description: lesson.description ?? '',
    videoUrl: lesson.videoUrl ?? '',
    content: lesson.content ?? '',
    duration: lesson.duration ? String(lesson.duration) : '',
    isFree: lesson.isFree,
  });

  const handleSave = () => {
    onSave({
      ...form,
      duration: form.duration ? parseInt(form.duration) : null,
    });
  };

  return (
    <div className="border-t border-gray-100 dark:border-gray-800">
      {/* Lesson row */}
      <div
        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{form.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {form.videoUrl && <span className="text-xs text-gray-400">📹 Video</span>}
            {form.content && <span className="text-xs text-gray-400">📝 Content</span>}
            {form.isFree && <span className="text-xs text-green-600 font-medium">Free preview</span>}
            {form.duration && (
              <span className="text-xs text-gray-400">
                {Math.floor(parseInt(form.duration) / 60)}:{String(parseInt(form.duration) % 60).padStart(2,'0')}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
        {isExpanded ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
      </div>

      {/* Lesson form */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
          <div className="grid sm:grid-cols-2 gap-4 pt-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Lesson Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Video URL (Mux / Vimeo)
              </label>
              <input
                type="text"
                value={form.videoUrl}
                placeholder="https://..."
                onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={form.duration}
                placeholder="e.g. 720"
                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <div
                onClick={() => setForm((p) => ({ ...p, isFree: !p.isFree }))}
                className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative flex-shrink-0 ${
                  form.isFree ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.isFree ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </div>
              <label className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                onClick={() => setForm((p) => ({ ...p, isFree: !p.isFree }))}>
                Free preview lesson
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              placeholder="Brief lesson description"
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Lesson Content (Markdown)
            </label>
            <textarea
              rows={8}
              value={form.content}
              placeholder="# Lesson content in Markdown..."
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            
import { useRouter } from 'next/navigation';

// Inside LessonEditor, add router:
const router = useRouter();

// Replace the save button div at the bottom with:
<div className="flex items-center justify-between">
  <button
    onClick={() => router.push(`/admin/courses/${lesson.moduleId}/quiz/${lesson.id}`)}
    className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-4 py-2 rounded-lg transition-colors"
  >
    🧠 {lesson.quiz ? 'Edit Quiz' : 'Add Quiz'}
  </button>
  <button
    onClick={handleSave}
    className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
  >
    <Save size={14} /> Save Lesson
  </button>
</div>
         
