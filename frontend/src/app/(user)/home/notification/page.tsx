"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  CheckCircle2, 
  MessageSquareDot, 
  Inbox,
  Clock,
  Loader2
} from "lucide-react";
import { getNotifications, NotificationResponse } from "@/api/contact";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Error loading notifications:", err);
        setError(err instanceof Error ? err.message : "Lỗi tải thông báo");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2fbf7] font-inter flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#0F9D58] mx-auto mb-4" size={48} />
          <p className="text-gray-600">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2fbf7] font-inter">
      {/* HEADER SECTION WITH WAVE */}
      <div className="relative bg-linear-to-br from-[#ccfbf1]/95 to-[#e0f2fe]/95 pt-10 pb-20 text-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
            Hộp thư thông báo
          </h1>
          <nav className="flex justify-center items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-emerald-600 font-bold">Thông báo</span>
          </nav>
          <p className="text-gray-500 text-sm italic">
            Bạn có <span className="text-emerald-700 font-bold">{notifications.length}</span> phản hồi từ ban quản trị
          </p>
        </div>
        
        {/* SVG Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full leading-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 fill-[#f2fbf7]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {notifications.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-gray-200/50 rounded-full flex items-center justify-center mb-4">
                <Inbox size={48} className="text-gray-400" />
              </div>
              <h6 className="text-gray-500 font-medium mb-2">Hiện chưa có phản hồi nào mới</h6>
              <p className="text-sm text-gray-400 mb-4">
                Các phản hồi từ admin sẽ hiển thị tại đây
              </p>
              <Link href="/" className="text-emerald-600 font-bold hover:underline">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            /* Notification List */
            <div className="space-y-4">
              {notifications.map((item) => (
                <div 
                  key={item.contact_id} 
                  className="bg-white rounded-xl shadow-sm border-l-4 border-emerald-500 overflow-hidden hover:shadow-md hover:scale-[1.01] transition-all duration-200 animate-in slide-in-from-bottom-4"
                >
                  <div className="p-4 md:p-5">
                    {/* Badge & Date */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-tight">
                          Admin đã trả lời
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                        <Clock size={10} />
                        {new Date(item.responded_at).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    {/* Title */}
                    <h6 className="font-bold text-gray-900 text-sm md:text-base mb-3">
                      Tiêu đề: {item.subject}
                    </h6>

                    {/* Original Query (Quote) */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 italic leading-relaxed">
                        Bạn: &quot;{item.message}&quot;
                      </p>
                    </div>

                    {/* Admin Response Box */}
                    <div className="bg-[#f0fdf4] p-4 rounded-xl border border-emerald-100">
                      <div className="flex gap-2">
                        <MessageSquareDot size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                        <p className="text-emerald-800 text-sm leading-relaxed font-medium">
                          Admin: {item.admin_response}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}