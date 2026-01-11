const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface ContactCreate {
  subject: string;
  message: string;
  full_name?: string;  // Required for guests
  email?: string;      // Required for guests
}

export interface ContactResponse {
  contact_id: number;
  user_id: string | null;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  admin_response: string | null;
  sent_at: string | null;
  responded_at: string | null;
}

export interface ContactListResponse {
  total: number;
  contacts: ContactResponse[];
}

export interface ContactReply {
  admin_response: string;
}

// MỚI: Interface cho thông báo
export interface NotificationResponse {
  contact_id: number;
  subject: string;
  message: string;
  admin_response: string;
  responded_at: string;
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
 * Gửi liên hệ mới (Public hoặc Authenticated)
 */
export async function createContact(contactData: ContactCreate): Promise<ContactResponse> {
  const response = await fetch(`${API_BASE_URL}/api/contacts/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(contactData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Gửi liên hệ thất bại');
  }

  return response.json();
}

/**
 * Lấy danh sách liên hệ của user hiện tại (Customer)
 */
export async function getMyContacts(): Promise<ContactResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/contacts/my-contacts`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lấy danh sách liên hệ thất bại');
  }

  return response.json();
}

/**
 * MỚI: Lấy thông báo (chỉ những tin đã được admin trả lời)
 */
export async function getNotifications(): Promise<NotificationResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/contacts/notifications`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lấy thông báo thất bại');
  }

  return response.json();
}

/**
 * Lấy danh sách tất cả liên hệ (Admin) - có phân trang
 */
export async function fetchContactsAdmin(
  skip: number = 0,
  limit: number = 100,
  statusFilter?: 'pending' | 'resolved'
): Promise<ContactListResponse> {
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (statusFilter) params.append('status_filter', statusFilter);

  const url = `${API_BASE_URL}/api/contacts/admin?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lấy danh sách liên hệ thất bại');
  }

  return response.json();
}

/**
 * Lấy chi tiết một liên hệ (Admin)
 */
export async function fetchContactDetailAdmin(contactId: number): Promise<ContactResponse> {
  const response = await fetch(`${API_BASE_URL}/api/contacts/admin/${contactId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Lấy chi tiết liên hệ thất bại');
  }

  return response.json();
}

/**
 * Phản hồi liên hệ (Admin)
 */
export async function replyContactAdmin(
  contactId: number,
  replyData: ContactReply
): Promise<ContactResponse> {
  const response = await fetch(`${API_BASE_URL}/api/contacts/admin/${contactId}/reply`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(replyData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Phản hồi liên hệ thất bại');
  }

  return response.json();
}

/**
 * Xóa liên hệ (Admin)
 */
export async function deleteContactAdmin(contactId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/contacts/admin/${contactId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Xóa liên hệ thất bại');
  }
}