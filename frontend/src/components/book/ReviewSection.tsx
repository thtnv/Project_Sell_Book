"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Star, StarHalf, Loader2, Send, Edit2, Trash2, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getBookReviews,
  getBookRatingSummary,
  createReview,
  updateReview,
  deleteReview,
  ReviewResponse,
  BookRatingSummary,
  ReviewCreate,
} from '@/api/review';

interface ReviewSectionProps {
  bookId: string;
}

const ReviewSection = ({ bookId }: ReviewSectionProps) => {
  const { user, isAuthenticated } = useAuth();
  
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [summary, setSummary] = useState<BookRatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Load reviews and summary
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [reviewsData, summaryData] = await Promise.all([
        getBookReviews(bookId),
        getBookRatingSummary(bookId),
      ]);
      
      setReviews(reviewsData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err instanceof Error ? err.message : 'Lỗi tải đánh giá');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đánh giá');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (editingReview) {
        // Update existing review
        await updateReview(editingReview.review_id, {
          rating,
          comment: comment.trim() || undefined,
        });
        alert('Cập nhật đánh giá thành công!');
      } else {
        // Create new review
        const reviewData: ReviewCreate = {
          book_id: bookId,
          rating,
          comment: comment.trim() || undefined,
        };
        await createReview(reviewData);
        alert('Gửi đánh giá thành công!');
      }
      
      // Reset form
      setRating(5);
      setComment('');
      setEditingReview(null);
      
      // Reload reviews
      loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review: ReviewResponse) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment || '');
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Xác nhận xóa đánh giá này?')) return;

    try {
      await deleteReview(reviewId);
      alert('Xóa đánh giá thành công!');
      loadReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa đánh giá thất bại');
    }
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setRating(5);
    setComment('');
  };

  // Check if current user already reviewed
  const userReview = reviews.find(r => r.user_id === user?.id);
  const canReview = isAuthenticated && !userReview;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#0F9D58]" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl mt-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
        Đánh giá sách
      </h2>

      {/* Rating Summary */}
      {summary && summary.total_reviews > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#0F9D58] mb-2">
                {summary.average_rating.toFixed(1)}
              </div>
              <div className="flex gap-1 mb-2">
                {renderStars(summary.average_rating)}
              </div>
              <div className="text-sm text-gray-600">
                {summary.total_reviews} đánh giá
              </div>
            </div>
            
            <div className="flex-1 w-full">
              {[5, 4, 3, 2, 1].map(star => {
                const count = summary.rating_distribution[`${star}_star`] || 0;
                const percentage = summary.total_reviews > 0 
                  ? (count / summary.total_reviews) * 100 
                  : 0;
                
                return (
                  <div key={star} className="flex items-center gap-2 mb-2">
                    <span className="text-sm w-12">{star} sao</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm w-12 text-right text-gray-600">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {(canReview || editingReview) && (
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {editingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Đánh giá</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={
                        star <= (hoveredStar || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">
                Nhận xét (không bắt buộc)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về cuốn sách..."
                disabled={submitting}
                maxLength={1000}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none resize-none disabled:opacity-50"
              />
              <div className="text-xs text-gray-500 mt-1">
                {comment.length}/1000 ký tự
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-[#0F9D58] text-white px-6 py-3 rounded-full font-bold hover:bg-[#0B8043] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {editingReview ? 'Cập nhật' : 'Gửi đánh giá'}
                  </>
                )}
              </button>
              
              {editingReview && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 rounded-full font-bold border border-gray-300 hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div
              key={review.review_id}
              className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">
                      {review.user_fullname || 'Người dùng'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                
                {user?.id === review.user_id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(review.review_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-1 mb-3">
                {renderStars(review.rating)}
              </div>

              {review.comment && (
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Star size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Chưa có đánh giá nào cho cuốn sách này</p>
            {canReview && (
              <p className="text-sm mt-2">Hãy là người đầu tiên đánh giá!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to render stars
const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={`full-${i}`} size={20} className="fill-yellow-400 text-yellow-400" />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <StarHalf key="half" size={20} className="fill-yellow-400 text-yellow-400" />
    );
  }

  const remainingStars = 5 - Math.ceil(rating);
  for (let i = 0; i < remainingStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} size={20} className="text-gray-300" />
    );
  }

  return stars;
};

export default ReviewSection;