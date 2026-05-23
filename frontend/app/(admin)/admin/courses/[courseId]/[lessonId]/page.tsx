'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft, Save, GripVertical } from 'lucide-react';

interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  order: number;
}

interface ExistingQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

const emptyQuestion = (): QuizQuestion => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: '',
  order: 0,
});

export default function QuizBuilderPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<ExistingQuiz | null>(null);
  const [title, setTitle] = useState('Lesson Quiz');
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/api/quiz/lesson/${lessonId}`)
      .then(({ data }) => {
        setQuiz(data.quiz);
        setTitle(data.quiz.title);
        setQuestions(data.quiz.questions);
      })
      .catch(() => {
        // No quiz yet — start fresh
      })
      .finally(() => setIsLoading(false));
  }, [lessonId]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { ...emptyQuestion(), order: prev.length + 1 },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error('Quiz must have at least one question.');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: unknown) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      const opts = [...next[qIndex].options];
      opts[oIndex] = value;
      next[qIndex] = { ...next[qIndex], options: opts };
      return next;
    });
  };

  const validate = (): boolean => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is missing the question text.`);
        return false;
      }
      if (q.options.some((o) => !o.trim())) {
        toast.error(`Question ${i + 1} has empty options.`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        title,
        questions: questions.map((q, idx) => ({ ...q, order: idx + 1 })),
      };

      if (quiz) {
        await api.patch(`/api/quiz/${quiz.id}`, payload);
        toast.success('Quiz updated!');
      } else {
        const { data } = await api.post(`/api/quiz/lesson/${lessonId}/create`, payload);
        setQuiz(data.quiz);
        toast.success('Quiz created!');
      }
    } catch {
      toast.error('Failed to save quiz.');
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/courses/${courseId}`)}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {quiz ? 'Edit Quiz' : 'Create Quiz'}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {questions.length} question{questions.length !== 1 ? 's' : ''} · Pass score: 70%
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Save size={15} /> {saving ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>

      {/* Quiz title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Quiz Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, qIdx) => (
          <div
            key={qIdx}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            {/* Question header */}
            <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <GripVertical size={15} className="text-gray-300 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1">
                Question {qIdx + 1}
              </span>
              <button
                onClick={() => removeQuestion(qIdx)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* Question text */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Question
                </label>
                <textarea
                  rows={2}
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                  placeholder="Enter your question..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              {/* Answer options */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Options — click the circle to mark correct answer
                </label>
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-3">
                      {/* Correct answer selector */}
                      <button
                        onClick={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors text-xs font-bold ${
                          q.correctAnswer === oIdx
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-green-400'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </button>

                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        className={`flex-1 px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${
                          q.correctAnswer === oIdx
                            ? 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Explanation (shown after answer) — optional
                </label>
                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(qIdx, 'explanation', e.target.value)}
                  placeholder="Why is this the correct answer?"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add question */}
      <button
        onClick={addQuestion}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brand-400 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-sm font-medium"
      >
        <Plus size={16} /> Add Question
      </button>
    </div>
  );
}
