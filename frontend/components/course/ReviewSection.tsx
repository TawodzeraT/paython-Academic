'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string; avatar: string | null };
}

interface Props {
  courseId: string;
  enrolled: boolean;
}

export default function ReviewSection({ courseId, enrolled }: Props) {
  const { isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/api/reviews/${courseId}`)
      .then(({ data }) => {
        setReviews(data.reviews);
        setAvgRating(data.avgRating);
        setUserReview(data.userReview);
        if (data.userReview) {
          setForm({ rating: data.userReview.rating, comment: data.userReview.comment ?? '' });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [courseId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/reviews/${courseId}`, form);
      setUserReview(data.review);
      setReviews((prev) => {
        const existing = prev.findIndex((r) => r.id === data.review.id);
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = data.review;
          return next;
        }
        return [data.review, ...prev];
      });
      setShowForm(false);
      toast.success('Review submitted!');
    } catch {
      toast.error('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="h-24 bg-gray-800 rounded-xl animate-pulse" />;
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold">Student Reviews</h3>
          {avgRating > 0 && (
            <span className="flex items-center gap-1 text-amber-400 text-sm font-medium">
              <Star size={14} fill="currentColor" />
              {avgRating} ({reviews.length})
            </span>
          )}
        </div>
        {enrolled && isAuthenticated && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-brand-400 hover:text-brand-300 border border-brand-800 hover:border-brand-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            {userReview ? 'Edit Review' : '+ Write Review'}
          </button>
        )}
      </div>

      {/* Write / edit form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
          <div>
            <p className="text-gray-300 text-sm font-medium mb-2">Your Rating</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setForm((p) => ({ ...p, rating: s }))}>
                  <Star
                    size={24}
                    className={s <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-300 text-sm font-medium mb-2">Comment (optional)</p>
            <textarea
              rows={3}
              value={form.comment}
              onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
              placeholder="Share your experience with this course..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-600 bg-gray-900 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <Star size={28} className="mx-auto text-gray-600 mb-2" />
          <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand-900/40 flex items-center justify-center text-brand-400 font-semibold text-sm flex-shrink-0">
                  {review.user.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-gray-200 text-sm font-medium">{review.user.name}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={11}
                        className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}
                      />
                    ))}
                  </div>
                </div>
                <span className="ml-auto text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-gray-400 text-sm leading-relaxed ml-11">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
