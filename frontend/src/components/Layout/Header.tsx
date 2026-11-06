"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getNotifications } from "@/api/contact";

const Header = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  /* =======================
     CLIENT MOUNT
  ======================= */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* =======================
     SCROLL EFFECT
  ======================= */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* =======================
     LOAD NOTIFICATIONS
  ======================= */
  useEffect(() => {
    if (!mounted || !isAuthenticated) return;

    const load = async () => {
      try {
        const data = await getNotifications();
        setNotificationCount(data.length);
      } catch {
        setNotificationCount(0);
      }
    };

    load();
    const i = setInterval(load, 300000);
    return () => clearInterval(i);
  }, [mounted, isAuthenticated]);

  /* =======================
     HELPERS
  ======================= */
  const isActive = (path: string) =>
    pathname === path
      ? "bg-gradient-to-r from-[#2dd4bf] via-[#38bdf8] to-[#fb7185] text-white shadow-lg"
      : "text-slate-700 hover:bg-[#ecfeff] hover:text-[#2dd4bf]";

  const getInitial = () => user?.fullname?.[0]?.toUpperCase() || "?";

  /* =======================
     RENDER
  ======================= */
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${isScrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_16px_50px_-18px_rgba(45,212,191,0.45)] py-2"
          : "bg-gradient-to-r from-[#ecfeff] via-white to-[#f0fdfa] py-4"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-10">
        <nav className="flex items-center justify-between">

          {/* ================= LOGO ================= */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-[#2dd4bf]/30 blur-xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2dd4bf] to-[#38bdf8] flex items-center justify-center shadow-lg">
                <i className="fas fa-book-open text-white text-xl" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#2dd4bf] via-[#38bdf8] to-[#fb7185] bg-clip-text text-transparent">
                NHÀ SÁCH UTE
              </h1>
              <p className="text-[11px] text-slate-500 tracking-wide">
                Knowledge • Emotion • Growth
              </p>
            </div>
          </Link>

          {/* ================= MENU ================= */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 backdrop-blur-lg shadow-inner">
            {[
              { href: "/", label: "Trang chủ" },
              { href: "/cart", label: "Giỏ hàng", icon: "fa-shopping-cart" },
              { href: "/home/contact", label: "Liên hệ" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${isActive(
                  item.href
                )}`}
              >
                {item.icon && <i className={`fas ${item.icon}`} />}
                {item.label}

                {/* CART BADGE (FIX HYDRATION) */}
                {mounted &&
                  isAuthenticated &&
                  item.href === "/cart" &&
                  itemCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                  )}

              </Link>
            ))}

            {mounted && isAuthenticated && (
              <Link
                href="/account"
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${isActive(
                  "/account"
                )}`}
              >
                Tài khoản
              </Link>
            )}
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex items-center gap-4">
            {mounted && isAuthenticated ? (
              <>
                {/* NOTIFICATION */}
                <Link href="/home/notification" className="relative group">
                  <div className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-lg flex items-center justify-center shadow hover:scale-110 transition">
                    <i className="fas fa-bell text-[#2dd4bf]" />
                  </div>

                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow">
                      {notificationCount}
                    </span>
                  )}
                </Link>

                {/* USER */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-white/70 backdrop-blur-lg shadow">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2dd4bf] to-[#38bdf8] text-white flex items-center justify-center font-bold">
                    {getInitial()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2dd4bf] leading-none">
                      {user?.fullname}
                    </p>
                    <p className="text-[11px] text-slate-500 capitalize">
                      {user?.role || "customer"}
                    </p>
                  </div>
                </div>

                {/* LOGOUT */}
                <button
                  onClick={() => confirm("Đăng xuất?") && logout()}
                  className="bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              mounted && (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-6 py-2 rounded-full border-2 border-[#2dd4bf] text-[#2dd4bf] font-bold hover:bg-[#2dd4bf] hover:text-white transition-all"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white font-bold shadow-lg hover:opacity-90 transition"
                  >
                    Đăng ký
                  </Link>
                </div>
              )
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;