// frontend/src/app/(admin)/dashboard/orders/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Eye, 
  Check, 
  Truck, 
  Filter, 
  RotateCcw, 
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { getAllOrdersAdmin, updateOrderStatus } from '@/api/order';

interface Order {
  order_id: string;
  user_id: string;
  user_name: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllOrdersAdmin(0, 100, statusFilter || undefined);
      setOrders(response.orders);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string, statusLabel: string) => {
    if (!confirm(`Xác nhận ${statusLabel.toLowerCase()} đơn hàng ${orderId}?`)) return;

    try {
      await updateOrderStatus(orderId, newStatus);
      alert(`${statusLabel} đơn hàng thành công!`);
      loadOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      processing: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50",
      confirmed: "bg-blue-500/20 text-blue-400 border border-blue-500/50",
      shipping: "bg-purple-500/20 text-purple-400 border border-purple-500/50",
      completed: "bg-green-500/20 text-green-400 border border-green-500/50",
      cancelled: "bg-red-500/20 text-red-400 border border-red-500/50",
    };
    const labels: Record<string, string> = {
      processing: "Chờ xử lý",
      confirmed: "Đang xử lý",
      shipping: "Đang giao",
      completed: "Đã giao",
      cancelled: "Đã hủy"
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const renderActionButtons = (order: Order) => {
    const { order_id, order_status } = order;

    // Chờ xử lý -> Nút "Xác nhận đơn"
    if (order_status === 'processing') {
      return (
        <button 
          onClick={() => handleUpdateStatus(order_id, 'confirmed', 'Xác nhận')}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all shadow-md"
        >
          <Check size={16} /> Xác nhận đơn
        </button>
      );
    }

    // Đang xử lý -> Nút "Giao hàng"
    if (order_status === 'confirmed') {
      return (
        <button 
          onClick={() => handleUpdateStatus(order_id, 'shipping', 'Giao hàng')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md"
        >
          <Truck size={16} /> Giao hàng
        </button>
      );
    }

    // Đang giao, Đã giao, Đã hủy -> Không có nút
    return <span className="text-gray-500 text-sm italic">Không có hành động</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#4FD1C5]" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-[#1A202C] min-h-screen p-6 font-inter text-[#E2E8F0]">
      <h2 className="text-center text-3xl font-extrabold text-[#4FD1C5] mb-10 tracking-widest uppercase italic">
        Quản Lý Đơn Hàng
      </h2>

      {/* Filter Section */}
      <div className="bg-[#2D3748] p-6 rounded-2xl mb-8 shadow-2xl border border-[#4A5568]">
        <div className="flex flex-wrap gap-4 items-center">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1A202C] border border-[#4A5568] rounded-xl px-5 py-3 outline-none focus:border-[#4FD1C5]"
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="processing">Chờ xử lý</option>
            <option value="confirmed">Đang xử lý</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <button 
            onClick={loadOrders}
            className="bg-[#4FD1C5] text-[#1A202C] px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#38B2AC] transition-all transform active:scale-95"
          >
            <Filter size={18} /> LỌC
          </button>

          <button 
            onClick={() => { setStatusFilter(''); setTimeout(loadOrders, 100); }}
            className="text-[#A0AEC0] hover:text-white flex items-center gap-1 ml-2 transition-colors"
          >
            <RotateCcw size={16} /> Làm mới
          </button>

          <div className="ml-auto text-white font-semibold">
            Tổng: {total} đơn hàng
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="overflow-hidden bg-[#2D3748] rounded-2xl border border-[#4A5568] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-[#1A202C] text-[#4FD1C5]">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">STT</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Mã ĐH</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Khách Hàng</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Ngày Tạo</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Tổng Tiền</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Trạng Thái</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4A5568]">
              {orders.length > 0 ? (
                orders.map((order, idx) => (
                  <tr key={order.order_id} className="hover:bg-[#344054] transition-colors group">
                    <td className="px-6 py-4">{idx + 1}</td>
                    <td className="px-6 py-4 font-black text-[#4FD1C5]">{order.order_id}</td>
                    <td className="px-6 py-4 font-medium">{order.user_name}</td>
                    <td className="px-6 py-4 text-[#A0AEC0]">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4 font-bold">{order.total_amount.toLocaleString('vi-VN')}₫</td>
                    <td className="px-6 py-4">{getStatusBadge(order.order_status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-3">
                        <Link 
                          href={`/dashboard/orders/${order.order_id}`} 
                          className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition-all shadow-lg" 
                          title="Chi tiết"
                        >
                          <Eye size={16} />
                        </Link>
                        
                        {renderActionButtons(order)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-20 text-center">
                    <ShoppingBag size={64} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-lg italic text-gray-500">Không có đơn hàng nào.</p>
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