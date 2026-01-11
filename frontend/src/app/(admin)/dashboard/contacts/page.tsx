"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MailOpen, 
  Reply, 
  CheckCheck, 
  Clock, 
  Mail,
  Loader2,
  Filter,
  Trash2
} from "lucide-react";
import { fetchContactsAdmin, deleteContactAdmin, ContactResponse } from "@/api/contact";

export default function AdminContactManagement() {
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | ''>('');

  const loadContacts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const filter = statusFilter === '' ? undefined : statusFilter;
      const response = await fetchContactsAdmin(0, 100, filter);
      setContacts(response.contacts);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xác nhận xóa liên hệ từ "${name}"?`)) return;

    try {
      await deleteContactAdmin(id);
      alert("Xóa liên hệ thành công!");
      loadContacts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xóa liên hệ thất bại");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#4FD1C5]" size={48} />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 md:p-6 bg-[#1A202C] min-h-screen text-white font-inter">
      {/* Section Header & Stats */}
      <div className="bg-[#2D3748] rounded-xl p-6 mb-6 shadow-lg flex flex-col md:flex-row justify-between items-center border border-white/5 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#4FD1C5]/10 rounded-lg flex items-center justify-center text-[#4FD1C5]">
            <MailOpen size={28} />
          </div>
          <div>
            <h2 className="m-0 text-xl font-bold uppercase tracking-wider text-[#4FD1C5]">
              Quản lý phản hồi liên hệ
            </h2>
            <p className="text-gray-400 text-xs">Hệ thống quản lý tin nhắn khách hàng</p>
          </div>
        </div>
        
        <div className="bg-[#1A202C] px-4 py-2 rounded-full border border-gray-700">
          <span className="text-gray-400 text-sm">Tổng cộng: </span>
          <span className="text-white font-bold">{total}</span>
          <span className="text-gray-400 text-sm ml-1">liên hệ</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-[#2D3748] rounded-xl p-4 mb-6 shadow-lg border border-white/5">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[#4FD1C5]" />
            <span className="text-sm font-semibold">Lọc theo trạng thái:</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'pending' | 'resolved' | '')}
            className="bg-[#1A202C] border border-gray-700 rounded-lg px-4 py-2 text-sm focus:border-[#4FD1C5] outline-none"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chưa xử lý</option>
            <option value="resolved">Đã trả lời</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-[#2D3748] rounded-xl shadow-xl overflow-hidden border border-gray-700 animate-in fade-in duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse min-w-225">
            <thead className="bg-[#1A202C] text-[#A0AEC0] uppercase font-bold text-xs tracking-tight">
              <tr>
                <th className="px-4 py-4 w-[5%] border-b border-gray-700">STT</th>
                <th className="px-4 py-4 w-[25%] border-b border-gray-700 text-left">Khách hàng</th>
                <th className="px-4 py-4 w-[30%] border-b border-gray-700 text-left">Tiêu đề</th>
                <th className="px-4 py-4 w-[15%] border-b border-gray-700">Thời gian gửi</th>
                <th className="px-4 py-4 w-[15%] border-b border-gray-700">Trạng thái</th>
                <th className="px-4 py-4 w-[10%] border-b border-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {contacts.length > 0 ? (
                contacts.map((item, index) => (
                  <tr key={item.contact_id} className="hover:bg-[#3D4A5E] transition-all group">
                    <td className="px-4 py-5 text-gray-500 font-mono">{index + 1}</td>
                    <td className="px-4 py-5 text-left">
                      <div className="font-bold text-white group-hover:text-[#4FD1C5] transition-colors uppercase text-xs">
                        {item.full_name}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1 lowercase italic">
                        <Mail size={12} /> {item.email}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-left text-gray-200 line-clamp-2 mt-3 block border-none">
                      {item.subject}
                    </td>
                    <td className="px-4 py-5 text-gray-400 font-medium">
                      {item.sent_at ? new Date(item.sent_at).toLocaleString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-4 py-5">
                      {item.status === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                          <Clock size={12} /> Đang chờ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCheck size={12} /> Đã trả lời
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex justify-center gap-2">
                        {item.status === "pending" ? (
                          <Link
                            href={`/dashboard/contacts/reply/${item.contact_id}`}
                            className="inline-flex items-center gap-2 bg-[#63B3ED] hover:bg-[#4299E1] text-[#1A202C] hover:text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
                          >
                            <Reply size={16} /> Phản hồi
                          </Link>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-[#10B981] font-bold drop-shadow-sm">
                            <CheckCheck size={18} />
                            <span className="text-[10px] uppercase tracking-tighter">Hoàn tất</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleDelete(item.contact_id, item.full_name)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
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
                  <td colSpan={6} className="px-4 py-20 text-center text-gray-500 text-lg italic">
                    Không có liên hệ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}