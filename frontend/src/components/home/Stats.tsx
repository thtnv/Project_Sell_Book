import React, { cloneElement, ReactElement } from 'react';

interface StatItemProps {
  icon: ReactElement;
  number: string;
  label: string;
}

export const StatItem = ({ icon, number, label }: StatItemProps) => (
  <div className="text-center">
    <div className="w-20 h-20 bg-[#0F9D58]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#0F9D58]">
      {/* FIX: Sử dụng cloneElement từ import React */}
      {cloneElement(icon)}
    </div>
    <span className="block text-3xl font-extrabold text-slate-800">{number}</span>
    <span className="text-slate-500 text-sm font-medium">{label}</span>
  </div>
);