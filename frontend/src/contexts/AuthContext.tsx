"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, isAuthenticated, logoutUser, verifyToken, UserInfo } from '@/api/auth';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: UserInfo) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

function normalizeUser(
  user: Partial<UserInfo> & { full_name?: string }
): UserInfo {
  return {
    ...user,
    fullname: user.fullname || user.full_name || "",
  } as UserInfo;
}

// Helper: Lấy auth_provider đang lưu trong localStorage
const getSavedAuthProvider = (): string => {
  if (typeof window === 'undefined') return 'local';
  try {
    const savedStr = localStorage.getItem('user_info');
    if (savedStr) {
      const savedUser = JSON.parse(savedStr);
      return savedUser.auth_provider || 'local';
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return 'local';
  }
  return 'local';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount và verify token
  useEffect(() => {
    const loadUser = async () => {
      if (!isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      // [FIX]: Lấy provider cũ trước khi gọi API
      const savedProvider = getSavedAuthProvider();

      // Try to verify token with API
      const verifiedUser = await verifyToken();
      
      if (verifiedUser) {
        const normalized = normalizeUser(verifiedUser);
        // [FIX]: Gộp provider cũ vào data mới từ API
        setUser({ ...normalized, auth_provider: savedProvider } as any);
      } else {
        // Token invalid, get from localStorage as fallback
        const localUser = getCurrentUser();
        setUser(localUser ? normalizeUser(localUser) : null);
      }
      
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Redirect based on auth state and role
  useEffect(() => {
    if (isLoading) return;

    // Public routes
    const publicRoutes = ['/login', '/register', '/'];
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    if (!user && !isPublicRoute) {
      // Not authenticated, redirect to login
      router.push('/login');
    } else if (user) {
      // Authenticated
      if (pathname === '/login' || pathname === '/register') {
        // Redirect to appropriate dashboard
        if (user.role === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } else if (pathname.startsWith('/dashboard') && user.role !== 'admin') {
        // Not admin trying to access dashboard
        router.push('/');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData: UserInfo) => {
    // 1. Lấy auth_provider từ dữ liệu truyền vào (ưu tiên)
    let provider = (userData as any).auth_provider;

    // 2. Nếu không có trong dữ liệu truyền vào, thử lấy từ localStorage
    if (!provider) {
        provider = getSavedAuthProvider();
    }

    // 3. Nếu vẫn không có, mặc định là 'local' (cho trường hợp đăng nhập thường)
    if (!provider) {
        provider = 'local';
    }

    // 4. Tạo object user hoàn chỉnh
    const updatedUser = {
        ...userData,
        auth_provider: provider
    };

    // 5. Cập nhật State
    setUser(updatedUser);

    // 6. Cập nhật luôn localStorage để đồng bộ (nếu chưa có)
    if (typeof window !== 'undefined') {
        localStorage.setItem('user_info', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    console.log("🔄 Refreshing user...");
    try {
      // [FIX]: Lấy provider cũ trước khi gọi API (để tránh bị mất khi update)
      const savedProvider = getSavedAuthProvider();

      const verifiedUser = await verifyToken();
      if (verifiedUser) {
        console.log("✅ User refreshed:", verifiedUser);
        const normalized = normalizeUser(verifiedUser);
        
        // [FIX]: Gộp provider vào object user mới
        const userWithProvider = { 
            ...normalized, 
            auth_provider: savedProvider 
        };

        setUser(userWithProvider as any);

        if (typeof window !== 'undefined') {
          // Lưu lại bản đầy đủ (có auth_provider) vào localStorage
          localStorage.setItem('user_info', JSON.stringify(userWithProvider));
        }
      } else {
        console.log("⚠️ Cannot verify user, logging out");
        logout();
      }
    } catch (err) {
      console.error("❌ Refresh user error:", err);
      logout();
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login,
        logout,
        refreshUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook để protect routes
export function useRequireAuth(requiredRole?: 'admin' | 'customer') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && requiredRole && user.role !== requiredRole) {
      router.push('/');
    }
  }, [user, isLoading, requiredRole, router]);

  return { user, isLoading };
}