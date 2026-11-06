// src/app/register/page.tsx
"use client";
import React, { useState, useRef, useEffect } from 'react'; // Thêm useRef, useEffect
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, BookOpen, Loader2, X } from 'lucide-react';
import { registerUser, RegisterUserData, sendRegisterOtp } from '@/api/user';

export interface FormData {
  fullname: string;
  phone: string;
  email: string;
  password: string;
  address: string;
}

const schema = yup.object({
  fullname: yup.string().required('Họ và tên là bắt buộc').min(2, 'Họ và tên phải ít nhất 2 ký tự'),
  phone: yup.string().required('Số điện thoại là bắt buộc').matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  email: yup.string().required('Email là bắt buộc').email('Email không hợp lệ'),
  password: yup.string().required('Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
  address: yup.string().required('Địa chỉ là bắt buộc').min(5, 'Địa chỉ phải ít nhất 5 ký tự'),
}).required();

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // State & Refs cho OTP 6 ô
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(new Array(6).fill("")); // Mảng 6 phần tử rỗng
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // Ref để điều khiển focus

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Reset OTP khi mở modal
  useEffect(() => {
    if (showOtpModal) {
      setOtpValues(new Array(6).fill(""));
      // Focus vào ô đầu tiên khi modal mở
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [showOtpModal]);

  // Xử lý nhập liệu từng ô
  const handleOtpChange = (index: number, value: string) => {
    // Chỉ cho phép nhập số
    if (isNaN(Number(value))) return;

    const newOtp = [...otpValues];
    // Lấy ký tự cuối cùng (trường hợp user nhập đè)
    newOtp[index] = value.substring(value.length - 1);
    setOtpValues(newOtp);

    // Tự động focus sang ô tiếp theo nếu có giá trị
    if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
    }
  };

  // Xử lý nút Backspace (Xóa lùi)
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
    }
  };

  // Xử lý Paste (Dán mã)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
    
    if (pastedData) {
        const newOtp = [...otpValues];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtpValues(newOtp);
        
        // Focus vào ô cuối cùng được điền hoặc ô tiếp theo
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    }
  };

  const onSubmitForm: SubmitHandler<FormData> = async (data) => {
    setError('');
    setIsSendingOtp(true);
    try {
      await sendRegisterOtp(data.email);
      setPendingData(data);
      setShowOtpModal(true);
    } catch (err: any) {
      setError(err.message || 'Lỗi gửi OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    // Gộp mảng thành chuỗi OTP
    const otpCode = otpValues.join('');

    if (!pendingData || !otpCode) return;
    if (otpCode.length !== 6) {
        alert("Vui lòng nhập đủ 6 số xác thực");
        return;
    }

    setIsVerifying(true);
    try {
      const userData: RegisterUserData = {
        username: pendingData.fullname,
        email: pendingData.email,
        password: pendingData.password,
        phone: pendingData.phone,
        address: pendingData.address,
        otp: otpCode,
      };

      await registerUser(userData);
      
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch (err: any) {
      alert(err.message || 'Đăng ký thất bại. Kiểm tra lại mã OTP.');
      // Reset OTP nếu sai để nhập lại
      setOtpValues(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="register-page-wrapper min-h-[90vh] flex flex-col justify-center items-center p-5 relative bg-[#f0fdf4] overflow-hidden">
      {/* ... (Phần Background SVG Waves giữ nguyên) ... */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full">
          <path fill="#0F9D58" fillOpacity="0.1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#0F9D58" fillOpacity="0.2" d="M0,96L48,128C96,160,192,224,288,240C384,256,480,224,576,192C672,160,768,128,864,128C960,128,1056,160,1152,186.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Header Section */}
      <div className="register-header-compact text-center mb-4 z-10 animate-fade-down">
        <h1 className="text-3xl font-semibold text-[#0F9D58] mb-1 drop-shadow-sm font-quicksand flex items-center justify-center gap-2">
          <BookOpen size={32} />
          Đăng Ký Tài Khoản
        </h1>
        <p className="text-gray-600 font-semibold italic text-sm">
          Trở thành thành viên của nhà sách UTE
        </p>
      </div>

      {/* Form Card */}
      <div className="form-card-compact z-10 w-full max-w-112.5 bg-white/95 backdrop-blur-sm p-8 rounded-[20px] shadow-[0_15px_35px_rgba(15,157,88,0.2)] border border-white/50 animate-fade-up">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-6 font-quicksand">
          Thông tin đăng ký
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmitForm)}>
          {/* Họ tên */}
          <div className="form-group">
            <label className="block font-bold text-xs text-slate-600 mb-1 ml-1">Họ và tên</label>
            <input
              type="text"
              placeholder="Nhập họ tên đầy đủ"
              disabled={isSendingOtp}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-4 transition-all pr-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.fullname ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#0F9D58] focus:ring-[#0F9D58]/10'
              }`}
              {...register('fullname')}
            />
            {errors.fullname && <p className="text-red-500 text-xs mt-1 ml-1">{errors.fullname.message}</p>}
          </div>

          {/* Số điện thoại */}
          <div className="form-group">
            <label className="block font-bold text-xs text-slate-600 mb-1 ml-1">Số điện thoại</label>
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              disabled={isSendingOtp}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-4 transition-all pr-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#0F9D58] focus:ring-[#0F9D58]/10'
              }`}
              {...register('phone')}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone.message}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="block font-bold text-xs text-slate-600 mb-1 ml-1">Email</label>
            <input
              type="email"
              placeholder="Nhập địa chỉ email"
              disabled={isSendingOtp}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-4 transition-all pr-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#0F9D58] focus:ring-[#0F9D58]/10'
              }`}
              {...register('email')}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
          </div>

          {/* Địa chỉ */}
          <div className="form-group">
            <label className="block font-bold text-xs text-slate-600 mb-1 ml-1">Địa chỉ</label>
            <input
              type="text"
              placeholder="Nhập địa chỉ"
              disabled={isSendingOtp}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-4 transition-all pr-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#0F9D58] focus:ring-[#0F9D58]/10'
              }`}
              {...register('address')}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1 ml-1">{errors.address.message}</p>}
          </div>

          {/* Mật khẩu */}
          <div className="form-group">
            <label className="block font-bold text-xs text-slate-600 mb-1 ml-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                disabled={isSendingOtp}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-4 transition-all pr-10 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#0F9D58] focus:ring-[#0F9D58]/10'
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSendingOtp}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F9D58] transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            disabled={isSendingOtp}
            className="w-full py-3 mt-4 bg-[#0F9D58] hover:bg-[#0B8043] text-white font-bold rounded-full shadow-lg shadow-[#0F9D58]/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSendingOtp ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang gửi mã xác thực...
              </>
            ) : (
              'Đăng Ký Ngay'
            )}
          </button>

          {/* Link sang Đăng nhập */}
          <div className="text-center mt-4 text-xs font-medium text-gray-500">
            Bạn đã có tài khoản?
            <Link href="/login" className="text-[#0F9D58] font-bold ml-1 hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </form>
      </div>

      {/* --- MODAL NHẬP OTP --- */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setShowOtpModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
                
                <h3 className="text-2xl font-bold text-slate-800 text-center mb-2 font-quicksand">Xác thực Email</h3>
                <p className="text-sm text-gray-500 text-center mb-8">
                    Mã xác thực 6 số đã được gửi đến: <br/> 
                    <span className="font-bold text-[#0F9D58] text-base">{pendingData?.email}</span>
                </p>

                <div className="space-y-8">
                    {/* Khu vực 6 ô Input */}
                    <div className="flex justify-center gap-2 sm:gap-3">
                        {otpValues.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-[#0F9D58] focus:ring-4 focus:ring-[#0F9D58]/10 outline-none transition-all bg-gray-50 text-slate-700"
                            />
                        ))}
                    </div>

                    <button 
                        onClick={handleVerifyAndRegister}
                        disabled={isVerifying}
                        className="w-full py-3.5 bg-[#0F9D58] hover:bg-[#0B8043] text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                    >
                        {isVerifying ? (
                             <>
                                <Loader2 size={20} className="animate-spin" />
                                Đang xác thực...
                             </>
                        ) : "Xác nhận đăng ký"}
                    </button>
                    
                    <div className="text-center text-xs text-gray-400">
                        Chưa nhận được mã? <button onClick={handleSubmit(onSubmitForm)} disabled={isSendingOtp} className="text-[#0F9D58] font-bold hover:underline disabled:opacity-50">Gửi lại</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Animation Styles (Giữ nguyên) */}
      <style jsx>{`
        .animate-fade-down {
          animation: fadeDown 0.6s ease-out forwards;
        }
        .animate-fade-up {
          animation: fadeUp 0.8s ease-out forwards;
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;