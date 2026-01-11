"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import { 
  fetchBookDetailAdmin, 
  updateBookAdmin, 
  BookAdmin,
  BookUpdateData 
} from '@/api/admin/book_admin';

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  
  const [book, setBook] = useState<BookAdmin | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<BookUpdateData>({});

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        const data = await fetchBookDetailAdmin(bookId);
        setBook(data);
        // Pre-fill form
        setFormData({
          title: data.title,
          author: data.author,
          publisher: data.publisher || undefined,
          publication_year: data.publication_year || undefined,
          category_id: data.category_id,
          price: Number(data.price),
          stock_quantity: data.stock_quantity,
          description: data.description || undefined,
          cover_image_url: data.cover_image_url || undefined
        });
        // Set preview
        if (data.cover_image_url) {
          const imageUrl = data.cover_image_url.startsWith('http') 
            ? data.cover_image_url 
            : `/books/${data.cover_image_url}`;
          setPreview(imageUrl);
        }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock_quantity' || name === 'publication_year'
        ? Number(value) 
        : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      
      setFormData(prev => ({ ...prev, cover_image_url: file.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await updateBookAdmin(bookId, formData);
      alert("Cập nhật sách thành công!");
      router.push('/dashboard/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi cập nhật sách");
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

  if (error || !book) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C] p-4">
        <div className="text-center bg-[#2D3748] p-8 rounded-2xl">
          <p className="text-red-400 mb-4">{error || "Không tìm thấy sách"}</p>
          <Link 
            href="/dashboard/products"
            className="inline-flex items-center gap-2 bg-[#4FD1C5] text-[#1A202C] px-6 py-3 rounded-full font-bold"
          >
            <ArrowLeft size={20} /> Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A202C] min-h-screen py-10 px-4 text-gray-100">
      <div className="max-w-5xl mx-auto bg-[#2D3748] rounded-2xl p-8 shadow-2xl border border-gray-700">
        <h2 className="text-center text-3xl font-bold text-[#4FD1C5] mb-10 tracking-widest uppercase">
          Chỉnh Sửa Sách
        </h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Image Column */}
          <div className="md:col-span-4 space-y-6 bg-black/20 p-6 rounded-xl border border-dashed border-gray-600">
            <div className="text-center">
              <label className="block text-sm font-semibold mb-3 italic text-gray-400">
                Ảnh bìa hiện tại
              </label>
              <div className="relative h-64 w-full bg-[#1A202C] rounded-lg overflow-hidden border border-gray-700">
                <Image 
                  src={preview || "/books/default-book.png"}
                  alt="Book Cover" 
                  fill 
                  className="object-contain" 
                  unoptimized
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#4FD1C5]">
                <Upload size={16} /> Thay đổi ảnh mới
              </label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange} 
                className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4FD1C5] file:text-[#1A202C] hover:file:bg-[#38B2AC] cursor-pointer" 
              />
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-300 mb-2">Tên Sách</label>
              <input 
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                className="w-full bg-[#2D3748] border border-gray-600 p-3 rounded-lg focus:border-[#4FD1C5] outline-none text-white" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Tác Giả</label>
              <input 
                name="author"
                value={formData.author || ""}
                onChange={handleChange}
                className="w-full bg-[#2D3748] border border-gray-600 p-3 rounded-lg focus:border-[#4FD1C5] outline-none text-white" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">NXB</label>
              <input 
                name="publisher"
                value={formData.publisher || ""}
                onChange={handleChange}
                className="w-full bg-[#2D3748] border border-gray-600 p-3 rounded-lg focus:border-[#4FD1C5] outline-none text-white" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Năm XB</label>
              <input 
                type="number"
                name="publication_year"
                value={formData.publication_year || ""}
                onChange={handleChange}
                className="w-full bg-[#2D3748] border border-gray-600 p-3 rounded-lg focus:border-[#4FD1C5] outline-none text-white" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Giá</label>
              <input 
                type="number"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="w-full bg-[#2D3748] border border-gray-600 p-3 rounded-lg focus:border-[#4FD1C5] outline-none text-white" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Thể Loại</label>
              <select 
                name="category_id"
                value={formData.category_id || ""}
                onChange={handleChange}
                className="w-full bg-[#2D3748] border border-gray-600 p-3 rounded-lg focus:border-[#4FD1C5] outline-none text-white"
              >
                <option value="">-- Chọn thể loại --</option>
                <option value="CAT001">Công nghệ thông tin</option>
                <option value="CAT002">Kinh tế</option>
                <option value="CAT003">Văn học</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Tồn Kho</label>
              <input 
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity || ""}
                onChange={handleChange}
                className="w-full bg-[#2D3748] border border-gray-600 p-3 rounded-lg focus:border-[#4FD1C5] outline-none text-white" 
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-300 mb-2">Mô Tả</label>
              <textarea 
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={4}
                className="w-full bg-[#2D3748] border border-gray-600 p-3 rounded-lg focus:border-[#4FD1C5] outline-none text-white resize-none"
              />
            </div>

            {/* Actions */}
            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="grow bg-[#4FD1C5] hover:bg-[#38B2AC] text-[#1A202C] font-bold py-4 rounded-xl shadow-lg transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
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
                href="/dashboard/products"
                className="grow text-center bg-[#63B3ED] hover:bg-[#4299E1] text-white font-bold py-4 rounded-xl shadow-lg transition-all uppercase flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} />
                Quay Lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}