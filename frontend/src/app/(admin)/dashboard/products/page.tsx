"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  PlusCircle, 
  Filter, 
  RotateCcw, 
  Eye, 
  Edit, 
  Trash2,
  Loader2,
  Search,
  Tags 
} from "lucide-react";
import { fetchBooksAdmin, deleteBookAdmin, BookAdmin } from "@/api/admin/book_admin";

export default function AdminProductManagement() {
  const [books, setBooks] = useState<BookAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [total, setTotal] = useState(0);

  const loadBooks = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      console.log("🔄 Đang gọi API...");
      const response = await fetchBooksAdmin(0, 100, searchTerm, categoryFilter);
      console.log("✅ API Response:", response);
      console.log("📚 Books:", response.books);
      console.log("📊 Total:", response.total);
      setBooks(response.books);
      setTotal(response.total);
    } catch (err) {
      console.error("❌ Lỗi:", err);
      setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleSearch = () => {
    loadBooks();
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setTimeout(() => loadBooks(), 100);
  };

  const handleDelete = async (bookId: string, title: string) => {
    if (!confirm(`Xác nhận xóa sách "${title}"?`)) return;

    try {
      await deleteBookAdmin(bookId);
      alert("Xóa sách thành công!");
      loadBooks();
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
        <Loader2 className="animate-spin text-[#4CAF50]" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-inter p-6">
      {/* Header Actions */}
      <div className="bg-[#2D3748] p-6 rounded-xl shadow-lg flex flex-wrap gap-4 border border-gray-700">
        <Link
          href="/dashboard/products/add"
          className="flex items-center justify-center gap-2 bg-[#4CAF50] hover:bg-[#45a049] text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md hover:-translate-y-0.5 active:scale-95"
        >
          <PlusCircle size={20} />
          Thêm Sách Mới
        </Link>
         <Link
          href="/dashboard/category"
          className="flex items-center justify-center gap-2 bg-[#7ba1e7] hover:bg-[#3372e9] text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md hover:-translate-y-0.5 active:scale-95"
        >
          <Tags size={20} />
          Quản lý thể loại
        </Link>
        
        <div className="ml-auto text-white font-semibold">
          Tổng: {total} cuốn sách
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-[#2D3748] p-6 rounded-xl shadow-lg border border-gray-700">
        <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
          <div className="grow relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm tên sách hoặc tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-[#1A202C] border border-[#4A5568] text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-[#4CAF50] transition-colors"
            />
          </div>

          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-[#4CAF50] hover:bg-[#45a049] text-white px-6 py-2.5 rounded-lg font-bold transition-all"
          >
            <Filter size={18} />
            LỌC
          </button>

          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-bold transition-all"
          >
            <RotateCcw size={18} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-[#2D3748] rounded-xl shadow-xl overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse">
            <thead className="bg-[#1A202C] text-[#A0AEC0] uppercase font-bold text-xs">
              <tr>
                <th className="px-4 py-4 border-b border-gray-700">STT</th>
                <th className="px-4 py-4 border-b border-gray-700">Ảnh bìa</th>
                <th className="px-4 py-4 border-b border-gray-700 text-left">Tên sách</th>
                <th className="px-4 py-4 border-b border-gray-700 text-left">Thể loại</th>
                <th className="px-4 py-4 border-b border-gray-700 text-left">Tác giả</th>
                <th className="px-4 py-4 border-b border-gray-700">Giá</th>
                <th className="px-4 py-4 border-b border-gray-700">Đã bán</th>
                <th className="px-4 py-4 border-b border-gray-700">Tồn kho</th>
                <th className="px-4 py-4 border-b border-gray-700 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {books.length > 0 ? (
                books.map((book, index) => (
                  <tr key={book.book_id} className="hover:bg-[#3D4A5E] transition-colors">
                    <td className="px-4 py-4 text-white">{index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="relative w-10 h-14 mx-auto shadow-md rounded overflow-hidden">
                        <Image
                          src={getImageUrl(book.cover_image_url)}
                          alt={book.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-left font-semibold text-white">
                      <div className="truncate max-w-xs" title={book.title}>
                        {book.title}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-left text-blue-400">{book.category_name || 'N/A'}</td>
                    <td className="px-4 py-4 text-left text-gray-300">{book.author}</td>
                    <td className="px-4 py-4 font-bold text-green-400 whitespace-nowrap">
                      {Number(book.price).toLocaleString("vi-VN")} đ
                    </td>
                    <td className="px-4 py-4 text-orange-400">{book.sold_quantity}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        book.stock_quantity < 10 
                          ? "bg-orange-500 text-white" 
                          : "text-gray-300"
                      }`}>
                        {book.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-1.5">
                        <Link
                          href={`/dashboard/products/${book.book_id}`}
                          className="p-1.5 bg-[#60A5FA] hover:bg-[#3B82F6] text-white rounded transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/dashboard/products/edit/${book.book_id}`}
                          className="p-1.5 bg-[#FCD34D] hover:bg-[#FBBF24] text-[#1A202C] rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(book.book_id, book.title)}
                          className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-20 text-center text-gray-500 text-lg italic">
                    Không có dữ liệu sách nào được tìm thấy.
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