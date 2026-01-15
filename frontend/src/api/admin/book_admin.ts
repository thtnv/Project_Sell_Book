const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface BookAdmin {
  book_id: string;
  title: string;
  author: string;
  publisher: string | null;
  publication_year: number | null;
  category_id: string;
  category_name: string | null;
  price: number;
  stock_quantity: number;
  sold_quantity: number;
  description: string | null;
  cover_image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BookCreateData {
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  category_id: string;
  price: number;
  stock_quantity?: number;
  description?: string;
  cover_image_url?: string;
}

export interface BookUpdateData {
  title?: string;
  author?: string;
  publisher?: string;
  publication_year?: number;
  category_id?: string;
  price?: number;
  stock_quantity?: number;
  description?: string;
  cover_image_url?: string;
}

export interface BookListResponse {
  total: number;
  books: BookAdmin[];
}

// Helper để lấy token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('access_token');
  console.log("🔑 Token:", token ? "✅ Có token" : "❌ Không có token");
  return token;
}

// Helper để tạo headers với auth
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  console.log("📤 Headers:", headers);
  return headers;
}

/**
 * Lấy danh sách sách (Admin) - có phân trang và tìm kiếm
 */
export async function fetchBooksAdmin(
  skip: number = 0,
  limit: number = 100,
  search?: string,
  categoryId?: string
): Promise<BookListResponse> {
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (categoryId) params.append('category_id', categoryId);

  const url = `${API_BASE_URL}/api/admin/books?${params.toString()}`;
  console.log("🌐 API URL:", url);

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  console.log("📡 Response status:", response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("❌ Error data:", errorData);
    throw new Error(errorData.detail || 'Lấy danh sách sách thất bại');
  }

  const data = await response.json();
  console.log("✅ Success data:", data);
  return data;
}

/**
 * Lấy chi tiết một cuốn sách (Admin)
 */
export async function fetchBookDetailAdmin(bookId: string): Promise<BookAdmin> {
  const response = await fetch(`${API_BASE_URL}/api/admin/books/${bookId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Lấy chi tiết sách thất bại');
  }

  return response.json();
}

/**
 * Tạo sách mới (Admin)
 */
export async function createBookAdmin(formData: FormData): Promise<BookAdmin> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/admin/books/`, {
    method: 'POST',
    headers: {
      // KHÔNG set Content-Type là application/json
      // Để browser tự set multipart/form-data boundary
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Tạo sách thất bại');
  }
  return response.json();
}

/**
 * Cập nhật thông tin sách (Admin)
 */
export async function updateBookAdmin(
  bookId: string,
  formData: FormData
): Promise<BookAdmin> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/admin/books/${bookId}`, {
    method: 'PUT',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Cập nhật sách thất bại');
  }
  return response.json();
}

/**
 * Xóa sách (Admin)
 */
export async function deleteBookAdmin(bookId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/books/${bookId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Xóa sách thất bại');
  }
}

/**
 * Cập nhật nhanh số lượng tồn kho (Admin)
 */
export async function updateStockAdmin(
  bookId: string,
  stockQuantity: number
): Promise<BookAdmin> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/books/${bookId}/stock?stock_quantity=${stockQuantity}`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Cập nhật tồn kho thất bại');
  }

  return response.json();
}