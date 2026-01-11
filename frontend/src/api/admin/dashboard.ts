const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface DashboardStats {
  users: {
    total: number;
    customers: number;
    admins: number;
  };
  orders: {
    total: number;
  };
  revenue: {
    total: number;
  };
  books: {
    total: number;
    stock: number;
    sold: number;
  };
}

export interface OrderStatusStats {
  processing: { count: number; amount: number };
  confirmed: { count: number; amount: number };
  shipping: { count: number; amount: number };
  completed: { count: number; amount: number };
  cancelled: { count: number; amount: number };
}

export interface MonthlyTrends {
  months: string[];
  delivered: number[];
  cancelled: number[];
  revenue: number[];
}

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

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lấy thống kê thất bại');
  }

  return response.json();
}

export async function fetchOrderStatusStats(): Promise<OrderStatusStats> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/order-status`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lấy thống kê trạng thái thất bại');
  }

  return response.json();
}

export async function fetchMonthlyTrends(months: number = 5): Promise<MonthlyTrends> {
  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/monthly-trends?months=${months}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Lấy xu hướng thất bại');
  }

  return response.json();
}