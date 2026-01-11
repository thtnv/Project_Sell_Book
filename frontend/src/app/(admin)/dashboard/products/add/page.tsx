"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { createBookAdmin, BookCreateData } from '@/api/admin/book_admin';

export default function AddBookPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<BookCreateData>({
    title: "",
    author: "",
    publisher: "",
    publication_year: undefined,
    category_id: "",
    price: 0,
    stock_quantity: 0,
    description: "",
    cover_image_url: ""
  });

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
    setLoading(true);

    try {
      if (!formData.title || !formData.author || !formData.category_id) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
      }

      await createBookAdmin(formData);
      alert("Thêm sách thành công!");
      router.push('/dashboard/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi thêm sách");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 text-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-700">
          <h2 className="text-3xl font-bold text-teal-400 text-center mb-8 uppercase tracking-wider flex items-center justify-center gap-3">
            <PlusCircle size={32} /> Thêm Sách Mới
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Tên Sách <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                    placeholder="Nhập tên sách"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Tác Giả <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                    placeholder="Nhập tên tác giả"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Nhà Xuất Bản</label>
                  <input
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                    placeholder="Nhập nhà xuất bản"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Năm Xuất Bản</label>
                  <input
                    type="number"
                    name="publication_year"
                    value={formData.publication_year || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                    placeholder="2024"
                    min="1900"
                    max="2100"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Thể Loại <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                    required
                  >
                    <option value="">-- Chọn thể loại --</option>
                    <option value="CAT001">Công nghệ thông tin</option>
                    <option value="CAT002">Kinh tế</option>
                    <option value="CAT003">Văn học</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                    placeholder="150000"
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Số Lượng Tồn</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400"
                    placeholder="100"
                    min="0"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-300 font-semibold mb-2">
                    <Upload size={18} /> Ảnh Bìa
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-teal-500 file:text-gray-900 hover:file:bg-teal-600 cursor-pointer"
                  />
                  {preview && (
                    <div className="mt-4 relative w-32 h-48 mx-auto">
                      <Image 
                        src={preview} 
                        alt="Preview" 
                        fill 
                        className="object-cover rounded-lg border border-gray-600" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-gray-300 font-semibold mb-2">Mô Tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400 resize-none"
                placeholder="Nhập mô tả sách..."
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <button 
                type="submit"
                disabled={loading}
                className="px-10 py-4 bg-teal-500 hover:bg-teal-600 text-gray-900 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Đang thêm...
                  </>
                ) : (
                  'Thêm Sách'
                )}
              </button>
              <Link 
                href="/dashboard/products"
                className="px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} /> Quay Lại
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}