// frontend/src/components/admin/DashboardCharts.tsx
"use client";
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Cập nhật interface props để khớp với dữ liệu mới
interface DashboardDataProps {
  months: string[];
  delivered: number[];
  cancelled: number[];
  // [THÊM]
  processing?: number[];
  confirmed?: number[];
  shipping?: number[];
  revenue: number[];
  statusCounts: number[];
}

interface DashboardChartsProps {
  data: DashboardDataProps;
}

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const DashboardCharts = ({ data }: DashboardChartsProps) => {
  const colors = {
    yellow: '#ECC94B', // Chờ xác nhận
    teal: '#4FD1C5',   // Đang xử lý
    purple: '#805AD5', // Đang giao
    green: '#48BB78',  // Đã giao
    red: '#F56565',    // Đã hủy
    blue: '#63B3ED'    // Doanh thu
  };

  // [SỬA]: Cấu hình 5 đường biểu diễn cho 5 trạng thái
  // Sử dụng (data.field || []) để tránh lỗi nếu backend chưa trả về dữ liệu
  const lineData = {
    labels: data.months,
    datasets: [
      { 
        label: 'Chờ xác nhận', 
        data: data.processing || [], 
        borderColor: colors.yellow, 
        backgroundColor: colors.yellow,
        tension: 0.3,
        pointRadius: 3 
      },
      { 
        label: 'Đang xử lý', 
        data: data.confirmed || [], 
        borderColor: colors.teal, 
        backgroundColor: colors.teal,
        tension: 0.3,
        pointRadius: 3
      },
      { 
        label: 'Đang giao', 
        data: data.shipping || [], 
        borderColor: colors.purple, 
        backgroundColor: colors.purple,
        tension: 0.3,
        pointRadius: 3 
      },
      { 
        label: 'Đã giao', 
        data: data.delivered, 
        borderColor: colors.green, 
        backgroundColor: colors.green,
        tension: 0.3,
        pointRadius: 3 
      },
      { 
        label: 'Đã hủy', 
        data: data.cancelled, 
        borderColor: colors.red, 
        backgroundColor: colors.red,
        tension: 0.3,
        pointRadius: 3 
      },
    ]
  };

  const doughnutData = {
    labels: ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'],
    datasets: [{
      data: data.statusCounts,
      backgroundColor: [colors.yellow, colors.teal, colors.purple, colors.green, colors.red],
      borderWidth: 0,
    }]
  };

  const barData = {
    labels: data.months,
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: data.revenue,
      backgroundColor: colors.blue,
      borderRadius: 4,
      barThickness: 40,
      maxBarThickness: 60,
    }]
  };

  // Options chung
  const commonOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { color: '#EDF2F7', usePointStyle: true, font: { family: 'Inter', size: 11 } } 
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(26, 32, 44, 0.95)',
        titleColor: '#EDF2F7',
        bodyColor: '#A0AEC0',
        borderColor: '#4A5568',
        borderWidth: 1
      }
    },
    scales: {
      x: { 
        ticks: { color: '#EDF2F7', font: { size: 10 } }, 
        grid: { display: false } 
      },
      y: { 
        ticks: { color: '#EDF2F7', font: { size: 10 } }, 
        grid: { color: 'rgba(255,255,255,0.05)' },
        beginAtZero: true, // Đảm bảo trục Y bắt đầu từ 0
        suggestedMax: 10 // Đảm bảo biểu đồ không bị bẹt nếu dữ liệu quá nhỏ
      }
    }
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 10 },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#EDF2F7', usePointStyle: true, font: { family: 'Inter', size: 11 } }
      }
    },
    cutout: '70%',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Line Chart */}
        <div className="flex-1 bg-[#1A202C]/60 border border-[#4A5568] rounded-2xl p-6 h-96">
          <h3 className="text-[#63B3ED] font-semibold mb-4 text-center">📉 Xu hướng đơn hàng</h3>
          <div className="h-full pb-8"> 
            <Line data={lineData} options={commonOptions as ChartOptions<'line'>} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="flex-1 bg-[#1A202C]/60 border border-[#4A5568] rounded-2xl p-6 h-96 flex flex-col">
          <h3 className="text-[#F6AD55] font-semibold mb-4 text-center">🥧 Tỷ lệ trạng thái</h3>
          <div className="relative grow">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-[#1A202C]/60 border border-[#4A5568] rounded-2xl p-6 h-96">
        <h3 className="text-[#48BB78] font-semibold mb-4 text-center">💰 Doanh thu thực tế</h3>
        <div className="h-full pb-8">
          <Bar data={barData} options={commonOptions as ChartOptions<'bar'>} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;