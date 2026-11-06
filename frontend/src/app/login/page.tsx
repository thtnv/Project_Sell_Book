"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { loginUser, loginSocial, LoginData } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google'; // Import Google Hook
import FacebookLogin from '@greatsumini/react-facebook-login'; // Import Facebook Component
import { RegisterResponse } from '@/api/user';

// --- COMPONENT NÚT GOOGLE (CHỈ HOẠT ĐỘNG KHI CÓ GOOGLE CLIENT ID) ---
const GoogleLoginButton = ({
  onSocialSubmit,
  setError,
  isLoading,
}: {
  onSocialSubmit: (provider: 'google' | 'facebook', token: string) => Promise<void>;
  setError: (msg: string) => void;
  isLoading: boolean;
}) => {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await onSocialSubmit('google', tokenResponse.access_token);
    },
    onError: () => setError('Đăng nhập Google thất bại'),
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
         <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
         <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
         <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
         <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <span className="text-sm font-semibold text-gray-700">Google</span>
    </button>
  );
};

// --- NÚT GOOGLE FALLBACK NẾU CHƯA CẤU HÌNH ENV ---
const GoogleDisabledButton = ({
  setError,
  isLoading,
}: {
  setError: (msg: string) => void;
  isLoading: boolean;
}) => (
  <button
    type="button"
    onClick={() => setError('Đăng nhập Google chưa khả dụng (Cần thêm biến NEXT_PUBLIC_GOOGLE_CLIENT_ID trên Vercel).')}
    disabled={isLoading}
    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all opacity-85"
    title="Chưa cấu hình Google Client ID"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
       <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
       <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
       <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
       <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
    <span className="text-sm font-semibold text-gray-700">Google</span>
  </button>
);

// --- NÚT FACEBOOK FALLBACK NẾU CHƯA CẤU HÌNH ENV ---
const FacebookDisabledButton = ({
  setError,
  isLoading,
}: {
  setError: (msg: string) => void;
  isLoading: boolean;
}) => (
  <button
    type="button"
    onClick={() => setError('Đăng nhập Facebook chưa khả dụng (Cần thêm biến NEXT_PUBLIC_FACEBOOK_APP_ID trên Vercel).')}
    disabled={isLoading}
    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all opacity-85"
    title="Chưa cấu hình Facebook App ID"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
    </svg>
    <span className="text-sm font-semibold text-gray-700">Facebook</span>
  </button>
);

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();
  
  const [formData, setFormData] = useState<LoginData>({
    phone: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

    // Hàm kiểm tra và đặt cờ thông báo
  const checkAndSetProfileAlert = (user: RegisterResponse) => {
      // Nếu thiếu SĐT hoặc Địa chỉ -> Cần nhắc nhở
      if (!user.phone || !user.address || user.phone.trim() === "" || user.address.trim() === "") {
          localStorage.setItem('showProfileAlert', 'true');
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate
      if (!formData.phone || !formData.password) {
        setError('Vui lòng nhập đầy đủ thông tin');
        setIsLoading(false);
        return;
      }

      // Call login API
      const response = await loginUser(formData);

       if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access_token);
        
        // [FIX LỖI 1]: Đánh dấu user local
        const userWithProvider = { ...response.user, auth_provider: 'local' };
        localStorage.setItem('user_info', JSON.stringify(userWithProvider));
        
        login(userWithProvider);
        
        // User thường không cần hiện modal nhắc nhở ngay lập tức nếu không muốn
        // checkAndSetProfileAlert(userWithProvider);
      }
      
      // Update auth context
      login(response.user);
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi không xác định');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- HÀM GỌI API CHUNG (Đưa lên trên để dùng trong hook) ---
  const handleSocialSubmit = async (provider: 'google' | 'facebook', token: string) => {
      try {
          setIsLoading(true);
          const response = await loginSocial({ provider, token });
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', response.access_token);
            
            // [FIX LỖI 1 & 2]: Đánh dấu user social
            const userWithProvider = { ...response.user, auth_provider: provider };
            localStorage.setItem('user_info', JSON.stringify(userWithProvider));

            login(userWithProvider);
            
            // [FIX LỖI 2]: Chỉ đặt cờ showProfileAlert cho user social
            checkAndSetProfileAlert(userWithProvider);
          }

          router.push('/');
      } catch (err: unknown) {
          if (err instanceof Error) {
              setError(err.message || "Đăng nhập thất bại");
          } else {
              setError("Đăng nhập thất bại");
          }
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="login-page-wrapper min-h-[85vh] flex flex-col justify-center items-center p-5 relative bg-[#f0fdf4] overflow-hidden">
      
      {/* Background SVG Waves */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full">
          <path fill="#0F9D58" fillOpacity="0.1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#0F9D58" fillOpacity="0.2" d="M0,96L48,128C96,160,192,224,288,240C384,256,480,224,576,192C672,160,768,128,864,128C960,128,1056,160,1152,186.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#0F9D58" fillOpacity="0.3" d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,213.3C672,224,768,192,864,170.7C960,149,1056,139,1152,133.3C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Header Section */}
      <div className="login-header-compact text-center mb-6 z-10 animate-fade-down">
        <h1 className="text-2xl md:text-3xl font-semibold  text-[#0F9D58] mb-1 drop-shadow-sm font-quicksand px-4">
          Chào mừng bạn đến với nhà sách UTE!
        </h1>
        <p className="text-gray-600 font-semibold text-sm">
          Vui lòng đăng nhập để tiếp tục mua sách
        </p>
      </div>

      {/* Login Card */}
      <div className="form-card-compact z-10 w-full max-w-100 bg-white/95 backdrop-blur-sm p-8 rounded-[20px] shadow-[0_15px_35px_rgba(15,157,88,0.2)] border border-white/50 animate-fade-up">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6 font-quicksand flex items-center justify-center gap-2">
          <LogIn className="text-[#0F9D58]" />
          Đăng Nhập
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {/* Số điện thoại / Email */}
          <div className="form-group relative">
            <label className="block font-bold text-xs text-slate-600 mb-1.5 ml-1">
              Số điện thoại / Email {/*  */}
            </label>
            <input 
              type="text" // Đổi type="tel" thành "text" để nhập được email
              name="phone" // Giữ nguyên name nếu backend yêu cầu field này, hoặc đổi thành 'username' cho chuẩn
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập SĐT hoặc Email của bạn"
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0F9D58] focus:ring-4 focus:ring-[#0F9D58]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Mật khẩu */}
          <div className="form-group relative">
            <label className="block font-bold text-xs text-slate-600 mb-1.5 ml-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0F9D58] focus:ring-4 focus:ring-[#0F9D58]/10 transition-all pr-11 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F9D58] transition-colors p-1 disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Nút đăng nhập */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-[#0F9D58] hover:bg-[#0B8043] text-white font-bold rounded-full shadow-lg shadow-[#0F9D58]/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng Nhập Ngay'
            )}
          </button>
        </form>
            
        {/* --- PHẦN MỚI: SOCIAL LOGIN --- */}
        <div className="mt-6">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold">HOẶC TIẾP TỤC VỚI</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            
            {/* GOOGLE BUTTON: Phòng thủ khi chưa có CLIENT_ID */}
            {googleClientId ? (
              <GoogleLoginButton
                onSocialSubmit={handleSocialSubmit}
                setError={setError}
                isLoading={isLoading}
              />
            ) : (
              <GoogleDisabledButton
                setError={setError}
                isLoading={isLoading}
              />
            )}

            {/* FACEBOOK BUTTON: Phòng thủ khi chưa có APP_ID */}
            {facebookAppId ? (
              <FacebookLogin
                appId={facebookAppId}
                onSuccess={(response) => {
                  handleSocialSubmit('facebook', response.accessToken);
                }}
                onFail={(error) => {
                  console.error('Login Failed!', error);
                  setError('Đăng nhập Facebook thất bại');
                }}
                render={({ onClick }) => (
                  <button
                    type="button"
                    onClick={onClick}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Facebook</span>
                  </button>
                )}
              />
            ) : (
              <FacebookDisabledButton
                setError={setError}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>

          {/* Link sang Đăng ký */}
          <div className="text-center mt-4 text-xs font-medium text-gray-500">
            Chưa có tài khoản? 
            <Link href="/register" className="text-[#0F9D58] font-bold ml-1 hover:underline tracking-tight">
              Đăng ký tại đây
            </Link>
          </div>
      </div>

      {/* Animation Styles */}
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

export default LoginPage;