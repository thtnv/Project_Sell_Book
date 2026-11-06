"use client"
import React, { useState, useEffect, useCallback } from "react"; // Thêm useCallback
import Link from "next/link";
import { 
  PlusCircle, 
  Search, 
  RotateCcw, 
  Edit, 
  Eye, 
  Trash2,
  Loader2,
  UserCircle,
  Filter
} from "lucide-react";
import { fetchUsersAdmin, deleteUserAdmin, UserAdmin } from "@/api/admin/user_admin";

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State cho bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<'admin' | 'customer' | ''>('');

  // [FIX 1]: Hàm loadUsers nhận tham số, không phụ thuộc vào state bên ngoài trong dependency
  const loadUsers = useCallback(async (search: string = "", role: string = "") => {
    try {
      setLoading(true);
      setError("");
      
      const filter = role === '' ? undefined : (role as 'admin' | 'customer');
      const response = await fetchUsersAdmin(0, 100, search, filter);
      
      setUsers(response.users);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  // [FIX 2]: useEffect chỉ chạy 1 lần lúc đầu để load dữ liệu mặc định
  useEffect(() => {
    loadUsers("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // [FIX 3]: Hàm tìm kiếm chủ động gọi API
  const handleSearch = () => {
    loadUsers(searchTerm, roleFilter);
  };

  const handleReset = () => {
    setSearchTerm("");
    setRoleFilter('');
    // Load lại dữ liệu gốc
    loadUsers("", "");
  };

  const handleDelete = async (userId: string, fullName: string) => {
    if (!confirm(`Xác nhận xóa user "${fullName}"?`)) return;

    try {
      await deleteUserAdmin(userId);
      alert("Xóa user thành công!");
      // Load lại với bộ lọc hiện tại
      loadUsers(searchTerm, roleFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xóa user thất bại");
    }
  };

  // Nếu đang loading lần đầu tiên (hoặc khi tìm kiếm), hiển thị loader
  // Lưu ý: Nếu muốn trải nghiệm tốt hơn, có thể bỏ loading toàn màn hình khi search
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C]">
        <Loader2 className="animate-spin text-[#4FD1C5]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A202C] p-4 md:p-8 font-inter text-[#E2E8F0]">
      <h2 className="text-center text-3xl font-bold text-[#4FD1C5] mb-8 uppercase tracking-widest italic">
        Quản Lý Người Dùng
      </h2>

      {/* Filter Section */}
      <div className="bg-[#2D3748] p-6 rounded-2xl mb-8 shadow-2xl border border-[#4A5568]">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-62.5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // [FIX 4]: Nhấn Enter để gọi tìm kiếm
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-[#1A202C] border border-[#4A5568] rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#4FD1C5] transition-all text-white"
            />
          </div>
          
          {/* Dropdown Role */}
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'admin' | 'customer' | '')}
            className="w-full md:w-52 bg-[#1A202C] border border-[#4A5568] rounded-xl px-4 py-3 outline-none focus:border-[#4FD1C5] cursor-pointer text-white"
          >
            <option value="">-- Tất cả vai trò --</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="customer">Khách hàng</option>
          </select>

          {/* Nút Tìm kiếm (Thay thế nút Lọc) */}
           <button
            onClick={handleSearch}
            className="bg-[#4FD1C5] text-[#1A202C] px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#38B2AC] transition-all transform active:scale-95 shadow-lg shadow-[#4FD1C5]/20">
            <Filter size={18} /> LỌC
          </button>
          
          {/* Nút Làm mới */}
          <button 
            onClick={handleReset}
            type="button" 
            className="text-[#A0AEC0] hover:text-white flex items-center gap-1 ml-2 transition-colors whitespace-nowrap"
          >
            <RotateCcw size={16} /> Làm mới
          </button>

          <Link
            href="/dashboard/users/create"
            className="md:ml-auto flex items-center justify-center gap-2 bg-linear-to-r from-[#10B981] to-[#059669] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1 active:scale-95"
          >
            <PlusCircle size={20} />
            Thêm User Mới
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Table - ĐÃ SỬA: w-full thay vì w-[950px] */}
      <div className="w-full bg-[#2D3748] rounded-2xl border border-[#4A5568] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#4A5568] scrollbar-track-[#1A202C]">
          <table className="w-full text-sm text-center border-collapse table-auto">
            <thead className="bg-[#1A202C] text-[#4FD1C5]">
              <tr className="uppercase tracking-wider font-bold text-xs">
                <th className="px-4 py-5 border-b border-[#4A5568]">STT</th>
                <th className="px-4 py-5 border-b border-[#4A5568] text-left">Họ Tên</th>
                <th className="px-4 py-5 border-b border-[#4A5568] text-left">Email</th>
                <th className="px-4 py-5 border-b border-[#4A5568]">SĐT</th>
                <th className="px-4 py-5 border-b border-[#4A5568] text-left">Địa Chỉ</th>
                <th className="px-4 py-5 border-b border-[#4A5568]">Vai Trò</th>
                <th className="px-4 py-5 border-b border-[#4A5568]">Ngày Tạo</th>
                <th className="px-4 py-5 border-b border-[#4A5568]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4A5568]">
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user.user_id} className="hover:bg-[#3D4A5E] transition-colors group">
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="px-4 py-4 text-left font-medium whitespace-nowrap">{user.full_name}</td>
                    <td className="px-4 py-4 text-left text-gray-300">{user.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{user.phone || 'N/A'}</td>
                    <td className="px-4 py-4 text-left max-w-50 truncate">{user.address || 'N/A'}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center justify-center
                          w-[90px] h-[26px]
                          rounded-full text-[10px] font-bold uppercase
                          ${user.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#A0AEC0] whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center items-center gap-2">
                        <Link 
                          href={`/dashboard/users/${user.user_id}`} 
                          className="bg-[#60A5FA] p-2 rounded-lg text-white hover:bg-[#3B82F6] transition-all transform hover:-translate-y-1 shadow-md"
                          title="Chi tiết"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link 
                          href={`/dashboard/users/edit/${user.user_id}`} 
                          className="bg-[#FCD34D] p-2 rounded-lg text-[#1A202C] hover:bg-[#FBBF24] transition-all transform hover:-translate-y-1 shadow-md"
                          title="Sửa"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(user.user_id, user.full_name)}
                          className="bg-[#EF4444] p-2 rounded-lg text-white hover:bg-[#DC2626] transition-all transform hover:-translate-y-1 shadow-md"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-20 text-center text-gray-500">
                    <UserCircle size={64} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-lg italic">Không có dữ liệu user nào.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Count */}
      <div className="mt-6 text-center text-gray-400">
        Tổng số: <span className="font-bold text-[#4FD1C5]">{total}</span> người dùng
      </div>
    </div>
  );
}