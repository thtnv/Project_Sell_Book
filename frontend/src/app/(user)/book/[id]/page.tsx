"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Book,
  Minus,
  Plus,
  ShoppingCart,
  LibraryBig,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Calendar,
  Package,
  Truck
} from "lucide-react";

import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import ReviewSection from '@/components/book/ReviewSection';

import {
  fetchBookDetail,
  fetchBookList,
  BookDetail,
  BookList,
} from "@/api/book";
import { createOrder, OrderCreate} from "@/api/order";

const getImageUrl = (image: string | null) => {
  if (!image) return "/books/book-default.jpg";
  if (image.startsWith("http")) return image;
  return `/books/${image}`;
};

const RelatedBookCard = ({ book }: { book: BookList }) => {
  const [relatedImgError, setRelatedImgError] = useState(false);
  const relatedImgSrc = relatedImgError ? "/books/book-default.jpg" : getImageUrl(book.cover_image_url);
  
  return (
    <Link href={`/book/${book.book_id}`}>
      <div className="bg-white rounded-2xl p-4 shadow hover:shadow-xl transition-all transform hover:-translate-y-1">
        <div className="relative aspect-3/4 mb-4">
          <Image
            src={relatedImgSrc}
            alt={book.title}
            fill
            className="object-contain"
            onError={() => setRelatedImgError(true)}
            unoptimized={relatedImgSrc.startsWith("http")}
          />
        </div>
        <h4 className="font-bold text-sm line-clamp-2 mb-2 text-gray-800">
          {book.title}
        </h4>
        <p className="text-[#0F9D58] font-bold text-lg">
          {Number(book.price).toLocaleString("vi-VN")} đ
        </p>
      </div>
    </Link>
  );
};

const Meta = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full text-sm">
    <span className="text-[#0F9D58] mr-2">{icon}</span>
    <b className="mr-1">{label}:</b> {value}
  </div>
);

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<BookList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PM001' | 'PM002'>('PM001');
  const [shippingAddress, setShippingAddress] = useState("");
  const [couponCode] = useState("");
  const [imgError, setImgError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [discountPercent] = useState(0); 
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const bookData = await fetchBookDetail(id);
        setBook(bookData);
        setQuantity(bookData.stock_quantity > 0 ? 1 : 0);
        
        if (user?.address) {
          setShippingAddress(user.address);
        }

        const allBooks = await fetchBookList();
        setRelatedBooks(
          allBooks.filter((b) => b.book_id !== id).slice(0, 4)
        );
      } catch (err) {
        console.error("Error loading book:", err);
        setError("Không thể tải thông tin sách. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, user]);

  const changeQty = (delta: number) => {
    if (!book) return;
    const next = quantity + delta;
    if (next >= 1 && next <= book.stock_quantity) {
      setQuantity(next);
    }
  };
  
  const handleOrderNow = async () => {
    if (!book || book.stock_quantity === 0) return;

    if (!isAuthenticated || !user) {
      alert("Vui lòng đăng nhập để đặt hàng");
      router.push('/login');
      return;
    }

    if (!shippingAddress.trim()) {
      setOrderError("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    setIsSubmitting(true);
    setOrderError("");

    try {
      const orderData: OrderCreate = {
        shipping_address: shippingAddress,
        payment_method_id: paymentMethod,
        voucher_code: couponCode || undefined,
        items: [{
          book_id: book.book_id,
          quantity: quantity
        }]
      };

      await createOrder(orderData);
      setShowModal(true);
    } catch (err) {
      console.error("❌ Order error:", err);
      setOrderError(err instanceof Error ? err.message : "Đặt hàng thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    router.push('/account');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-[#f2fbf7]">
          <div className="text-center">
            <Loader2 className="animate-spin text-[#0F9D58] mx-auto mb-4" size={48} />
            <p className="text-gray-600 font-medium">Đang tải thông tin sách...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !book) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2fbf7] px-4">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-red-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{error || "Không tìm thấy sách"}</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-[#0F9D58] text-white px-6 py-3 rounded-full font-bold hover:bg-[#0B8043] transition-all"
            >
              <ArrowLeft size={20} />
              Về trang chủ
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const imageSrc = imgError ? "/books/book-default.jpg" : getImageUrl(book.cover_image_url);
  // 1. KHAI BÁO PHÍ VẬN CHUYỂN
  const SHIPPING_FEE = 30000;

  // ===> TÍNH TOÁN LẠI GIÁ TIỀN <===
  const subTotal = Number(book.price) * quantity;
  const discountAmount = subTotal * (discountPercent / 100);
  
  // 2. CỘNG THÊM PHÍ VẬN CHUYỂN VÀO TỔNG
  const totalPrice = subTotal - discountAmount + SHIPPING_FEE;

  return (
    <>
      <Header />
      <div className="bg-[#f2fbf7] min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4">
          
          <nav className="flex items-center gap-2 text-sm mb-6 text-gray-600">
            <Link href="/" className="hover:text-[#0F9D58]">Trang chủ</Link>
            <span>/</span>
            <span className="text-[#0F9D58] font-semibold">Chi tiết sách</span>
          </nav>

          {/* Book Detail Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">

              <div className="lg:col-span-5">
                <div className="relative aspect-3/4 max-w-md mx-auto">
                  {book.stock_quantity === 0 && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-2xl">
                      <span className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg">
                        HẾT HÀNG
                      </span>
                    </div>
                  )}
                  <Image
                    src={imageSrc}
                    alt={book.title}
                    fill
                    priority
                    className={`object-contain rounded-2xl ${
                      book.stock_quantity === 0 ? "grayscale opacity-40" : ""
                    }`}
                    onError={() => setImgError(true)}
                    unoptimized={imageSrc.startsWith("http")}
                  />
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                  {book.title}
                </h1>

                <div className="flex flex-wrap gap-3 mb-6">
                  <Meta 
                    icon={<User size={16} />} 
                    label="Tác giả" 
                    value={book.author} 
                  />
                  {book.publisher && (
                    <Meta 
                      icon={<Book size={16} />} 
                      label="NXB" 
                      value={book.publisher} 
                    />
                  )}
                  {book.publication_year && (
                    <Meta 
                      icon={<Calendar size={16} />} 
                      label="Năm XB" 
                      value={book.publication_year} 
                    />
                  )}
                  {book.category_name && (
                    <Meta 
                      icon={<Book size={16} />} 
                      label="Thể loại" 
                      value={book.category_name} 
                    />
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-4xl font-bold text-[#0F9D58]">
                    {Number(book.price).toLocaleString("vi-VN")} đ
                  </p>
                  {book.stock_quantity > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Còn lại: <span className="font-bold text-[#0F9D58]">{book.stock_quantity}</span> cuốn
                    </p>
                  )}
                </div>

                {book.description && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Mô tả sản phẩm</h3>
                    <p className="text-gray-600 leading-relaxed">{book.description}</p>
                  </div>
                )}

                {book.stock_quantity > 0 && (
                  <div className="space-y-6 mt-auto">
                    
                    <div>
                      <label className="text-sm font-bold mb-2 block text-gray-700">
                        Số lượng
                      </label>
                      <div className="flex items-center border-2 border-gray-200 rounded-full px-3 py-2 bg-white w-fit">
                        <button 
                          type="button" 
                          onClick={() => changeQty(-1)}
                          disabled={quantity <= 1}
                          className="text-gray-600 hover:text-[#0F9D58] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus size={20} />
                        </button>
                        <input
                          readOnly
                          value={quantity}
                          className="w-16 text-center font-bold text-lg text-gray-800 bg-transparent"
                        />
                        <button 
                          type="button" 
                          onClick={() => changeQty(1)}
                          disabled={quantity >= book.stock_quantity}
                          className="text-gray-600 hover:text-[#0F9D58] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold mb-2 block text-gray-700  items-center gap-2">
                        <Truck size={16} />
                        Địa chỉ giao hàng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Nhập địa chỉ giao hàng"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-bold mb-2 block text-gray-700">
                        Phương thức thanh toán
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === 'PM001' 
                            ? 'border-[#0F9D58] bg-[#0F9D58]/5' 
                            : 'border-gray-200 hover:border-[#0F9D58]/50'
                        }`}>
                          <input
                            type="radio"
                            name="payment"
                            value="PM001"
                            checked={paymentMethod === 'PM001'}
                            onChange={(e) => setPaymentMethod(e.target.value as 'PM001')}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-bold text-gray-800">💵 Tiền mặt</div>
                            <div className="text-xs text-gray-500">COD</div>
                          </div>
                        </label>

                        <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          paymentMethod === 'PM002' 
                            ? 'border-[#0F9D58] bg-[#0F9D58]/5' 
                            : 'border-gray-200 hover:border-[#0F9D58]/50'
                        }`}>
                          <input
                            type="radio"
                            name="payment"
                            value="PM002"
                            checked={paymentMethod === 'PM002'}
                            onChange={(e) => setPaymentMethod(e.target.value as 'PM002')}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-bold text-gray-800">💳 Chuyển khoản</div>
                            <div className="text-xs text-gray-500">Ngân hàng</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Phần tổng tiền cập nhật */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Tạm tính:</span>
                        <span>{subTotal.toLocaleString('vi-VN')} đ</span>
                      </div>
                      
                      {/* 3. THÊM DÒNG HIỂN THỊ PHÍ VẬN CHUYỂN */}
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Phí vận chuyển:</span>
                        <span>{SHIPPING_FEE.toLocaleString('vi-VN')} đ</span>
                      </div>
                      
                      {discountPercent > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                          <span>Giảm giá ({discountPercent}%):</span>
                          <span>- {discountAmount.toLocaleString('vi-VN')} đ</span>
                        </div>
                      )}

                      <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                        <span className="text-gray-800 font-bold">Tổng thanh toán:</span>
                        <span className="text-2xl font-bold text-[#0F9D58]">
                          {totalPrice.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>

                    {orderError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {orderError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleOrderNow}
                      disabled={isSubmitting}
                      className="w-full bg-[#0F9D58] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#0B8043] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={22} className="animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={22} />
                          Đặt hàng ngay
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Review Section - Placed inside container */}
          <ReviewSection bookId={id} />

          {/* Related Books */}
          {relatedBooks.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center">
                <LibraryBig className="text-[#0F9D58] mr-3" size={32} />
                Sách liên quan
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedBooks.map((b) => (
                  <RelatedBookCard key={b.book_id} book={b} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Success Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeModal}
          >
            <div 
              className="bg-white rounded-3xl p-8 text-center max-w-md w-full animate-in zoom-in-95 duration-300 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle size={56} className="text-green-500" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                🎉 Đặt hàng thành công!
              </h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800 font-medium">
                  ✓ Đơn hàng của bạn đã được tiếp nhận
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất
                </p>
              </div>

              <p className="text-gray-600 mb-6 text-sm">
                Bạn có thể theo dõi đơn hàng tại mục <strong className="text-[#0F9D58]">&quot;Đơn hàng của tôi&quot;</strong>
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 bg-gray-100 text-gray-800 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-all"
                >
                  Về trang chủ
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-[#0F9D58] text-white px-6 py-3 rounded-full font-bold hover:bg-[#0B8043] transition-all shadow-lg"
                >
                  Xem đơn hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default BookDetailPage;