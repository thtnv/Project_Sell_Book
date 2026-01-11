"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Edit3, ArrowLeftCircle, Info, Loader2, BookOpen, Package } from 'lucide-react';
import { fetchCategoryDetailAdmin, deleteCategoryAdmin, CategoryAdmin } from '@/api/admin/category_admin';

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<CategoryAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        const data = await fetchCategoryDetailAdmin(categoryId);
        setCategory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const handleDelete = async () => {
    if (!category) return;
    if (!confirm(`Xác nhận xóa thể loại "${category.category_name}"?`)) return;

    try {
      await deleteCategoryAdmin(category.category_id);
      alert("Xóa thể loại thành công!");
      router.push('/dashboard/category');
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xóa thể loại thất bại");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C]">
        <Loader2 className="animate-spin text-[#4FD1C5]" size={48} />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C] p-4">
        <div className="text-center bg-[#2D3748] p-8 rounded-2xl">
          <p className="text-red-400 mb-4">{error || "Không tìm thấy thể loại"}</p>
          <Link 
            href="/dashboard/category"
            className="inline-flex items-center gap-2 bg-[#4FD1C5] text-[#1A202C] px-6 py-3 rounded-full font-bold"
          >
            <ArrowLeftCircle size={20} /> Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 md:p-6 bg-[#1A202C] min-h-screen text-white font-inter">
      <h2 className="text-[#A0AEC0] text-3xl font-bold text-center mb-8 pt-4 uppercase tracking-wider drop-shadow-md">
        Chi Tiết Thể Loại
      </h2>

      <div className="max-w-162.5 mx-auto bg-[#2D3748] rounded-xl shadow-2xl p-8 md:p-10 border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="border-b border-white/10 pb-4 mb-8">
          <h4 className="text-xl font-semibold text-[#A0AEC0] text-center flex items-center justify-center gap-2">
            <Info size={24} className="text-[#4FD1C5]" />
            Thông tin Thể Loại
          </h4>
        </div>
        
        <dl className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-x-8 items-baseline">
          <dt className="text-[#A0AEC0] font-bold md:text-right text-sm md:text-base uppercase tracking-tight">
            Mã Thể Loại:
          </dt>
          <dd className="text-white font-medium text-lg bg-[#1A202C]/50 px-4 py-2 rounded-lg border border-white/5 font-mono">
            {category.category_id}
          </dd>

          <dt className="text-[#A0AEC0] font-bold md:text-right text-sm md:text-base uppercase tracking-tight">
            Tên Thể Loại:
          </dt>
          <dd className="text-white font-medium text-lg bg-[#1A202C]/50 px-4 py-2 rounded-lg border border-white/5">
            {category.category_name}
          </dd>

          <dt className="text-[#A0AEC0] font-bold md:text-right text-sm md:text-base uppercase tracking-tight">
            Số Sách Khác Nhau:
          </dt>
          <dd className="text-white font-medium text-lg bg-[#1A202C]/50 px-4 py-2 rounded-lg border border-white/5 flex items-center gap-2">
            <BookOpen size={20} className="text-[#4FD1C5]" />
            {category.book_count.toLocaleString('vi-VN')} cuốn
          </dd>

          <dt className="text-[#A0AEC0] font-bold md:text-right text-sm md:text-base uppercase tracking-tight">
            Tổng Tồn Kho:
          </dt>
          <dd className="text-white font-medium text-lg bg-[#1A202C]/50 px-4 py-2 rounded-lg border border-white/5 flex items-center gap-2">
            <Package size={20} className="text-[#F6AD55]" />
            {category.total_stock.toLocaleString('vi-VN')} quyển
          </dd>
        </dl>

        <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
           <p className="text-xs text-gray-400 italic text-center">
             * Thông tin này được sử dụng để phân loại sách trong hệ thống cửa hàng.
           </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
        <Link
          href={`/dashboard/category/edit/${category.category_id}`}
          className="flex items-center justify-center gap-2 bg-[#FCD34D] hover:bg-[#FBBF24] text-[#1A202C] px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:-translate-y-1 active:scale-95 w-full sm:w-auto"
        >
          <Edit3 size={20} />
          Chỉnh Sửa
        </Link>
        
        <button
          onClick={handleDelete}
          className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg hover:-translate-y-1 active:scale-95 w-full sm:w-auto"
        >
          <Package size={20} />
          Xóa Thể Loại
        </button>
        
        <Link
          href="/dashboard/category"
          className="flex items-center justify-center gap-2 text-[#60A5FA] border border-[#60A5FA] hover:bg-[#60A5FA]/10 px-8 py-3 rounded-lg font-bold transition-all hover:-translate-y-1 w-full sm:w-auto"
        >
          <ArrowLeftCircle size={20} />
          Quay lại danh sách
        </Link>
      </div>
    </div>
  );
}