// frontend/src/components/home/BookCard.tsx
"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface BookProps {
  id: string;
  title: string;
  price: number;
  image: string | null;
  stock_quantity: number;
}

const BookCard = ({ id, title, price, image, stock_quantity }: BookProps) => {
  const [imgError, setImgError] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const { addToCart, isInCart } = useCart();

  const getImagePath = (imageName: string | null) => {
    if (!imageName) return "/books/book_default.jpg";
    if (imageName.startsWith("http")) return imageName;
    return `/books/${imageName}`;
  };

  const imageSrc = imgError ? "/books/book_default.jpg" : getImagePath(image);
  const inCart = isInCart(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (stock_quantity === 0) return;

    addToCart({
      book_id: id,
      title,
      price,
      cover_image_url: image,
      stock_quantity,
    });

    // Hiển thị thông báo đã thêm
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-xl transition-all flex flex-col h-full relative">
      
      {/* Badge "Đã thêm" */}
      {showAdded && (
        <div className="absolute top-2 right-2 z-20 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <Check size={14} />
          Đã thêm
        </div>
      )}

      {/* IMAGE */}
      <div className="relative h-60 w-full p-4">
        {stock_quantity === 0 && (
          <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center rounded-xl">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
              HẾT HÀNG  
            </span>
          </div>
        )}

        <Link href={`/book/${id}`} className="relative block w-full h-full">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-contain transition-transform ${
              stock_quantity === 0
                ? "grayscale opacity-40"
                : "hover:scale-110"
            }`}
            onError={() => setImgError(true)}
            priority={false}
            unoptimized={imageSrc.startsWith("http")}
          />
        </Link>
      </div>

      {/* INFO */}
      <div className="p-5 grow flex flex-col justify-between">
        <Link href={`/book/${id}`}>
          <h3 className="font-bold text-sm line-clamp-2 mb-2 hover:text-[#0F9D58] transition-colors">
            {title}
          </h3>
        </Link>

        <div>
          <p className="text-[#0F9D58] font-bold text-lg mb-3">
            {price.toLocaleString("vi-VN")} đ
          </p>

          <button
            onClick={handleAddToCart}
            disabled={stock_quantity === 0}
            className={`w-full py-2 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${
              stock_quantity > 0
                ? inCart
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-[#0F9D58] text-white hover:bg-[#0B8043] hover:shadow-lg"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            <ShoppingBag size={16} />
            {stock_quantity === 0 
              ? "Hết hàng" 
              : inCart 
                ? "Thêm nữa" 
                : "Thêm vào giỏ"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;