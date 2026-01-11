"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Send, 
  ChevronRight,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { createContact, ContactCreate } from "@/api/contact";

interface ContactFormData {
  full_name?: string;
  email?: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const contactData: ContactCreate = {
        subject: data.subject,
        message: data.message,
        // Chỉ gửi full_name và email nếu chưa đăng nhập
        ...((!isAuthenticated) && {
          full_name: data.full_name,
          email: data.email
        })
      };

      await createContact(contactData);
      setSuccess(true);
      reset();
      
      // Auto hide success message after 5s
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2fbf7] font-sans text-gray-800">
      {/* HEADER SECTION WITH WAVE */}
      <div className="relative bg-linear-to-br from-[#ccfbf1] to-[#e0f2fe] pt-10 pb-20 text-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Liên Hệ Với Chúng Tôi
          </h1>
          <nav className="flex justify-center items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-emerald-600 font-bold">Liên hệ</span>
          </nav>
        </div>
        
        {/* SVG Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full leading-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[130%] h-12 fill-[#f2fbf7]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 -mt-10 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          
          {/* LEFT COLUMN: INFO */}
          <div className="w-full lg:w-[40%] animate-in fade-in slide-in-from-left duration-700">
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-emerald-900/5 h-full border-none">
              <h3 className="text-xl font-bold mb-6 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1 after:bg-[#0F9D58] after:rounded-full">
                Thông Tin
              </h3>

              <div className="space-y-6">
                <InfoItem 
                  icon={<MapPin size={20} />} 
                  title="Địa Chỉ" 
                  content="48 Cao Thắng, Phường Thanh Bình, Quận Hải Châu, TP Đà Nẵng" 
                />
                <InfoItem 
                  icon={<Mail size={20} />} 
                  title="Email" 
                  content="info@bookshop.com" 
                />
                <InfoItem 
                  icon={<Phone size={20} />} 
                  title="Điện Thoại" 
                  content="+012 345 67890" 
                />
                <InfoItem 
                  icon={<Clock size={20} />} 
                  title="Giờ Làm Việc" 
                  content="Thứ 2 - Thứ 7: 8:00 - 18:00" 
                />

                {/* Google Map */}
                <div className="rounded-xl overflow-hidden shadow-sm h-48 border border-gray-100">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.81525048247!2d108.21444107584166!3d16.075052939281735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314218307d81cc95%3A0x23f71694f71a7d65!2zNDggQ2FvIFRo4bqvbmcsIFRoYW5oIELDrW5oLCBI4bqjaSBDaMOidSwgxJDDoCBO4bq1bmcgNTUwMDAwLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <div className="w-full lg:w-[50%] animate-in fade-in slide-in-from-right duration-700">
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-emerald-900/5 border-none">
              <h3 className="text-xl font-bold mb-2 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-1 after:bg-[#0F9D58] after:rounded-full">
                Gửi Tin Nhắn
              </h3>
              <p className="text-gray-500 mb-6 text-sm italic">
                {isAuthenticated 
                  ? "Thông tin của bạn đã được tự động điền" 
                  : "Vui lòng điền đầy đủ thông tin liên hệ"}
              </p>

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top duration-300">
                  <CheckCircle size={20} />
                  <span className="font-medium">Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Chỉ hiện form nhập tay nếu chưa đăng nhập */}
                {!isAuthenticated && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Họ tên *</label>
                      <input 
                        {...register("full_name", { required: "Vui lòng nhập họ tên" })}
                        disabled={loading}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Nguyễn Văn A"
                      />
                      {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Email *</label>
                      <input 
                        {...register("email", { 
                          required: "Vui lòng nhập email",
                          pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" }
                        })}
                        disabled={loading}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="email@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-1">Tiêu đề *</label>
                  <input 
                    {...register("subject", { required: "Vui lòng nhập tiêu đề" })}
                    disabled={loading}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Vấn đề cần hỗ trợ"
                  />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Nội dung *</label>
                  <textarea 
                    {...register("message", { required: "Vui lòng nhập nội dung" })}
                    disabled={loading}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 h-40 resize-none overflow-y-auto focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Mô tả chi tiết nội dung liên hệ..."
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#0F9D58] hover:bg-[#0B8043] text-white font-bold py-3 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Gửi liên hệ
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* HELPER COMPONENT FOR INFO ITEMS */
function InfoItem({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
  return (
    <div className="flex items-center group">
      <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-[#0F9D58] mr-4 shrink-0 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
        {icon}
      </div>
      <div className="info-content">
        <h5 className="text-sm font-bold text-gray-800">{title}</h5>
        <p className="text-sm text-gray-500 leading-tight">{content}</p>
      </div>
    </div>
  );
}