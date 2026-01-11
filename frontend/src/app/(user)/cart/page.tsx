// frontend/src/app/(user)/cart/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Minus, 
  Plus, 
  X, 
  ShoppingBasket, 
  Truck, 
  ArrowRight, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { createOrder, OrderCreate } from '@/api/order';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const CartPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { items, itemCount, totalAmount, removeFromCart, updateQuantity, clearCart } = useCart();
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState<'PM001' | 'PM002'>('PM001');
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  
  const shippingFee = 30000;
  const subTotal = totalAmount;
  const discount = appliedCoupon ? Math.round(subTotal * (appliedCoupon.percent / 100)) : 0;
  const total = subTotal - discount + shippingFee;

  const handleQuantityChange = (bookId: string, delta: number) => {
    const item = items.find(i => i.book_id === bookId);
    if (item) {
      updateQuantity(bookId, item.quantity + delta);
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode === "SALE10") {
      setAppliedCoupon({ code: "SALE10", percent: 10 });
      setError("");
    } else if (couponCode) {
      setError("Mã giảm giá không hợp lệ");
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      alert("Vui lòng đăng nhập để đặt hàng");
      router.push('/login');
      return;
    }

    if (!shippingAddress.trim()) {
      setError("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    if (items.length === 0) {
      setError("Giỏ hàng trống");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const orderData: OrderCreate = {
        shipping_address: shippingAddress,
        payment_method_id: paymentMethod,
        voucher_code: appliedCoupon?.code,
        items: items.map(item => ({
          book_id: item.book_id,
          quantity: item.quantity
        }))
      };

      await createOrder(orderData);
      clearCart();
      setShowSuccessModal(true);
      
    } catch (err) {
      console.error("Order error:", err);
      setError(err instanceof Error ? err.message : "Đặt hàng thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (image: string | null) => {
    if (!image) return "/books/default-book.png";
    if (image.startsWith("http")) return image;
    return `/books/${image}`;
  };

  return (
    <>
      <Header />
      <div className="bg-[#f2fbf7] min-h-screen pb-20 font-roboto pt-20">
        {/* Header Section */}
        <div className="relative bg-linear-to-br from-[#ccfbf1]/95 to-[#e0f2fe]/95 pt-16 pb-24 text-center overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#333] mb-4 font-quicksand">
              Giỏ Hàng Của Bạn
            </h1>
            <nav className="flex justify-center space-x-2 text-sm text-gray-500 font-medium">
              <Link href="/" className="hover:text-[#0F9D58] transition-colors">Trang chủ</Link>
              <span>/</span>
              <span className="text-[#0F9D58] font-bold">Giỏ hàng ({itemCount})</span>
            </nav>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full leading-0">
            <svg className="relative block w-[calc(130%+1.3px)] h-17.5" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#f2fbf7"></path>
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-12 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Cart Table */}
              <div className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(15,157,88,0.1)] overflow-hidden p-4 md:p-6 animate-fade-up">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-50 text-[#0F9D58] font-bold text-sm uppercase tracking-wider">
                        <th className="py-4 px-4">Sản phẩm</th>
                        <th className="py-4 px-4">Đơn giá</th>
                        <th className="py-4 px-4 text-center">Số lượng</th>
                        <th className="py-4 px-4">Thành tiền</th>
                        <th className="py-4 px-4 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {items.map((item) => (
                        <tr key={item.book_id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-6 px-4">
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-20 shadow-md rounded-lg overflow-hidden shrink-0">
                                <Image 
                                  src={getImageUrl(item.cover_image_url)} 
                                  alt={item.title} 
                                  fill 
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <span className="font-bold text-gray-800 text-sm line-clamp-2">{item.title}</span>
                            </div>
                          </td>
                          <td className="py-6 px-4 text-gray-600 font-medium">
                            {item.price.toLocaleString('vi-VN')}đ
                          </td>
                          <td className="py-6 px-4">
                            <div className="flex items-center justify-center bg-gray-100 rounded-full p-1 mx-auto w-fit border border-gray-200">
                              <button 
                                onClick={() => handleQuantityChange(item.book_id, -1)} 
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-gray-500 hover:text-red-500 border border-transparent transition-all shadow-sm"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-10 text-center font-bold text-gray-800">{item.quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange(item.book_id, 1)} 
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-gray-500 hover:text-[#0F9D58] border border-transparent transition-all shadow-sm"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="py-6 px-4 font-bold text-[#0F9D58]">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                          </td>
                          <td className="py-6 px-4 text-center">
                            <button 
                              onClick={() => removeFromCart(item.book_id)} 
                              className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-full text-red-500 hover:rotate-90 transition-all shadow-sm mx-auto"
                            >
                              <X size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-20 text-center">
                            <ShoppingBasket size={64} className="mb-4 text-gray-300 mx-auto" />
                            <p className="text-lg font-medium text-gray-400">Giỏ hàng trống.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Coupon Section */}
              {items.length > 0 && (
                <div className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(15,157,88,0.1)] p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <input 
                      type="text" 
                      placeholder="Mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="grow bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 focus:outline-none focus:border-[#0F9D58] transition-all"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      className="px-8 py-3 border-2 border-[#0F9D58] text-[#0F9D58] font-bold rounded-full hover:bg-[#0F9D58] hover:text-white transition-all"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-green-600 mt-2">✓ Đã áp dụng mã {appliedCoupon.code}</p>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-8 sticky top-24">
                <h4 className="text-xl font-bold text-gray-800 mb-6 font-quicksand">Tổng Giỏ Hàng</h4>
                
                {/* Shipping Address */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Truck className="inline mr-2" size={16} />
                    Địa chỉ giao hàng
                  </label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Nhập địa chỉ giao hàng"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
                  />
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phương thức thanh toán</label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="PM001"
                        checked={paymentMethod === 'PM001'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'PM001')}
                        className="mr-3"
                      />
                      <span className="flex-1">💵 Tiền mặt (COD)</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="PM002"
                        checked={paymentMethod === 'PM002'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'PM002')}
                        className="mr-3"
                      />
                      <span className="flex-1">💳 Chuyển khoản</span>
                    </label>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Tổng phụ:</span>
                    <span className="text-gray-800 font-bold">{subTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Vận chuyển:</span>
                    <span className="text-gray-800 font-bold">{shippingFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Giảm giá ({appliedCoupon?.code}):</span>
                      <span className="text-red-500 font-bold">-{discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                </div>

                <hr className="border-gray-50 mb-6" />

                <div className="flex justify-between items-center mb-8">
                  <h5 className="text-lg font-bold text-[#0F9D58]">Tổng cộng:</h5>
                  <h5 className="text-2xl font-black text-[#0F9D58]">{total.toLocaleString('vi-VN')}đ</h5>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleCheckout}
                  disabled={items.length === 0 || isSubmitting}
                  className="w-full bg-[#0F9D58] hover:bg-[#0B8043] text-white py-4 rounded-full font-bold uppercase transition-all shadow-lg disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Đặt Hàng <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="bg-[#0F9D58] text-white p-8 text-center">
                <CheckCircle size={48} className="mx-auto mb-4" />
                <h5 className="text-2xl font-bold">Đặt hàng thành công!</h5>
              </div>
              <div className="p-8 text-center">
                <p className="text-gray-500 font-medium mb-4">
                  Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
                </p>
                <p className="text-sm text-gray-400">
                  Bạn có thể theo dõi đơn hàng trong mục &quot;Đơn hàng của tôi&quot;
                </p>
              </div>
              <div className="p-6 pt-0 flex gap-3 pb-8">
                <Link href="/account" className="flex-1 text-center px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200">
                  Xem đơn hàng
                </Link>
                <Link href="/" className="flex-1 text-center px-6 py-3 bg-[#0F9D58] text-white rounded-full font-bold hover:bg-[#0B8043]">
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CartPage;