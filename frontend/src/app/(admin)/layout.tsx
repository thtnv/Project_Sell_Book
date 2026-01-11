"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Xóa useRouter
import { 
  Home, 
  Box, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const pathname = usePathname();
  // Xóa dòng khai báo const router = useRouter();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex h-screen bg-[#1A202C] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-70 bg-[#1A202C] text-white shadow-2xl z-40 p-4 transition-transform duration-300 ease-in-out overflow-y-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-700 mb-6 px-2">
          <span className="text-2xl font-bold text-[#4FD1C5] tracking-tight">
            ADMIN DASHBOARD
          </span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {user && (
          <div className="mb-6 p-4 bg-[#2D3748] rounded-xl border border-[#4A5568]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4FD1C5] rounded-full flex items-center justify-center text-[#1A202C] font-bold text-lg">
                {user.fullname.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate text-sm">{user.fullname}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="grow">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group font-medium
                    ${isActive(item.href) ? "bg-[#63B3ED] text-white" : "hover:bg-[#4A5568] text-gray-300 hover:translate-x-1"}`}
                >
                  <span className={`mr-3 ${isActive(item.href) ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 rounded-xl text-gray-300 font-medium hover:bg-red-500 hover:text-white transition-all duration-200 mt-4 group"
              >
                <LogOut size={20} className="mr-3 text-red-500 group-hover:text-white" />
                Đăng xuất
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col md:ml-70">
        <header className="md:hidden bg-[#2D3748] border-b border-gray-700 p-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-white hover:text-[#4FD1C5]">
            <Menu size={24} />
          </button>
          <span className="text-xl font-bold text-[#4FD1C5]">ADMIN</span>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-500"><LogOut size={20} /></button>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;