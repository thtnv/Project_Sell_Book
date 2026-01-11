"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Save, ChevronLeft, Loader2 } from 'lucide-react';
import { 
  fetchCategoryDetailAdmin, 
  updateCategoryAdmin, 
  CategoryAdmin,
  CategoryUpdateData 
} from '@/api/admin/category_admin';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<CategoryAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        const data = await fetchCategoryDetailAdmin(categoryId);
        setCategory(data);
        setCategoryName(data.category_name);
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

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      setError("Tên thể loại không được để trống");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const updateData: CategoryUpdateData = {
        category_name: categoryName
      };
      
      await updateCategoryAdmin(categoryId, updateData);
      alert("Cập nhật thể loại thành công!");
      router.push('/dashboard/category');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi cập nhật thể loại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C]">
        <Loader2 className="animate-spin text-[#4FD1C5]" size={48} />
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C] p-4">
        <div className="text-center bg-[#2D3748] p-8 rounded-2xl">
          <p className="text-red-400 mb-4">{error}</p>
          <Link 
            href="/dashboard/category"
            className="inline-flex items-center gap-2 bg-[#4FD1C5] text-[#1A202C] px-6 py-3 rounded-full font-bold"
          >
            <ChevronLeft size={20} /> Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A202C] py-12 px-4 font-inter text-[#E2E8F0]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-[#A0AEC0] text-3xl font-bold text-center mb-8 uppercase tracking-wide">
          Chỉnh Sửa Thể Loại
        </h2>

        <div className="bg-[#2D3748] rounded-xl shadow-2xl p-8 max-w-150 mx-auto border border-white/5 animate-in fade-in duration-500">
          <div className="border-b border-white/10 pb-4 mb-8">
            <h4 className="text-xl font-semibold text-[#A0AEC0] text-center">
              Thông tin Thể Loại
            </h4>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-6">
            
            {/* Mã Thể Loại (Readonly) */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
              <label className="md:basis-1/4 text-[#A0AEC0] font-semibold md:text-right md:pr-6">
                Mã Thể Loại:
              </label>
              <div className="md:basis-3/4">
                <input
                  value={category?.category_id || ""}
                  readOnly
                  className="w-full bg-[#1A202C]/50 border border-white/10 text-gray-400 rounded-lg px-4 py-2.5 cursor-not-allowed outline-none italic font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">Mã thể loại không thể thay đổi</p>
              </div>
            </div>

            {/* Tên Thể Loại */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
              <label className="md:basis-1/4 text-[#A0AEC0] font-semibold md:text-right md:pr-6">
                Tên Thể Loại: <span className="text-red-500">*</span>
              </label>
              <div className="md:basis-3/4">
                <input
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Nhập tên thể loại mới"
                  disabled={submitting}
                  maxLength={50}
                  className="w-full bg-[#1A202C] border border-white/10 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#60A5FA] focus:ring-2 focus:ring-[#60A5FA]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Tối đa 50 ký tự</p>
              </div>
            </div>

            {/* Thống kê (chỉ hiển thị) */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1A202C]/50 p-4 rounded-lg border border-white/5">
                  <p className="text-xs text-gray-400 mb-1">Số sách khác nhau</p>
                  <p className="text-2xl font-bold text-[#4FD1C5]">
                    {category?.book_count.toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="bg-[#1A202C]/50 p-4 rounded-lg border border-white/5">
                  <p className="text-xs text-gray-400 mb-1">Tổng tồn kho</p>
                  <p className="text-2xl font-bold text-[#F6AD55]">
                    {category?.total_stock.toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Nút Hành Động */}
            <div className="md:flex pt-4">
              <div className="md:basis-1/4"></div>
              <div className="md:basis-3/4 flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 md:flex-initial bg-[#28a745] hover:bg-[#218838] text-white font-bold py-3 px-10 rounded-lg shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Lưu Thay Đổi
                    </>
                  )}
                </button>
                
                <Link
                  href="/dashboard/category"
                  className="flex-1 md:flex-initial text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-10 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Hủy
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link 
            href="/dashboard/category" 
            className="inline-flex items-center gap-2 text-[#60A5FA] font-bold hover:text-[#3B82F6] hover:underline px-6 py-2 rounded-lg border border-transparent hover:border-[#60A5FA]/30 transition-all"
          >
            <ChevronLeft size={20} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    </div>
  );
}