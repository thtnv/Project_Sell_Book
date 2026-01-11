// frontend/src/app/(admin)/dashboard/users/edit/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  UserCog, 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  Save,
  Loader2
} from "lucide-react";
import { 
  fetchUserDetailAdmin, 
  updateUserAdmin, 
  UserAdmin,
  UserUpdateData 
} from "@/api/admin/user_admin";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<UserUpdateData>({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "customer"
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const data = await fetchUserDetailAdmin(userId);
        setUser(data);
        // Pre-fill form
        setFormData({
          full_name: data.full_name,
          email: data.email,
          password: "", // Không hiển thị password cũ
          phone: data.phone || "",
          address: data.address || "",
          role: data.role
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);

    try {
      // Prepare update data (chỉ gửi những field có giá trị)
      const updateData: UserUpdateData = {};
      
      if (formData.full_name && formData.full_name !== user?.full_name) {
        updateData.full_name = formData.full_name;
      }
      if (formData.email && formData.email !== user?.email) {
        updateData.email = formData.email;
      }
      if (formData.password && formData.password.length >= 6) {
        updateData.password = formData.password;
      }
      if (formData.phone !== undefined && formData.phone !== user?.phone) {
        updateData.phone = formData.phone || undefined;
      }
      if (formData.address !== undefined && formData.address !== user?.address) {
        updateData.address = formData.address || undefined;
      }
      if (formData.role && formData.role !== user?.role) {
        updateData.role = formData.role;
      }

      // Kiểm tra có thay đổi gì không
      if (Object.keys(updateData).length === 0) {
        setError("Không có thay đổi nào để cập nhật");
        setSubmitting(false);
        return;
      }

      await updateUserAdmin(userId, updateData);
      alert("Cập nhật user thành công!");
      router.push('/dashboard/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi cập nhật user");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C]">
        <Loader2 className="animate-spin text-[#4FD1C5]" size={48} />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C] p-4">
        <div className="text-center bg-[#2D3748] p-8 rounded-2xl">
          <p className="text-red-400 mb-4">{error}</p>
          <Link 
            href="/dashboard/users"
            className="inline-flex items-center gap-2 bg-[#4FD1C5] text-[#1A202C] px-6 py-3 rounded-full font-bold"
          >
            <ChevronLeft size={20} /> Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A202C] py-10 px-4 font-inter text-[#E2E8F0] flex flex-col items-center">
      <div className="w-full max-w-200 bg-[#2D3748] rounded-2xl shadow-2xl p-8 md:p-10 border border-white/5 transition-all hover:-translate-y-1 animate-in fade-in duration-500">
        
        <h2 className="text-center text-3xl font-bold text-[#4FD1C5] mb-8 uppercase tracking-widest flex items-center justify-center gap-3">
          <UserCog size={32} />
          Chỉnh Sửa Người Dùng
        </h2>

        <hr className="border-[#4A5568] mb-8" />

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Họ Tên */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#A0AEC0]">Họ Tên</label>
            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Nhập họ tên"
              disabled={submitting}
              className="w-full bg-[#1A202C] border border-[#4A5568] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4FD1C5] transition-all disabled:opacity-50"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#A0AEC0]">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={submitting}
              className="w-full bg-[#1A202C] border border-[#4A5568] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4FD1C5] transition-all disabled:opacity-50"
            />
          </div>

          {/* Mật Khẩu */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#A0AEC0]">
              Mật Khẩu Mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Để trống nếu không đổi"
                disabled={submitting}
                className="w-full bg-[#1A202C] border border-[#4A5568] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4FD1C5] transition-all pr-11 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={submitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4FD1C5] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Chỉ nhập nếu muốn thay đổi mật khẩu (tối thiểu 6 ký tự)
            </p>
          </div>

          {/* Số Điện Thoại */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#A0AEC0]">
              Số Điện Thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={submitting}
              className="w-full bg-[#1A202C] border border-[#4A5568] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4FD1C5] transition-all disabled:opacity-50"
            />
          </div>

          {/* Địa Chỉ */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-[#A0AEC0]">Địa Chỉ</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
              disabled={submitting}
              className="w-full bg-[#1A202C] border border-[#4A5568] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4FD1C5] transition-all disabled:opacity-50"
            />
          </div>

          {/* Vai Trò */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#A0AEC0]">Vai Trò</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={submitting}
              className="w-full bg-[#1A202C] border border-[#4A5568] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4FD1C5] transition-all cursor-pointer disabled:opacity-50"
            >
              <option value="customer">Khách Hàng</option>
              <option value="admin">Quản Trị Viên (Admin)</option>
            </select>
          </div>

          {/* Ngày Tạo (Readonly) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#A0AEC0]">
              Ngày Tạo (Không thể sửa)
            </label>
            <input
              value={user ? new Date(user.created_at).toLocaleDateString('vi-VN') : ''}
              readOnly
              className="w-full bg-[#1A202C]/50 border border-[#4A5568] rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-12 py-4 bg-linear-to-r from-[#4FD1C5] to-[#38B2AC] text-[#1A202C] font-bold text-lg rounded-xl shadow-lg shadow-[#4FD1C5]/20 hover:brightness-110 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  ĐANG LƯU...
                </>
              ) : (
                <>
                  <Save size={20} />
                  LƯU THAY ĐỔI
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link 
          href="/dashboard/users" 
          className="inline-flex items-center gap-2 text-[#63B3ED] font-bold hover:text-[#4299E1] transition-all"
        >
          <ChevronLeft size={20} />
          Quay lại danh sách
        </Link>
      </div>
    </div>
  );
}