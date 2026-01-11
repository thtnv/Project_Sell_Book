"use client";
import React from 'react';

interface OrderStatsProps {
  stats: {
    label: string;
    count: number;
    amount: number;
    color: string;
  }[];
}

const OrderStats = ({ stats }: OrderStatsProps) => {
  return (
    <div className="flex flex-nowrap gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className="flex-1 min-w-50 bg-[#2D3748] rounded-2xl p-6 border border-[#4A5568] shadow-lg transition-all hover:border-[#4FD1C5]/50 group"
        >
          <h3 className="text-[#A0AEC0] text-sm font-semibold uppercase tracking-wider mb-2 group-hover:text-white transition-colors">
            {stat.label}
          </h3>
          <div className="text-3xl font-bold text-[#4FD1C5] mb-1">
            {stat.count}
          </div>
          <div className="text-[#E2E8F0] text-sm font-medium">
            {stat.amount.toLocaleString('vi-VN')}₫
          </div>
          <div className={`h-1 w-12 rounded-full mt-4 ${stat.color}`}></div>
        </div>
      ))}
    </div>
  );
};

export default OrderStats;