const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface UserAdmin {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: 'admin' | 'customer';
  created_at: string;
}

export interface UserCreateData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: 'admin' | 'customer';
}

export interface UserUpdateData {
  full_name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  role?: 'admin' | 'customer';
}

export interface UserListResponse {
  total: number;
  users: UserAdmin[];
}

// Helper functions
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Lấy danh sách users (Admin)
 */
export async function fetchUsersAdmin(
  skip: number = 0,
  limit: number = 100,
  search?: string,
  role?: 'admin' | 'customer'
): Promise<UserListResponse> {
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (search) params.append('search', search);
  if (role) params.append('role', role);

  const url = `${API_BASE_URL}/api/admin/users?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lấy danh sách users thất bại');
  }

  return response.json();
}

/**
 * Lấy chi tiết user (Admin)
 */
export async function fetchUserDetailAdmin(userId: string): Promise<UserAdmin> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Lấy chi tiết user thất bại');
  }

  return response.json();
}

/**
 * Tạo user mới (Admin)
 */
export async function createUserAdmin(userData: UserCreateData): Promise<UserAdmin> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Tạo user thất bại');
  }

  return response.json();
}

/**
 * Cập nhật user (Admin)
 */
export async function updateUserAdmin(
  userId: string,
  userData: UserUpdateData
): Promise<UserAdmin> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Cập nhật user thất bại');
  }

  return response.json();
}

/**
 * Xóa user (Admin)
 */
export async function deleteUserAdmin(userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Xóa user thất bại');
  }
}