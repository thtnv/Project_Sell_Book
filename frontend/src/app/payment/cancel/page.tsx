"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { XCircle, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { deleteOrder } from "@/api/order";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const router = useRouter();
  // Dùng ref để tránh gọi API 2 lần trong React Strict Mode
  const hasDeleted = useRef(false);

  useEffect(() => {
    if (orderId && !hasDeleted.current) {
      hasDeleted.current = true;
      const cleanupOrder = async () => {
        try {
          await deleteOrder(orderId);
          console.log(`Đã xóa đơn hàng rác: ${orderId}`);
        } catch (error) {
          console.error("Lỗi khi xóa đơn hàng:", error);
        }
      };
      cleanupOrder();
    }
  }, [orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h1>
        <p className="text-gray-600 mb-6">
          Giao dịch đã bị hủy. Đơn hàng <b>{orderId}</b> đã được xóa khỏi hệ thống.
        </p>
        <Link href="/" className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-700">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}