"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  User as UserIcon,
  Phone,
  Mail,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { getOrderDetail, updateOrderStatus, OrderResponse } from "@/api/order";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const loadOrderDetail = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      setError("");
      const data = await getOrderDetail(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderDetail();
  }, [loadOrderDetail]);

  const handleUpdateStatus = async (newStatus: string, statusLabel: string) => {
    if (!order) return;
    if (!confirm(`Xác nhận chuyển trạng thái đơn hàng sang "${statusLabel}"?`)) return;

    try {
      setUpdating(true);
      await updateOrderStatus(order.order_id, newStatus);
      alert(`Đã cập nhật trạng thái đơn hàng sang "${statusLabel}" thành công!`);
      await loadOrderDetail();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cập nhật trạng thái thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      processing: {
        bg: "bg-yellow-500/20 border-yellow-500/50",
        text: "text-yellow-400",
        icon: <Clock size={16} className="text-yellow-400" />,
        label: "Chờ xử lý",
      },
      confirmed: {
        bg: "bg-blue-500/20 border-blue-500/50",
        text: "text-blue-400",
        icon: <CheckCircle size={16} className="text-blue-400" />,
        label: "Đang xử lý",
      },
      shipping: {
        bg: "bg-purple-500/20 border-purple-500/50",
        text: "text-purple-400",
        icon: <Truck size={16} className="text-purple-400" />,
        label: "Đang giao",
      },
      completed: {
        bg: "bg-green-500/20 border-green-500/50",
        text: "text-green-400",
        icon: <CheckCircle size={16} className="text-green-400" />,
        label: "Đã giao",
      },
      cancelled: {
        bg: "bg-red-500/20 border-red-500/50",
        text: "text-red-400",
        icon: <XCircle size={16} className="text-red-400" />,
        label: "Đã hủy",
      },
    };

    const b = badges[status] || {
      bg: "bg-gray-500/20 border-gray-500/50",
      text: "text-gray-300",
      icon: <Clock size={16} />,
      label: status,
    };

    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide uppercase ${b.bg} ${b.text}`}
      >
        {b.icon} {b.label}
      </span>
    );
  };

  const getBookImage = (url: string | null | undefined) => {
    if (!url) return "/books/book-default.jpg";
    if (url.startsWith("http")) return url;
    return `/books/${url}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C]">
        <Loader2 className="animate-spin text-[#4FD1C5]" size={48} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#1A202C] text-[#E2E8F0]">
        <div className="text-center bg-[#2D3748] p-8 md:p-12 rounded-2xl border border-gray-700 max-w-lg w-full shadow-2xl">
          <Package className="mx-auto mb-4 text-red-400" size={56} />
          <h2 className="text-2xl font-bold text-white mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-400 mb-6 text-sm">{error || `Đơn hàng #${orderId} không tồn tại hoặc đã bị xóa.`}</p>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 bg-[#4FD1C5] text-[#1A202C] px-6 py-2.5 rounded-xl font-bold hover:bg-[#38B2AC] transition-all"
          >
            <ArrowLeft size={18} />
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A202C] min-h-screen p-4 md:p-8 text-[#E2E8F0] font-inter">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#2D3748] p-4 md:p-6 rounded-2xl border border-gray-700 shadow-xl">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/orders"
              className="p-2.5 rounded-xl bg-[#1A202C] text-gray-300 hover:text-[#4FD1C5] hover:bg-[#232B3A] border border-gray-700 transition-all"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black text-white">
                  Đơn hàng <span className="text-[#4FD1C5]">#{order.order_id}</span>
                </h1>
                {getStatusBadge(order.order_status)}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                <Calendar size={14} /> Ngày tạo: {new Date(order.created_at).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex flex-wrap items-center gap-2">
            {order.order_status === "processing" && (
              <button
                onClick={() => handleUpdateStatus("confirmed", "Xác nhận")}
                disabled={updating}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <CheckCircle size={16} /> Xác nhận đơn
              </button>
            )}

            {order.order_status === "confirmed" && (
              <button
                onClick={() => handleUpdateStatus("shipping", "Giao hàng")}
                disabled={updating}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Truck size={16} /> Bắt đầu giao hàng
              </button>
            )}

            {order.order_status === "shipping" && (
              <button
                onClick={() => handleUpdateStatus("completed", "Đã giao")}
                disabled={updating}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <CheckCircle size={16} /> Hoàn tất giao hàng
              </button>
            )}

            {order.order_status !== "completed" && order.order_status !== "cancelled" && (
              <button
                onClick={() => handleUpdateStatus("cancelled", "Hủy đơn")}
                disabled={updating}
                className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/50 text-red-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                <XCircle size={16} /> Hủy đơn
              </button>
            )}
          </div>
        </div>

        {/* Info Grid: Customer Info & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Khách hàng & Giao nhận */}
          <div className="bg-[#2D3748] p-6 rounded-2xl border border-gray-700 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-[#4FD1C5] uppercase tracking-wider flex items-center gap-2 border-b border-gray-700 pb-3">
              <UserIcon size={18} /> Thông Tin Khách Hàng & Giao Nhận
            </h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start justify-between">
                <span className="text-gray-400">Khách hàng:</span>
                <span className="font-semibold text-white text-right">{order.user_name || order.user_id}</span>
              </div>
              {order.user_phone && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1"><Phone size={14} /> Số điện thoại:</span>
                  <span className="font-semibold text-white">{order.user_phone}</span>
                </div>
              )}
              {order.user_email && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1"><Mail size={14} /> Email:</span>
                  <span className="font-semibold text-white">{order.user_email}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-700/60">
                <span className="text-gray-400 flex items-center gap-1 mb-1"><MapPin size={14} /> Địa chỉ giao hàng:</span>
                <p className="bg-[#1A202C] p-3 rounded-xl text-gray-200 font-medium text-xs border border-gray-700 leading-relaxed">
                  {order.shipping_address || "Chưa cung cấp"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Thanh toán & Tổng tiền */}
          <div className="bg-[#2D3748] p-6 rounded-2xl border border-gray-700 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-[#4FD1C5] uppercase tracking-wider flex items-center gap-2 border-b border-gray-700 pb-3">
                <CreditCard size={18} /> Thông Tin Thanh Toán
              </h2>
              <div className="space-y-3 text-sm mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Phương thức:</span>
                  <span className="font-semibold text-white px-3 py-1 bg-[#1A202C] rounded-lg border border-gray-700 text-xs">
                    {order.payment_method_name || order.payment_method_id || "Tiền mặt / COD"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Trạng thái thanh toán:</span>
                  <span className={`font-bold text-xs ${order.order_status === "completed" ? "text-emerald-400" : "text-yellow-400"}`}>
                    {order.order_status === "completed" ? "Đã thanh toán" : "Chờ thanh toán khi nhận hàng"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#1A202C] p-4 rounded-xl border border-gray-700 mt-4">
              <div className="flex justify-between items-center text-sm text-gray-400 mb-1">
                <span>Tổng giá trị đơn hàng:</span>
                <span className="text-xl font-black text-emerald-400">
                  {order.total_amount.toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Order Details Table: Danh sách sản phẩm */}
        <div className="bg-[#2D3748] rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#4FD1C5] uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag size={18} /> Danh Sách Sản Phẩm ({order.order_details?.length || 0})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#1A202C] text-[#4FD1C5] uppercase text-xs">
                <tr>
                  <th className="px-5 py-4 text-center w-14">STT</th>
                  <th className="px-5 py-4 w-20">Ảnh</th>
                  <th className="px-5 py-4">Sản Phẩm</th>
                  <th className="px-5 py-4 text-center">Số Lượng</th>
                  <th className="px-5 py-4 text-right">Đơn Giá</th>
                  <th className="px-5 py-4 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {order.order_details && order.order_details.length > 0 ? (
                  order.order_details.map((detail, index) => {
                    const itemTotal = detail.unit_price * detail.quantity;
                    return (
                      <tr key={detail.detail_id || index} className="hover:bg-[#344054] transition-colors">
                        <td className="px-5 py-4 text-center text-gray-400">{index + 1}</td>
                        <td className="px-5 py-4">
                          <div className="w-12 h-16 relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex-shrink-0">
                            <Image
                              src={getBookImage(detail.book?.cover_image_url)}
                              alt={detail.book?.title || "Sách"}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-white line-clamp-2">
                            {detail.book?.title || `Mã sách: ${detail.book_id}`}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">Mã: {detail.book_id}</p>
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-white">
                          x{detail.quantity}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-300">
                          {detail.unit_price.toLocaleString("vi-VN")}₫
                        </td>
                        <td className="px-5 py-4 text-right font-black text-emerald-400">
                          {itemTotal.toLocaleString("vi-VN")}₫
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500 italic">
                      Không có sản phẩm nào trong chi tiết đơn hàng.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-[#1A202C] text-sm font-semibold border-t-2 border-gray-700">
                <tr>
                  <td colSpan={5} className="px-5 py-4 text-right text-gray-400 uppercase tracking-wider text-xs">
                    Tổng cộng:
                  </td>
                  <td className="px-5 py-4 text-right text-lg font-black text-emerald-400">
                    {order.total_amount.toLocaleString("vi-VN")}₫
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
