"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, PlusCircle, Loader2 } from 'lucide-react';
import { createCategoryAdmin, CategoryCreateData } from '@/api/admin/category_admin';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<CategoryCreateData>({
    category_id: "",
    category_name: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (!formData.category_id || !formData.category_name) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      await createCategoryAdmin(formData);
      alert("Thêm thể loại thành công!");
      router.push('/dashboard/category');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi thêm thể loại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A202C] py-12 px-4 font-inter text-[#E2E8F0]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-[#A0AEC0] text-3xl font-bold text-center mb-8 uppercase tracking-wide">
          Thêm Mới Thể Loại
        </h2>

        <div className="bg-[#2D3748] rounded-xl shadow-2xl p-8 max-w-150 mx-auto border border-gray-700">
          <div className="border-b border-white/10 pb-4 mb-6">
            <h4 className="text-xl font-semibold text-[#A0AEC0] flex items-center gap-2">
              <PlusCircle size={20} className="text-[#4CAF50]" />
              Thông tin Thể Loại
            </h4>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-6">
            
            {/* Mã Thể Loại */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
              <label className="md:basis-1/4 text-[#A0AEC0] font-semibold md:text-right md:pr-4">
                Mã Thể Loại <span className="text-red-500">*</span>
              </label>
              <div className="md:basis-3/4">
                <input
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  placeholder="Nhập mã (VD: IT, EDU...)"
                  disabled={loading}
                  maxLength={10}
                  className="w-full bg-[#1A202C] border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#60A5FA] focus:ring-2 focus:ring-[#60A5FA]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Tối đa 10 ký tự, không dấu</p>
              </div>
            </div>

            {/* Tên Thể Loại */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
              <label className="md:basis-1/4 text-[#A0AEC0] font-semibold md:text-right md:pr-4">
                Tên Thể Loại <span className="text-red-500">*</span>
              </label>
              <div className="md:basis-3/4">
                <input
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleChange}
                  placeholder="Nhập tên thể loại sách"
                  disabled={loading}
                  maxLength={50}
                  className="w-full bg-[#1A202C] border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#60A5FA] focus:ring-2 focus:ring-[#60A5FA]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Tối đa 50 ký tự</p>
              </div>
            </div>

            {/* Nút Submit */}
            <div className="md:flex">
              <div className="md:basis-1/4"></div>
              <div className="md:basis-3/4 flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 md:flex-initial bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold py-2.5 px-8 rounded-lg shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Thêm Mới'
                  )}
                </button>
                
                <Link
                  href="/dashboard/category"
                  className="flex-1 md:flex-initial text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2.5 px-8 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Hủy
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/dashboard/category" 
            className="inline-flex items-center gap-1 text-[#60A5FA] font-bold hover:text-[#3B82F6] hover:underline transition-all"
          >
            <ChevronLeft size={20} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    </div>
  );
}