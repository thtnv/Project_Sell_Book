"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Edit3, 
  Trash2, 
  ArrowLeft,
  Loader2,
  Calendar,
  Book,
  Package,
  DollarSign
} from 'lucide-react';
import { fetchBookDetailAdmin, deleteBookAdmin, BookAdmin } from '@/api/admin/book_admin';

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  
  const [book, setBook] = useState<BookAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        const data = await fetchBookDetailAdmin(bookId);
        setBook(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      loadBook();
    }
  }, [bookId]);

  const handleDelete = async () => {
    if (!book) return;
    if (!confirm(`Xác nhận xóa sách "${book.title}"?`)) return;

    try {
      await deleteBookAdmin(book.book_id);
      alert("Xóa sách thành công!");
      router.push('/dashboard/products');
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xóa sách thất bại");
    }
  };

  const getImageUrl = (image: string | null) => {
    if (!image) return "/books/default-book.png";
    if (image.startsWith("http")) return image;
    return `/books/${image}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#4FD1C5]" size={48} />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center bg-[#2D3748] p-8 rounded-2xl">
          <Package className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2">Lỗi!</h2>
          <p className="text-gray-400 mb-6">{error || "Không tìm thấy sách"}</p>
          <Link 
            href="/dashboard/products" 
            className="inline-flex items-center gap-2 bg-[#4FD1C5] text-[#1A202C] px-6 py-3 rounded-full font-bold hover:bg-[#38B2AC]"
          >
            <ArrowLeft size={20} />
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A202C] min-h-screen p-4 md:p-8 text-[#E2E8F0]">
      <div className="max-w-6xl mx-auto bg-[#2D3748] rounded-2xl p-6 md:p-10 shadow-2xl border border-gray-700">
        
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/dashboard/products" className="hover:text-[#4FD1C5]">Quản lý sách</Link>
          <span>/</span>
          <span className="text-[#4FD1C5] font-medium truncate max-w-75">{book.title}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5">
            <div className="relative aspect-3/4 max-w-md mx-auto bg-[#1A202C] rounded-lg overflow-hidden">
              <Image 
                src={getImageUrl(book.cover_image_url)} 
                alt={book.title} 
                fill 
                className="object-contain p-2"
                unoptimized
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              {book.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <InfoCard icon={<Book size={20} />} label="Mã sách" value={book.book_id} />
              <InfoCard icon={<Book size={20} />} label="Tác giả" value={book.author} />
              {book.publisher && (
                <InfoCard icon={<Book size={20} />} label="NXB" value={book.publisher} />
              )}
              {book.publication_year && (
                <InfoCard icon={<Calendar size={20} />} label="Năm XB" value={book.publication_year.toString()} />
              )}
              {book.category_name && (
                <InfoCard icon={<Book size={20} />} label="Thể loại" value={book.category_name} />
              )}
              <InfoCard 
                icon={<DollarSign size={20} />} 
                label="Giá bán" 
                value={`${Number(book.price).toLocaleString('vi-VN')} đ`}
                highlight
              />
            </div>

            <div className="bg-[#1A202C] p-6 rounded-xl mb-6 border border-gray-700">
              <h3 className="text-[#4FD1C5] font-bold mb-4 uppercase text-xs tracking-widest">
                Thống kê kho
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-[#2D3748] rounded-lg">
                  <Package className="mx-auto mb-2 text-[#4FD1C5]" size={24} />
                  <div className="text-2xl font-bold text-[#4FD1C5]">{book.stock_quantity}</div>
                  <div className="text-xs text-gray-400">Tồn kho</div>
                </div>
                <div className="text-center p-4 bg-[#2D3748] rounded-lg">
                  <Package className="mx-auto mb-2 text-[#F6AD55]" size={24} />
                  <div className="text-2xl font-bold text-[#F6AD55]">{book.sold_quantity}</div>
                  <div className="text-xs text-gray-400">Đã bán</div>
                </div>
              </div>
            </div>

            {book.description && (
              <div className="bg-[#1A202C] p-6 rounded-xl mb-6 border border-gray-700">
                <h3 className="text-[#4FD1C5] font-bold mb-3 uppercase text-xs tracking-widest">
                  Mô tả
                </h3>
                <p className="text-gray-300 leading-relaxed">{book.description}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href={`/dashboard/products/edit/${book.book_id}`}
                className="flex-1 flex items-center justify-center gap-2 bg-[#F6AD55] hover:bg-[#ED8936] text-[#1A202C] py-3 rounded-lg font-bold transition-all"
              >
                <Edit3 size={18} /> Chỉnh Sửa
              </Link>
              <button 
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition-all"
              >
                <Trash2 size={18} /> Xóa Sách
              </button>
              <Link 
                href="/dashboard/products"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition-all"
              >
                <ArrowLeft size={18} /> Quay Lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ 
  icon, 
  label, 
  value, 
  highlight = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg ${
      highlight ? 'bg-[#0F9D58]/10 border border-[#0F9D58]' : 'bg-[#1A202C]'
    }`}>
      <div className="text-[#4FD1C5]">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-gray-400 mb-1">{label}</div>
        <div className={`font-bold ${highlight ? 'text-[#0F9D58] text-xl' : 'text-white'}`}>
          {value}
        </div>
      </div>
    </div>
  );
}