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

  const lineData = {
    labels: data.months,
    datasets: [
      { label: 'Đã giao', data: data.delivered, borderColor: colors.green, tension: 0.3, fill: false },
      { label: 'Đã hủy', data: data.cancelled, borderColor: colors.red, tension: 0.3, fill: false },
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
      borderRadius: 6,
    }]
  };

  // Options chung
  const commonOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', // Đưa legend xuống dưới để biểu đồ có nhiều không gian trung tâm hơn
        labels: { color: '#EDF2F7', usePointStyle: true, font: { family: 'Inter', size: 12 } } 
      }
    },
    scales: {
      x: { ticks: { color: '#EDF2F7' }, grid: { display: false } },
      y: { ticks: { color: '#EDF2F7' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  // Cấu hình riêng cho Doughnut để đảm bảo căn giữa
  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10 // Tạo khoảng trống nhỏ để không bị cắt mép
    },
    plugins: {
      legend: {
        position: 'bottom', // Legend ở dưới giúp vòng tròn tập trung vào giữa
        labels: { color: '#EDF2F7', usePointStyle: true }
      }
    },
    cutout: '70%',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Line Chart */}
        <div className="flex-1 bg-[#1A202C]/60 border border-[#4A5568] rounded-2xl p-6 h-100">
          <h3 className="text-[#63B3ED] font-semibold mb-4 text-center">📉 Xu hướng theo tháng</h3>
          <div className="h-100"> {/* Wrapper để kiểm soát chiều cao canvas */}
            <Line data={lineData} options={commonOptions as ChartOptions<'line'>} />
          </div>
        </div>

        {/* Doughnut Chart - Đã sửa lỗi lệch */}
        <div className="flex-1 bg-[#1A202C]/60 border border-[#4A5568] rounded-2xl p-6 h-100 flex flex-col">
          <h3 className="text-[#F6AD55] font-semibold mb-4 text-center">🥧 Tỷ lệ trạng thái</h3>
          <div className="relative grow"> {/* Container chứa canvas để căn giữa */}
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-[#1A202C]/60 border border-[#4A5568] rounded-2xl p-6 h-100">
        <h3 className="text-[#48BB78] font-semibold mb-4 text-center">💰 Doanh thu thực tế</h3>
        <div className="h-100">
          <Bar data={barData} options={commonOptions as ChartOptions<'bar'>} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;