const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  phone?: string;
  address?: string;
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
 * Lấy thông tin profile của user hiện tại
 */
export async function getCurrentProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lấy thông tin thất bại');
  }

  return response.json();
}

/**
 * Cập nhật thông tin profile
 * ✅ FIX: Gửi dữ liệu qua JSON body thay vì query params
 */
export async function updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
  console.log("📤 Sending update with JSON body:", data);

  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data), // ✅ Gửi qua body
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("❌ Update error:", errorData);
    throw new Error(errorData.detail || 'Cập nhật thất bại');
  }

  const result = await response.json();
  console.log("✅ Update success:", result);
  return result;
}

/**
 * Đổi mật khẩu
 */
export async function updatePassword(password: string): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/api/users/me/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Đổi mật khẩu thất bại');
  }

  return response.json();
}