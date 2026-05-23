'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { CheckCircle, XCircle, Trophy, RotateCcw, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface Question {
  id: string;
  question: string;
  options: string[];
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

interface QuizResult {
  questionId: string;
  question: string;
  selected: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string | null;
}

interface SubmitResponse {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  results: QuizResult[];
}

interface BestAttempt {
  score: number;
  createdAt: string;
}

interface Props {
  lessonId: string;
  onComplete?: () => void;
}

export default function QuizPlayer({ lessonId, onComplete }: Props) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [bestAttempt, setBestAttempt] = useState<BestAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    api.get(`/api/quiz/lesson/${lessonId}`)
      .then(({ data }) => {
        setQuiz(data.quiz);
        setBestAttempt(data.bestAttempt);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [lessonId]);

  const selectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setIsSubmitting(true);
    try {
      const { data } = await api.post(`/api/quiz/${quiz.id}/submit`, { answers });
      setResult(data);
      if (data.passed && onComplete) onComplete();
    } catch {
      console.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setAnswers({});
    setCurrentQ(0);
    setStarted(false);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
        <div className="h-32 bg-gray-700 rounded" />
      </div>
    );
  }

  if (!quiz) return null;

  const question = quiz.questions[currentQ];
  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);
  const answeredCount = Object.keys(answers).length;

  // ── Start screen ─────────────────────────────────────────────────────────────
  if (!started && !result) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
        <Trophy size={40} className="mx-auto text-brand-400 mb-4" />
        <h3 className="text-white font-bold text-xl mb-2">{quiz.title}</h3>
        <p className="text-gray-400 text-sm mb-2">
          {quiz.questions.length} questions · Pass score: 70%
        </p>
        {bestAttempt && (
          <p className="text-green-400 text-sm mb-5">
            Best score: {Math.round(bestAttempt.score)}%
          </p>
        )}
        <button
          onClick={() => setStarted(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          {bestAttempt ? 'Retake Quiz' : 'Start Quiz'}
        </button>
      </div>
    );
  }

  // ── Results screen ────────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {/* Score header */}
        <div className={clsx(
          'p-8 text-center',
          result.passed
            ? 'bg-gradient-to-br from-green-900/60 to-green-800/20'
            : 'bg-gradient-to-br from-red-900/60 to-red-800/20'
        )}>
          {result.passed
            ? <CheckCircle size={48} className="mx-auto text-green-400 mb-3" />
            : <XCircle size={48} className="mx-auto text-red-400 mb-3" />
          }
          <p className="text-5xl font-bold text-white mb-1">{Math.round(result.score)}%</p>
          <p className={clsx(
            'text-lg font-semibold mb-1',
            result.passed ? 'text-green-400' : 'text-red-400'
          )}>
            {result.passed ? '🎉 Passed!' : 'Not passed — try again'}
          </p>
          <p className="text-gray-400 text-sm">
            {result.correct} of {result.total} correct
          </p>
        </div>

        {/* Answer review */}
        <div className="p-6 space-y-4">
          <h4 className="text-white font-semibold text-sm">Answer Review</h4>
          {result.results.map((r, idx) => (
            <div
              key={r.questionId}
              className={clsx(
                'rounded-xl border p-4',
                r.isCorrect
                  ? 'border-green-700 bg-green-900/10'
                  : 'border-red-700 bg-red-900/10'
              )}
            >
              <div className="flex items-start gap-2 mb-3">
                {r.isCorrect
                  ? <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  : <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                }
                <p className="text-gray-200 text-sm font-medium">
                  {idx + 1}. {r.question}
                </p>
              </div>

              {/* Show answer options */}
              <div className="ml-6 space-y-1.5">
                {quiz.questions.find((q) => q.id === r.questionId)?.options.map((opt, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'text-xs px-3 py-1.5 rounded-lg',
                      i === r.correctAnswer
                        ? 'bg-green-800/40 text-green-300 font-medium'
                        : i === r.selected && !r.isCorrect
                        ? 'bg-red-800/40 text-red-300 line-through'
                        : 'text-gray-500'
                    )}
                  >
                    {i === r.correctAnswer && '✓ '}{opt}
                  </div>
                ))}
              </div>

              {r.explanation && (
                <p className="ml-6 mt-2 text-xs text-gray-400 italic">
                  💡 {r.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-gray-300 border border-gray-600 hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={14} /> Retake
          </button>
          {result.passed && (
            <button
              onClick={onComplete}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors"
            >
              Continue <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Question screen ───────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      {/* Progress */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-xs">
            Question {currentQ + 1} of {quiz.questions.length}
          </p>
          <p className="text-gray-400 text-xs">{answeredCount} answered</p>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="px-6 py-4">
        <p className="text-white font-semibold text-base leading-snug mb-5">
          {question.question}
        </p>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((option, i) => {
            const selected = answers[question.id] === i;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(question.id, i)}
                className={clsx(
                  'w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all',
                  selected
                    ? 'border-brand-500 bg-brand-900/30 text-white font-medium'
                    : 'border-gray-600 text-gray-300 hover:border-gray-400 hover:bg-gray-700/50'
                )}
              >
                <span className={clsx(
                  'inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold mr-3 flex-shrink-0',
                  selected
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                )}>
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-5 flex items-center justify-between">
        <button
          onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
          disabled={currentQ === 0}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          ← Previous
        </button>

        {currentQ < quiz.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ((p) => p + 1)}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {isSubmitting ? 'Submitting...' : `Submit (${answeredCount}/${quiz.questions.length})`}
          </button>
        )}
      </div>
    </div>
  );
}
