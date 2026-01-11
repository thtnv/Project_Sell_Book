"use client";
import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  variant: 'primary' | 'success' | 'warning';
}

const StatCard = ({ title, value, description, icon, variant }: StatCardProps) => {
  const iconColors = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
  };

  return (
    <div className="bg-[#2D3748] border border-[#4A5568] rounded-2xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-linear-to-br hover:from-[#2D3748] hover:to-[#3b4a66] grow min-w-70">
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-inner ${iconColors[variant]}`}>
          <span className="text-white">{icon}</span>
        </div>
        <h3 className="text-[#EDF2F7] text-sm font-semibold uppercase tracking-wider">{title}</h3>
      </div>
      <div className="text-3xl font-bold text-[#EDF2F7] mb-2">{value}</div>
      <p className="text-[#EDF2F7] text-xs opacity-80">{description}</p>
    </div>
  );
};

export default StatCard;