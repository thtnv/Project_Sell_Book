"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Box, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  ZoomIn
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(0.8); // Mặc định thu nhỏ 80%

  useEffect(() => {
    const savedZoom = localStorage.getItem("admin_zoom_level");
    if (savedZoom) {
      const parsed = parseFloat(savedZoom);
      if (!isNaN(parsed) && parsed >= 0.7 && parsed <= 1.2) {
        setZoomLevel(parsed);
      }
    }
  }, []);

  const changeZoom = (level: number) => {
    setZoomLevel(level);
    localStorage.setItem("admin_zoom_level", level.toString());
  };

  const menuItems = [
    { name: "Tổng quan", href: "/dashboard", icon: <Home size={20} /> },
    { name: "Quản lý sản phẩm", href: "/dashboard/products", icon: <Box size={20} /> },
    { name: "Quản lý người dùng", href: "/dashboard/users", icon: <Users size={20} /> },
    { name: "Quản lý đơn hàng", href: "/dashboard/orders", icon: <ShoppingCart size={20} /> },
    { name: "Phản hồi liên hệ", href: "/dashboard/contacts", icon: <MessageSquare size={20} /> },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
    }
  };

  return (
    <div 
      className="flex bg-[#1A202C] overflow-hidden transition-all duration-200"
      style={{
        zoom: zoomLevel,
        width: `${100 / zoomLevel}vw`,
        height: `${100 / zoomLevel}vh`,
        maxHeight: `${100 / zoomLevel}vh`,
      }}
    >
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-[#1A202C] text-white shadow-2xl z-40 p-4 transition-transform duration-300 ease-in-out overflow-y-auto flex-shrink-0 border-r border-gray-700 flex flex-col justify-between
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div>
          <div className="flex items-center justify-between h-14 border-b border-gray-700 mb-5 px-1">
            <span className="text-xl font-bold text-[#4FD1C5] tracking-tight">
              ADMIN DASHBOARD
            </span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
              <X size={22} />
            </button>
          </div>

          {user && (
            <div className="mb-5 p-3.5 bg-[#2D3748] rounded-xl border border-[#4A5568]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#4FD1C5] rounded-full flex items-center justify-center text-[#1A202C] font-bold text-base">
                  {user.fullname.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate text-xs">{user.fullname}</p>
                  <p className="text-[11px] text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="grow">
            <ul className="space-y-1.5">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium
                      ${isActive(item.href) ? "bg-[#63B3ED] text-white" : "hover:bg-[#4A5568] text-gray-300 hover:translate-x-1"}`}
                  >
                    <span className={`mr-2.5 ${isActive(item.href) ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom Section: Zoom Control & Logout */}
        <div className="pt-4 border-t border-gray-700/80 space-y-3">
          {/* Zoom Switcher */}
          <div className="bg-[#2D3748] p-2 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 px-1">
              <span className="flex items-center gap-1 font-semibold"><ZoomIn size={12} /> Thu phóng Admin:</span>
              <span className="font-bold text-[#4FD1C5]">{Math.round(zoomLevel * 100)}%</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[0.8, 0.9, 1.0].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => changeZoom(lvl)}
                  className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                    zoomLevel === lvl
                      ? "bg-[#4FD1C5] text-[#1A202C] shadow"
                      : "bg-[#1A202C] text-gray-400 hover:text-white hover:bg-[#344054]"
                  }`}
                >
                  {Math.round(lvl * 100)}%
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3.5 py-2 rounded-xl text-gray-300 text-sm font-medium hover:bg-red-500 hover:text-white transition-all duration-200 group"
          >
            <LogOut size={18} className="mr-2.5 text-red-500 group-hover:text-white" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="md:hidden bg-[#2D3748] border-b border-gray-700 p-3.5 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-white hover:text-[#4FD1C5]">
            <Menu size={22} />
          </button>
          <span className="text-lg font-bold text-[#4FD1C5]">ADMIN</span>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-500"><LogOut size={18} /></button>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-0">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;