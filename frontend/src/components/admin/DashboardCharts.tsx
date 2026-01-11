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

// 1. Định nghĩa Interface cho dữ liệu đầu vào (Thay thế cho 'any')
interface DashboardDataProps {
  months: string[];
  delivered: number[];
  cancelled: number[];
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
    yellow: '#ECC94B',
    teal: '#4FD1C5',
    purple: '#805AD5',
    green: '#48BB78',
    red: '#F56565',
    blue: '#63B3ED'
  };

  // Cấu hình dữ liệu cho Line Chart
  const lineData = {
    labels: data.months,
    datasets: [
      { label: 'Đã giao', data: data.delivered, borderColor: colors.green, tension: 0.3, fill: false },
      { label: 'Đã hủy', data: data.cancelled, borderColor: colors.red, tension: 0.3, fill: false },
    ]
  };

  // Cấu hình dữ liệu cho Doughnut Chart
  const doughnutData = {
    labels: ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'],
    datasets: [{
      data: data.statusCounts,
      backgroundColor: [colors.yellow, colors.teal, colors.purple, colors.green, colors.red],
      borderWidth: 0,
    }]
  };

  // Cấu hình dữ liệu cho Bar Chart
  const barData = {
    labels: data.months,
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: data.revenue,
      backgroundColor: colors.blue,
      borderRadius: 6,
    }]
  };

  // Định nghĩa Options với kiểu dữ liệu chuẩn của Chart.js
  const commonOptions: ChartOptions<'line' | 'bar' | 'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { 
          color: '#EDF2F7', 
          usePointStyle: true,
          font: { family: 'Inter' } 
        } 
      }
    },
    scales: {
      x: { ticks: { color: '#EDF2F7' }, grid: { display: false } },
      y: { ticks: { color: '#EDF2F7' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-[#1A202C]/60 border border-[#4A5568] rounded-2xl p-6 h-100">
          <h3 className="text-[#63B3ED] font-semibold mb-4 text-center">📉 Xu hướng theo tháng</h3>
          <Line data={lineData} options={commonOptions as ChartOptions<'line'>} />
        </div>
        <div className="flex-1 bg-[#1A202C]/60 border border-[#4A5568] rounded-2xl p-6 h-100">
          <h3 className="text-[#F6AD55] font-semibold mb-4 text-center">🥧 Tỷ lệ trạng thái</h3>
          <Doughnut 
            data={doughnutData} 
            options={{
              ...commonOptions, 
              cutout: '70%',
              scales: { x: { display: false }, y: { display: false } } // Doughnut không cần trục tọa độ
            } as ChartOptions<'doughnut'>} 
          />
        </div>
      </div>
      <div className="bg-[#1A202C]/60 border border-[#4A5568] rounded-2xl p-6 h-100">
        <h3 className="text-[#48BB78] font-semibold mb-4 text-center">💰 Doanh thu thực tế</h3>
        <Bar data={barData} options={commonOptions as ChartOptions<'bar'>} />
      </div>
    </div>
  );
};

export default DashboardCharts;