"use client";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
        <p className="text-gray-600 mb-6">Đơn hàng <b>{orderId}</b> của bạn đã được xác nhận.</p>
        <Link href="/account" className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700">
          Xem đơn hàng
        </Link>
      </div>
    </div>
  );
}