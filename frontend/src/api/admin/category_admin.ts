const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface CategoryAdmin {
  category_id: string;
  category_name: string;
  book_count: number;
  total_stock: number;
}

export interface CategoryCreateData {
  category_id: string;
  category_name: string;
}

export interface CategoryUpdateData {
  category_name: string;
}

export interface CategoryListResponse {
  total: number;
  categories: CategoryAdmin[];
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
 * Lấy danh sách thể loại (Admin) - có phân trang
 */
export async function fetchCategoriesAdmin(
  skip: number = 0,
  limit: number = 100
): Promise<CategoryListResponse> {
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());

  const url = `${API_BASE_URL}/api/admin/categories?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lấy danh sách thể loại thất bại');
  }

  return response.json();
}

/**
 * Lấy chi tiết một thể loại (Admin)
 */
export async function fetchCategoryDetailAdmin(categoryId: string): Promise<CategoryAdmin> {
  const response = await fetch(`${API_BASE_URL}/api/admin/categories/${categoryId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Lấy chi tiết thể loại thất bại');
  }

  return response.json();
}

/**
 * Tạo thể loại mới (Admin)
 */
export async function createCategoryAdmin(categoryData: CategoryCreateData): Promise<CategoryAdmin> {
  const response = await fetch(`${API_BASE_URL}/api/admin/categories/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Tạo thể loại thất bại');
  }

  return response.json();
}

/**
 * Cập nhật thông tin thể loại (Admin)
 */
export async function updateCategoryAdmin(
  categoryId: string,
  categoryData: CategoryUpdateData
): Promise<CategoryAdmin> {
  const response = await fetch(`${API_BASE_URL}/api/admin/categories/${categoryId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Cập nhật thể loại thất bại');
  }

  return response.json();
}

/**
 * Xóa thể loại (Admin)
 */
export async function deleteCategoryAdmin(categoryId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/categories/${categoryId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Xóa thể loại thất bại');
  }
}