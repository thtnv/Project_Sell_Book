// src/app/register/page.tsx
"use client";
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, BookOpen, Loader2 } from 'lucide-react';
import { registerUser, RegisterUserData } from '@/api/user';

// Form data interface
export interface FormData {
  fullname: string;
  phone: string;
  email: string;
  password: string;
  address: string;
}

// Yup validation schema
const schema = yup.object({
  fullname: yup.string().required('Họ và tên là bắt buộc').min(2, 'Họ và tên phải ít nhất 2 ký tự'),
  phone: yup.string().required('Số điện thoại là bắt buộc').matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  email: yup.string().required('Email là bắt buộc').email('Email không hợp lệ'),
  password: yup.string().required('Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
  address: yup.string().required('Địa chỉ là bắt buộc').min(5, 'Địa chỉ phải ít nhất 5 ký tự'),
}).required();

const RegisterPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setError('');
    try {
      // Map form data to API format
      const userData: RegisterUserData = {
        username: data.fullname,  // Backend expects 'username'
        email: data.email,
        password: data.password,
        phone: data.phone,
        address: data.address,
      };

      await registerUser(userData);
      reset();
      
      // Hiển thị thông báo thành công
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Đã xảy ra lỗi không xác định');
      }
    }
  };

  return (
    <div className="register-page-wrapper min-h-[90vh] flex flex-col justify-center items-center p-5 relative bg-[#f0fdf4] overflow-hidden">
      {/* Background SVG Waves */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full">
          <path fill="#0F9D58" fillOpacity="0.1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#0F9D58" fillOpacity="0.2" d="M0,96L48,128C96,160,192,224,288,240C384,256,480,224,576,192C672,160,768,128,864,128C960,128,1056,160,1152,186.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Header Section */}
      <div className="register-header-compact text-center mb-4 z-10 animate-fade-down">
        <h1 className="text-3xl font-extrabold text-[#0F9D58] mb-1 drop-shadow-sm font-quicksand flex items-center justify-center gap-2">
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

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Họ tên */}
          <div className="form-group">
            <label className="block font-bold text-xs text-slate-600 mb-1 ml-1">Họ và tên</label>
            <input
              type="text"
              placeholder="Nhập họ tên đầy đủ"
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-4 transition-all pr-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.fullname
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                  : 'border-gray-200 focus:border-[#0F9D58] focus:ring-[#0F9D58]/10'
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
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-4 transition-all pr-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.phone
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                  : 'border-gray-200 focus:border-[#0F9D58] focus:ring-[#0F9D58]/10'
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
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-4 transition-all pr-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                  : 'border-gray-200 focus:border-[#0F9D58] focus:ring-[#0F9D58]/10'
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
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-4 transition-all pr-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.address
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                  : 'border-gray-200 focus:border-[#0F9D58] focus:ring-[#0F9D58]/10'
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
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-4 transition-all pr-10 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-gray-200 focus:border-[#0F9D58] focus:ring-[#0F9D58]/10'
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="w-full py-3 mt-4 bg-[#0F9D58] hover:bg-[#0B8043] text-white font-bold rounded-full shadow-lg shadow-[#0F9D58]/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang đăng ký...
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