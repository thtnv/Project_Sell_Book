"use client";
import React, { useState, useEffect } from 'react';
import { Search, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroProps {
  onSearch: (keyword: string) => void;
}

const bgImages = [
  "/hero/hero1.jpg",
  "/hero/hero2.jpg",
  "/hero/hero3.jpg",
  "/hero/hero4.jpg",
];

const Hero = ({ onSearch }: HeroProps) => {
  const [inputValue, setInputValue] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [currentBg, setCurrentBg] = useState(0);

  // ---- SLIDER AUTO CHANGE ----
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000); // đổi ảnh mỗi 5s

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveKeyword(inputValue);
    onSearch(inputValue);
  };

  const handleClear = () => {
    setInputValue("");
    setActiveKeyword("");
    onSearch("");
  };

  return (
    <section className="mt-24 relative pt-16 pb-36 text-center overflow-hidden">

      {/* ===== BACKGROUND SLIDER ===== */}
      <div className="absolute inset-0 z-0">
        {bgImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000
              ${index === currentBg ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        {/* Overlay để chữ dễ đọc */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h4 className="text-[#0F9D58] font-bold uppercase tracking-widest text-sm mb-2">
            Thư viện tri thức
          </h4>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6">
            Tìm cuốn sách <span className="text-[#0F9D58]">yêu thích</span> của bạn
          </h1>

          {/* Search Box */}
          <div className="max-w-162.5 mx-auto mt-10">
            <form className="w-full" onSubmit={handleSubmit}>
              <div className="bg-white rounded-full p-1.5 pl-6 shadow-xl shadow-[#0f9d58]/15 flex items-center border border-white focus-within:border-[#0F9D58] focus-within:-translate-y-1 transition-all">
                <Search className="text-slate-400 mr-2" size={20} />
                <input 
                  type="text" 
                  placeholder="Nhập tên sách, tác giả..." 
                  className="grow bg-transparent outline-none text-slate-600 h-11"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-[#0F9D58] hover:bg-[#0B8043] text-white px-8 h-11 rounded-full font-bold shadow-lg shadow-[#0f9d58]/30 transition-all hover:scale-105"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>
          </div>

          {/* Keyword result */}
          {activeKeyword && (
            <div className="mt-8 animate-fade-up">
              <div className="inline-flex items-center bg-white px-5 py-2 rounded-full shadow-sm border border-slate-100">
                <span className="text-slate-400 mr-2">Kết quả cho:</span>
                <span className="text-[#0F9D58] font-bold text-lg">
                  &quot;{activeKeyword}&quot;
                </span>
                <button 
                  onClick={handleClear}
                  className="ml-4 text-red-500 hover:text-red-700 flex items-center text-sm"
                >
                  <XCircle size={16} className="mr-1" /> Xóa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== WAVE ===== */}
      <div className="absolute bottom-0 left-0 w-full leading-0 z-10">
        <svg className="relative block w-[calc(130%+1.3px)] h-25" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39
            C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35
            A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="#f2fbf7"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
