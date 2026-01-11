import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  UserPlus, 
  ChevronLeft, 
  Eye, 
  EyeOff,
  Loader2
} from "lucide-react";
import { createUserAdmin, UserCreateData } from "@/api/admin/user_admin";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<UserCreateData>({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "customer"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate
      if (!formData.full_name || !formData.email || !formData.password) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
      }

      if (formData.password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      }

      await createUserAdmin(formData);
      alert("Thêm user thành công!");
      router.push("/dashboard/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi thêm user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A202C] py-10 px-4 font-inter text-[#E2E8F0] flex flex-col items-center">
      <div className="w-full max-w-200 bg-[#2D3748] rounded-2xl shadow-2xl p-8 md:p-10 border border-white/5 transition-all hover:-translate-y-1 animate-in fade-in zoom-in duration-500">
        
        <h2 className="text-center text-2xl md:text-3xl font-bold text-[#4FD1C5] mb-6 uppercase tracking-widest flex items-center justify-center gap-3">
          <UserPlus size={32} />
          Tạo Tài Khoản Mới
        </h2>

        <hr className="border-[#4A5568] mb-8" />

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Họ Tên */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#A0AEC0]">
              Họ Tên <span className="text-red-500">*</span>
            </label>
            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              disabled={loading}
              className="w-full bg-[#1A202C] border border-[#4A5568] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4FD1C5] transition-all disabled:opacity-50"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#A0AEC0]">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              disabled={loading}
              className="w-full bg-[#1A202C] border border-[#4A5568] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4FD1C5] transition-all disabled:opacity-50"
            />
          </div>

          {/* Mật Khẩu */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#A0AEC0]">
              Mật Khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className="w-full bg-[#1A202C] border border-[#4A5568] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4FD1C5] transition-all pr-11 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4FD1C5] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Tối thiểu 6 ký tự</p>
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
              placeholder="09xx xxx xxx"
              disabled={loading}
              className="w-full bg-[#1A202C] border border-[#4A5568] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4FD1C5] transition-all disabled:opacity-50"
            />
          </div>

          {/* Địa Chỉ */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-[#A0AEC0]">
              Địa Chỉ
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ cư trú"
              disabled={loading}
              className="w-full bg-[#1A202C] border border-[#4A5568] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4FD1C5] transition-all disabled:opacity-50"
            />
          </div>

          {/* Vai Trò */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#A0AEC0]">
              Vai Trò <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-[#1A202C] border border-[#4A5568] rounded-lg px-4 py-3 focus:outline-none focus:border-[#4FD1C5] transition-all cursor-pointer disabled:opacity-50"
            >
              <option value="customer">Khách hàng (Customer)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          {/* Nút Submit */}
          <div className="md:col-span-2 flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-linear-to-r from-[#4FD1C5] to-[#38B2AC] text-[#1A202C] font-bold text-lg rounded-xl shadow-lg shadow-[#4FD1C5]/20 hover:brightness-110 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'THÊM NGƯỜI DÙNG'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <Link 
          href="/dashboard/users" 
          className="flex items-center gap-2 text-[#63B3ED] font-semibold hover:text-[#4299E1] transition-colors"
        >
          <ChevronLeft size={20} /> Quay lại danh sách
        </Link>
      </div>
    </div>
  );
}