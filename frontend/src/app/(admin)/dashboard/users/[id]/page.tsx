// frontend/src/app/(admin)/dashboard/users/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Edit, 
  ArrowLeft,
  Info,
  Loader2,
  Trash2
} from "lucide-react";
import { fetchUserDetailAdmin, deleteUserAdmin, UserAdmin } from "@/api/admin/user_admin";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [userData, setUserData] = useState<UserAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const data = await fetchUserDetailAdmin(userId);
        setUserData(data);
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

  const handleDelete = async () => {
    if (!userData) return;
    if (!confirm(`Xác nhận xóa user "${userData.full_name}"?`)) return;

    try {
      await deleteUserAdmin(userData.user_id);
      alert("Xóa user thành công!");
      router.push('/dashboard/users');
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xóa user thất bại");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C]">
        <Loader2 className="animate-spin text-[#4FD1C5]" size={48} />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C] p-4">
        <div className="text-center bg-[#2D3748] p-8 rounded-2xl">
          <p className="text-red-400 mb-4">{error || "Không tìm thấy user"}</p>
          <Link 
            href="/dashboard/users"
            className="inline-flex items-center gap-2 bg-[#4FD1C5] text-[#1A202C] px-6 py-3 rounded-full font-bold"
          >
            <ArrowLeft size={20} /> Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A202C] py-10 px-4 font-inter text-[#E2E8F0] flex flex-col items-center">
      <div className="w-full max-w-200 bg-[#2D3748] rounded-2xl shadow-2xl p-6 md:p-10 border border-white/5 transition-all hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <h2 className="text-center text-2xl md:text-3xl font-bold text-[#4FD1C5] mb-8 uppercase tracking-widest flex items-center justify-center gap-3">
          <Info size={32} />
          Chi Tiết Người Dùng
        </h2>

        <hr className="border-[#4A5568] mb-8" />

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-12">
          <DetailItem 
            icon={<UserIcon size={18} />} 
            label="Mã User" 
            value={userData.user_id} 
          />
          <DetailItem 
            icon={<UserIcon size={18} />} 
            label="Họ Tên" 
            value={userData.full_name} 
          />
          <DetailItem 
            icon={<Mail size={18} />} 
            label="Email" 
            value={userData.email} 
          />
          <DetailItem 
            icon={<Phone size={18} />} 
            label="Số Điện Thoại" 
            value={userData.phone || "Chưa cập nhật"} 
          />
          <DetailItem 
            icon={<MapPin size={18} />} 
            label="Địa Chỉ" 
            value={userData.address || "Chưa cập nhật"} 
            className="md:col-span-2"
          />
          <DetailItem 
            icon={<ShieldCheck size={18} />} 
            label="Vai Trò" 
            value={userData.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'} 
          />
          <DetailItem 
            icon={<Calendar size={18} />} 
            label="Ngày Tạo" 
            value={new Date(userData.created_at).toLocaleString('vi-VN')} 
          />
        </dl>

        <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
          <p className="text-xs text-gray-400 italic text-center">
            * Thông tin này được sử dụng để quản lý tài khoản trong hệ thống.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
        <Link
          href={`/dashboard/users/edit/${userData.user_id}`}
          className="flex items-center justify-center gap-2 bg-[#FCD34D] hover:bg-[#FBBF24] text-[#1A202C] px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:-translate-y-1 active:scale-95 w-full sm:w-auto"
        >
          <Edit size={20} />
          Chỉnh Sửa
        </Link>
        
        <button
          onClick={handleDelete}
          className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:-translate-y-1 active:scale-95 w-full sm:w-auto"
        >
          <Trash2 size={20} />
          Xóa User
        </button>
        
        <Link
          href="/dashboard/users"
          className="flex items-center justify-center gap-2 text-[#60A5FA] border border-[#60A5FA] hover:bg-[#60A5FA]/10 px-8 py-3 rounded-lg font-bold transition-all hover:-translate-y-1 w-full sm:w-auto"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách
        </Link>
      </div>
    </div>
  );
}

function DetailItem({ 
  icon, 
  label, 
  value, 
  className = "" 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  className?: string 
}) {
  return (
    <div className={`flex flex-col gap-1 border-b border-[#4A5568] pb-3 ${className}`}>
      <dt className="text-xs font-bold text-[#A0AEC0] flex items-center gap-2 uppercase tracking-wider">
        <span className="text-[#4FD1C5]">{icon}</span>
        {label}
      </dt>
      <dd className="text-white font-medium text-base ml-7">
        {value || "---"}
      </dd>
    </div>
  );
}