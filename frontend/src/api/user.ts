// src/api/user.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Interface for registration data (matches backend RegisterUserSchema)
export interface RegisterUserData {
  username: string;  // Backend expects 'username' (will be saved as full_name)
  email: string;
  password: string;
  phone?: string;    // Optional in backend
  address?: string;  // Optional in backend
}

// Interface for API response (matches backend RegisterResponseSchema)
export interface RegisterResponse {
  id: string;
  fullname: string;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string | null;
}

// Register user function
export async function registerUser(userData: RegisterUserData): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Backend trả về { detail: string }
      throw new Error(errorData.detail || 'Đăng ký thất bại');
    }

    const data: RegisterResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    throw error;
  }
}