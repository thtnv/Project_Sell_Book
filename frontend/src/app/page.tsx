"use client"
import Hero from '@/components/home/Hero';
import BookCard from '@/components/home/BookCard';
import { Users, Smile, BadgeCheck, BookOpenText } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import {TestimonialCard} from '@/components/home/Testimonials'
import {StatItem} from '@/components/home/Stats'
import {data} from '@/data/data'
import { useEffect, useState } from "react";
import { fetchBookList, BookList, BookFilter } from "@/api/book";
import Link from 'next/link';

export default function HomePage() {
  const [books, setBooks] = useState<BookList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<BookFilter>("Tất cả");
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Load books based on filter
  const loadBooks = async (filter: BookFilter) => {
    try {
      setLoading(true);
      const data = await fetchBookList(filter);
      setBooks(data);
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadBooks(activeFilter);
    const shouldShowAlert = localStorage.getItem('showProfileAlert');
    if (shouldShowAlert === 'true') {
      setShowProfileModal(true);
      // Xóa cờ để không hiện lại lần sau (hoặc giữ lại nếu muốn nhắc mỗi lần vào Home)
      localStorage.removeItem('showProfileAlert');
    }
  }, [activeFilter]);

  // Handle filter change
  const handleFilterChange = (filter: BookFilter) => {
    setActiveFilter(filter);
  };

  return (
    <main>
      <Header/>
      <Hero tuKhoa="" />

      <section className="bg-[#f2fbf7] pt-5 pb-24 relative">
        <div className="container mx-auto px-4">       
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h2 className="text-3xl font-bold text-slate-800 font-quicksand">Kệ sách Online</h2>
            
            {/* Tabs Filter */}
            <div className="flex bg-white p-1 rounded-full shadow-sm">
              {(['Tất cả', 'Sách hot', 'Xu hướng'] as BookFilter[]).map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => handleFilterChange(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    activeFilter === tab 
                      ? 'bg-[#0F9D58] text-white' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              <p className="text-center col-span-full text-slate-500">
                Đang tải sách...
              </p>
            ) : books.length > 0 ? (
              books.map((book) => (
                <BookCard
                  key={book.book_id}
                  id={book.book_id}
                  title={book.title}
                  price={book.price}
                  image={book.cover_image_url}
                  stock_quantity={book.stock_quantity}
                />
              ))
            ) : (
              <p className="text-center col-span-full text-slate-500">
                Không tìm thấy sách nào.
              </p>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full leading-0 rotate-180">
          <svg className="relative block w-[calc(130%+1.3px)] h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FFFFFF"></path>
          </svg>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem icon={<Users size={32} />} number="1,963" label="Khách hàng" />
            <StatItem icon={<Smile size={32} />} number="99%" label="Hài lòng" />
            <StatItem icon={<BadgeCheck size={32} />} number="33" label="Chứng nhận" />
            <StatItem icon={<BookOpenText size={32} />} number="789" label="Sách bán chạy" />
          </div>
        </div>
      </section>

      <section className="bg-[#f2fbf7] py-20 relative overflow-hidden">
         <div className="container mx-auto px-4 text-center">
            <h4 className="text-[#0F9D58] font-bold uppercase mb-2">Đánh giá</h4>
            <h2 className="text-3xl font-bold text-slate-800 mb-12 font-quicksand">Khách hàng nói gì về chúng tôi!</h2>
            <div className="grid md:grid-cols-3 gap-8">
               {data.map((item) => (
                  <TestimonialCard
                    key={item.id}
                    name={item.name}
                    role={item.work}
                    content={item.content}
                    image={item.image}
                  />
               ))}
            </div>
         </div>
      </section>
      <Footer/>
      {/* --- MODAL NHẮC NHỞ CẬP NHẬT --- */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-edit text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Cập nhật thông tin</h3>
              <p className="text-slate-600 mb-6 text-sm">
                Chào mừng bạn! <br/>
                Để thuận tiện cho việc mua hàng và bảo mật tài khoản, vui lòng cập nhật đầy đủ <b>Số điện thoại</b>, <b>Địa chỉ</b> và <b>Đặt lại mật khẩu</b>.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition-all text-sm"
                >
                  Để sau
                </button>
                <Link 
                  href="/account" 
                  className="flex-1 py-2.5 rounded-xl bg-[#0F9D58] text-white font-bold hover:bg-[#0B8043] shadow-lg shadow-green-200 transition-all text-sm flex items-center justify-center"
                >
                  Cập nhật ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}