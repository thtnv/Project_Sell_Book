"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface BookProps {
  id: string;
  title: string;
  price: number;
  image: string | null;
  stock_quantity: number;
}

export default function BookCard({
  id,
  title,
  price,
  image,
  stock_quantity,
}: BookProps) {
  const [imgError, setImgError] = useState(false);
  const [showAdded, setShowAdded] = useState(false);

  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // 🔑 FIX: chưa login thì coi như KHÔNG có cart
  const inCart = isAuthenticated ? isInCart(id) : false;

  const imageSrc = imgError
    ? "/books/book_default.jpg"
    : image?.startsWith("http")
    ? image
    : image
    ? `/books/${image}`
    : "/books/book_default.jpg";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    // 👉 CHƯA LOGIN: chỉ alert + redirect, KHÔNG đổi UI
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để thêm sách vào giỏ hàng");
      router.push("/login");
      return;
    }

    if (stock_quantity === 0) return;

    addToCart({
      book_id: id,
      title,
      price,
      cover_image_url: image,
      stock_quantity,
    });

    // 👉 CHỈ set khi đã login
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 1600);
  };

  return (
    <div className="group relative rounded-3xl bg-white p-[2px] transition-all hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.4)]">
      <div className="relative z-10 h-full rounded-3xl bg-white flex flex-col overflow-hidden">

        {/* BADGE ĐÃ THÊM — chỉ khi LOGIN */}
        {isAuthenticated && showAdded && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-in fade-in zoom-in-95">
            <Check size={14} />
            Đã thêm
          </div>
        )}

        {/* IMAGE */}
        <Link
          href={`/book/${id}`}
          className="relative block h-60 bg-gradient-to-b from-emerald-50 to-white"
        >
          {stock_quantity === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
              <span className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white">
                HẾT HÀNG
              </span>
            </div>
          )}

          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            onError={() => setImgError(true)}
            unoptimized={imageSrc.startsWith("http")}
            className={`object-contain transition-all duration-500 ${
              stock_quantity === 0
                ? "opacity-40 grayscale"
                : ""
            }`}
          />
        </Link>

        {/* CONTENT */}
        <div className="flex flex-col justify-between p-5 grow">
          <Link href={`/book/${id}`}>
            <h3 className="mb-2 line-clamp-2 font-semibold text-slate-800 transition-colors group-hover:text-emerald-600">
              {title}
            </h3>
          </Link>

          <div>
            <p className="mb-4 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              {price.toLocaleString("vi-VN")} đ
            </p>

            <button
              onClick={handleAddToCart}
              className={`w-full rounded-full py-2.5 font-bold flex items-center justify-center gap-2 transition-all ${
                stock_quantity === 0
                  ? "bg-slate-300 text-white cursor-not-allowed"
                  : inCart
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-gradient-to-r from-emerald-400 to-teal-400 text-white hover:shadow-lg hover:shadow-emerald-200"
              }`}
            >
              <ShoppingBag size={16} />

              {/* TEXT — FIX THEO LOGIN */}
              {stock_quantity === 0
                ? "Hết hàng"
                : !isAuthenticated
                ? "Thêm vào giỏ"
                : inCart
                ? "Thêm nữa"
                : "Thêm vào giỏ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}