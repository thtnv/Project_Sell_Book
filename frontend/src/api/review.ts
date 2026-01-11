const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface ReviewResponse {
  review_id: number;
  book_id: string;
  user_id: string;
  user_fullname: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface BookRatingSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    [key: string]: number;
  };
}

export interface ReviewCreate {
  book_id: string;
  rating: number;
  comment?: string;
}

export interface ReviewUpdate {
  rating?: number;
  comment?: string;
}

// Helper để lấy token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

// Helper để tạo headers với auth
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Lấy danh sách đánh giá của sách (Public)
 */
export async function getBookReviews(
  bookId: string,
  skip: number = 0,
  limit: number = 50
): Promise<ReviewResponse[]> {
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());

  const response = await fetch(
    `${API_BASE_URL}/api/reviews/book/${bookId}?${params.toString()}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lấy đánh giá thất bại');
  }

  return response.json();
}

/**
 * Lấy thống kê đánh giá của sách (Public)
 */
export async function getBookRatingSummary(bookId: string): Promise<BookRatingSummary> {
  const response = await fetch(
    `${API_BASE_URL}/api/reviews/book/${bookId}/summary`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lấy thống kê thất bại');
  }

  return response.json();
}

/**
 * Tạo đánh giá mới (Authenticated)
 */
export async function createReview(data: ReviewCreate): Promise<ReviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/reviews/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Tạo đánh giá thất bại');
  }

  return response.json();
}

/**
 * Cập nhật đánh giá (Authenticated)
 */
export async function updateReview(
  reviewId: number,
  data: ReviewUpdate
): Promise<ReviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Cập nhật đánh giá thất bại');
  }

  return response.json();
}

/**
 * Xóa đánh giá của mình (Authenticated)
 */
export async function deleteReview(reviewId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Xóa đánh giá thất bại');
  }
}

/**
 * Admin xóa đánh giá
 */
export async function deleteReviewAdmin(reviewId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/reviews/admin/${reviewId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Xóa đánh giá thất bại');
  }
}