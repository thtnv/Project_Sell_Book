import Image, { StaticImageData } from 'next/image';
import {  Quote } from 'lucide-react';

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  image: StaticImageData;
}

export const TestimonialCard = ({ name, role, content, image }: TestimonialProps) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm relative group hover:shadow-xl transition-all">
    <Quote size={64} className="text-[#0F9D58]/10 absolute top-4 left-4" />
    <p className="italic text-slate-600 mb-8 relative z-10">{content}</p>
    <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
      <div className="w-12 h-12 rounded-full border-2 border-[#0F9D58] overflow-hidden relative">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
      <div className="text-left">
        <h6 className="font-bold text-slate-800 leading-none">{name}</h6>
        <small className="text-slate-400">{role}</small>
      </div>
    </div>
  </div>
);