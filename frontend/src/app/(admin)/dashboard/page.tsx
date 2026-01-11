"use client";
import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Book, Loader2, TrendingUp, DollarSign } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import DashboardCharts from '@/components/admin/DashboardCharts';
import { 
  fetchDashboardStats, 
  fetchOrderStatusStats, 
  fetchMonthlyTrends,
  DashboardStats,
  OrderStatusStats,
  MonthlyTrends
} from '@/api/admin/dashboard';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatusStats | null>(null);
  const [trends, setTrends] = useState<MonthlyTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Load tất cả dữ liệu song song
        const [statsData, orderStatusData, trendsData] = await Promise.all([
          fetchDashboardStats(),
          fetchOrderStatusStats(),
          fetchMonthlyTrends(5) // 5 tháng gần nhất
        ]);
        
        setStats(statsData);
        setOrderStatus(orderStatusData);
        setTrends(trendsData);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#4FD1C5] mx-auto mb-4" size={48} />
          <p className="text-white">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !stats || !orderStatus || !trends) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C] p-4">
        <div className="text-center bg-[#2D3748] p-8 rounded-2xl">
          <p className="text-red-400 mb-4">{error || "Không thể tải dữ liệu"}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#4FD1C5] text-[#1A202C] px-6 py-2 rounded-lg font-bold"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Chuẩn bị dữ liệu cho charts
  const chartData = {
    months: trends.months,
    delivered: trends.delivered,
    cancelled: trends.cancelled,
    revenue: trends.revenue,
    statusCounts: [
      orderStatus.processing.count,
      orderStatus.confirmed.count,
      orderStatus.shipping.count,
      orderStatus.completed.count,
      orderStatus.cancelled.count,
    ]
  };

  return (
    <div className="bg-[#1A202C] min-h-screen p-6 md:p-8 flex flex-col gap-8">
      <header className="border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold text-white mb-2">Tổng quan hệ thống</h1>
        <p className="text-white/60 text-sm">
          Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')} - {new Date().toLocaleDateString('vi-VN')}
        </p>
      </header>

      {/* Stats Grid */}
      <div className="flex flex-wrap gap-6">
        <StatCard 
          title="Tổng người dùng" 
          value={stats.users.total} 
          description={`Khách: ${stats.users.customers} | Admin: ${stats.users.admins}`} 
          icon={<Users />} 
          variant="primary" 
        />
        <StatCard 
          title="Tổng đơn hàng" 
          value={stats.orders.total} 
          description={`Đã hoàn thành: ${orderStatus.completed.count}`}
          icon={<ShoppingBag />} 
          variant="success" 
        />
        <StatCard 
          title="Kho sách" 
          value={stats.books.total} 
          description={`Tồn: ${stats.books.stock} | Đã bán: ${stats.books.sold}`} 
          icon={<Book />} 
          variant="warning" 
        />
        <StatCard 
          title="Doanh thu" 
          value={`${(stats.revenue.total / 1000000).toFixed(1)}M`} 
          description={`Tổng: ${stats.revenue.total.toLocaleString('vi-VN')}đ`}
          icon={<DollarSign />} 
          variant="success" 
        />
      </div>

      {/* Status Detail Section */}
      <div className="bg-[#2D3748] rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-[#E2E8F0] mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
          <TrendingUp size={24} className="text-[#4FD1C5]" />
          Chi tiết trạng thái đơn hàng
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { 
              label: 'Chờ xác nhận', 
              val: orderStatus.processing.count, 
              amount: orderStatus.processing.amount,
              color: 'text-[#ECC94B]', 
              border: 'border-[#ECC94B]' 
            },
            { 
              label: 'Đang xử lý', 
              val: orderStatus.confirmed.count,
              amount: orderStatus.confirmed.amount, 
              color: 'text-[#4FD1C5]', 
              border: 'border-[#4FD1C5]' 
            },
            { 
              label: 'Đang giao', 
              val: orderStatus.shipping.count,
              amount: orderStatus.shipping.amount, 
              color: 'text-[#805AD5]', 
              border: 'border-[#805AD5]' 
            },
            { 
              label: 'Đã giao', 
              val: orderStatus.completed.count,
              amount: orderStatus.completed.amount, 
              color: 'text-[#48BB78]', 
              border: 'border-[#48BB78]' 
            },
            { 
              label: 'Đã hủy', 
              val: orderStatus.cancelled.count,
              amount: orderStatus.cancelled.amount, 
              color: 'text-[#F56565]', 
              border: 'border-[#F56565]' 
            },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-[#1A202C] p-4 rounded-xl text-center border border-[#4A5568] border-b-4 ${item.border} hover:-translate-y-1 transition-all`}
            >
              <div className={`text-2xl font-bold ${item.color}`}>{item.val}</div>
              <div className="text-[#EDF2F7] text-[10px] uppercase font-medium mb-1">
                {item.label}
              </div>
              <div className="text-[#A0AEC0] text-[9px]">
                {item.amount.toLocaleString('vi-VN')}đ
              </div>
            </div>
          ))}
        </div>

        <DashboardCharts data={chartData} />
      </div>
    </div>
  );
}