import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#111827] text-[#9ca3af] pt-16 mt-auto border-t-4 border-[#0d9488]">
      <div className="container mx-auto px-4 md:px-10 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Section 1 */}
          <div>
            <h4 className="text-white text-xl font-bold font-quicksand mb-6">Về Chúng Tôi</h4>
            <p className="text-sm leading-relaxed">
              Nhà sách UTE cam kết mang đến nguồn tài liệu học tập và nghiên cứu chất lượng nhất cho sinh viên và giảng viên.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h4 className="text-white text-xl font-bold font-quicksand mb-6">Thông tin</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-[#0d9488] hover:pl-2 transition-all duration-300 block text-sm">Chính sách bảo mật</Link></li>
              <li><Link href="#" className="hover:text-[#0d9488] hover:pl-2 transition-all duration-300 block text-sm">Điều khoản sử dụng</Link></li>
              <li><Link href="#" className="hover:text-[#0d9488] hover:pl-2 transition-all duration-300 block text-sm">Vận chuyển & Giao hàng</Link></li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h4 className="text-white text-xl font-bold font-quicksand mb-6">Cá nhân</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-[#0d9488] hover:pl-2 transition-all duration-300 block text-sm">Tài khoản</Link></li>
              <li><Link href="#" className="hover:text-[#0d9488] hover:pl-2 transition-all duration-300 block text-sm">Giỏ hàng</Link></li>
              <li><Link href="#" className="hover:text-[#0d9488] hover:pl-2 transition-all duration-300 block text-sm">Theo dõi đơn hàng</Link></li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h4 className="text-white text-xl font-bold font-quicksand mb-6">Liên hệ</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <i className="fa fa-map-marker-alt text-[#0d9488] mt-1"></i>
                <span>48 Cao Thắng, Đà Nẵng</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa fa-phone-alt text-[#0d9488]"></i>
                <span>+089 931 8713</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa fa-envelope text-[#0d9488]"></i>
                <span>buiv6493@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-[12px] text-gray-500 uppercase tracking-widest">
            &copy; 2025 NHÀ SÁCH UTE. Design by UTE Team.
          </p>
        </div>
      </div>

      {/* Back to top UI Component (Static) */}
      <div className="fixed bottom-6 right-6">
        <button 
          aria-label="Back to top"
          className="bg-[#0d9488] hover:bg-[#ff6f61] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300"
        >
          <i className="fa fa-arrow-up"></i>
        </button>
      </div>
    </footer>
  );
};

export default Footer;