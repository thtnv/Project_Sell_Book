"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext'; // ✅ ADD THIS
import { getNotifications } from '@/api/contact';

const Header = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart(); // ✅ ADD THIS - Lấy số lượng giỏ hàng
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadNotificationCount = async () => {
      if (isAuthenticated) {
        try {
          const notifications = await getNotifications();
          setNotificationCount(notifications.length);
        } catch (err) {
          console.error('Error loading notifications:', err);
          setNotificationCount(0);
        }
      }
    };
    loadNotificationCount();
    const interval = setInterval(loadNotificationCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      logout();
    }
  };

  const isActive = (path: string) => 
    pathname === path 
      ? "bg-[#0d9488] text-white shadow-md" 
      : "text-[#1e293b] hover:bg-[#ccfbf1] hover:text-[#0d9488]";

  const getInitial = () => {
    if (!user) return '?';
    if (!user.fullname) return '?';
    if (typeof user.fullname !== 'string') return '?';
    if (user.fullname.length === 0) return '?';
    return user.fullname[0].toUpperCase();
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    if (!user.fullname) return 'User';
    return user.fullname;
  };

  const getDisplayRole = () => {
    if (!user) return 'customer';
    if (!user.role) return 'customer';
    return user.role;
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-white py-3'
    }`}>
      <div className="container mx-auto px-4 md:px-10">
        <nav className="flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2 group">
            <i className="fas fa-book-open text-2xl text-[#0d9488]"></i>
            <h1 className="text-2xl font-extrabold text-[#0d9488] tracking-tighter font-quicksand m-0 leading-none">
              NHÀ SÁCH UTE
            </h1>
          </Link>

          <div className="hidden xl:flex items-center space-x-1">
            <Link href="/" className={`px-4 py-2 rounded-full font-semibold transition-all ${isActive('/')}`}>
              Trang Chủ
            </Link>

            <Link href="/cart" className={`px-4 py-2 rounded-full font-semibold flex items-center transition-all ${isActive('/cart')}`}>
              <i className="fas fa-shopping-cart mr-2"></i>
              Giỏ hàng 
              {itemCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link href="/home/contact" className={`px-4 py-2 rounded-full font-semibold transition-all ${isActive('/home/contact')}`}>
              Liên hệ
            </Link>

            {isAuthenticated && (
              <Link href="/account" className={`px-4 py-2 rounded-full font-semibold transition-all ${isActive('/account')}`}>
                Tài khoản
              </Link>
            )}

            {isAuthenticated && getDisplayRole() === 'admin' && (
              <Link href="/dashboard" className={`px-4 py-2 rounded-full font-semibold transition-all ${isActive('/dashboard')}`}>
                <i className="fas fa-cog mr-2"></i>
                Quản trị
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <Link href="/home/notification" className="relative group p-2">
                  <i className="fas fa-bell text-xl text-[#0d9488] group-hover:animate-bounce"></i>
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white font-bold">
                      {notificationCount}
                    </span>
                  )}
                </Link>

                <div className="hidden md:flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#0d9488] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {getInitial()}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#0d9488] text-sm font-quicksand leading-none">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {getDisplayRole()}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="bg-[#ff6f61] hover:bg-[#e55039] text-white px-5 py-2 rounded-full text-sm font-bold shadow-md transition-all hover:-translate-y-0.5"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-[#0d9488] font-bold border-2 border-[#0d9488] px-5 py-1.5 rounded-full hover:bg-[#0d9488] hover:text-white transition-all text-sm">
                  Đăng nhập
                </Link>
                <Link href="/register" className="bg-[#ff6f61] text-white font-bold px-5 py-2 rounded-full shadow-md hover:bg-[#e55039] transition-all text-sm">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;