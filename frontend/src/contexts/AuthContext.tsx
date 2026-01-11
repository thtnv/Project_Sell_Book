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

      // Try to verify token with API
      const verifiedUser = await verifyToken();
      if (verifiedUser) {
        setUser(verifiedUser);
      } else {
        // Token invalid, get from localStorage as fallback
        const localUser = getCurrentUser();
        setUser(localUser);
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
    setUser(userData);
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    console.log("🔄 Refreshing user...");
    try {
      const verifiedUser = await verifyToken();
      if (verifiedUser) {
        console.log("✅ User refreshed:", verifiedUser);
        setUser(verifiedUser);
        // Cập nhật localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_info', JSON.stringify(verifiedUser));
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