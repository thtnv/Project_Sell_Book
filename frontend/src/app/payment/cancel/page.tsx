"use client";
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h1>
        <p className="text-gray-600 mb-6">Giao dịch đã bị hủy hoặc xảy ra lỗi.</p>
        <Link href="/" className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-700">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}