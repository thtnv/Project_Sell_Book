"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  ReplyAll, 
  ChevronLeft, 
  User, 
  Calendar, 
  PencilLine, 
  Send,
  Loader2
} from "lucide-react";
import { 
  fetchContactDetailAdmin, 
  replyContactAdmin, 
  ContactResponse 
} from "@/api/contact";

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
}

export default function AdminReplyContactPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = parseInt(params.id as string);
  
  const [contact, setContact] = useState<ContactResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const loadContact = async () => {
      try {
        setLoading(true);
        const data = await fetchContactDetailAdmin(contactId);
        setContact(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (contactId) {
      loadContact();
    }
  }, [contactId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      setError("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await replyContactAdmin(contactId, { admin_response: replyText });
      alert("Phản hồi đã được gửi thành công!");
      router.push("/dashboard/contacts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi phản hồi thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C]">
        <Loader2 className="animate-spin text-[#4FD1C5]" size={48} />
      </div>
    );
  }

  if (error && !contact) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A202C] p-4">
        <div className="text-center bg-[#2D3748] p-8 rounded-2xl">
          <p className="text-red-400 mb-4">{error}</p>
          <Link 
            href="/dashboard/contacts"
            className="inline-flex items-center gap-2 bg-[#4FD1C5] text-[#1A202C] px-6 py-3 rounded-full font-bold"
          >
            <ChevronLeft size={20} /> Quay lại
          </Link>
        </div>
      </div>
    );
  }

  if (!contact) return null;

  return (
    <div className="min-h-screen bg-[#1A202C] py-8 px-4 font-inter text-sm text-[#E2E8F0]">
      <div className="max-w-200 mx-auto bg-[#2D3748] rounded-xl shadow-2xl p-8 border border-white/10 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4FD1C5]/10 rounded-lg text-[#4FD1C5]">
              <ReplyAll size={24} />
            </div>
            <h3 className="m-0 font-bold text-[#4FD1C5] text-lg tracking-tight">
              Phản hồi khách hàng
            </h3>
          </div>
          <Link
            href="/dashboard/contacts"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#4A5568] text-xs font-medium hover:bg-white/5 transition-all text-gray-300"
          >
            <ChevronLeft size={14} /> Quay lại
          </Link>
        </div>

        {/* Customer Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <InfoCard 
            icon={<User size={18} />} 
            label="Khách hàng" 
            value={contact.full_name} 
            subValue={contact.email} 
          />
          <InfoCard 
            icon={<Calendar size={18} />} 
            label="Thời gian gửi" 
            value={contact.sent_at ? new Date(contact.sent_at).toLocaleDateString('vi-VN') : 'N/A'}
            subValue={contact.sent_at ? new Date(contact.sent_at).toLocaleTimeString('vi-VN') : 'N/A'}
          />
        </div>

        {/* Message Quote */}
        <div className="bg-[#111827] p-5 rounded-xl border-l-4 border-[#4FD1C5] mb-8 shadow-inner">
          <span className="block text-[10px] uppercase font-bold text-gray-500 mb-2">
            Chủ đề: {contact.subject}
          </span>
          <p className="text-gray-200 italic leading-relaxed text-[0.9rem]">
            &quot;{contact.message}&quot;
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Reply Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 font-bold text-[#4FD1C5] ml-1">
              <PencilLine size={18} /> Soạn nội dung phản hồi
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Nhập nội dung trả lời khách hàng..."
              disabled={submitting}
              required
              className="w-full bg-[#0F172A] border border-[#4A5568] text-white rounded-xl p-4 min-h-45 focus:outline-none focus:border-[#4FD1C5] focus:ring-4 focus:ring-[#4FD1C5]/10 transition-all text-[0.95rem] leading-relaxed resize-y shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-linear-to-br from-[#4FD1C5] to-[#38B2AC] text-[#1A202C] font-black py-3.5 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest hover:brightness-110 hover:-translate-y-0.5 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <span>Xác nhận gửi phản hồi</span>
                <Send size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const InfoCard = ({ icon, label, value, subValue }: InfoCardProps) => (
  <div className="bg-[#0F172A]/50 p-4 rounded-xl border border-white/5 flex items-start gap-3 transition-colors hover:border-[#4FD1C5]/20">
    <div className="text-[#4FD1C5] mt-1">{icon}</div>
    <div>
      <span className="block text-[10px] uppercase font-black text-[#4FD1C5] tracking-widest mb-1">
        {label}
      </span>
      <div className="font-bold text-white text-base">{value}</div>
      <div className="text-blue-400 text-xs italic truncate">{subValue}</div>
    </div>
  </div>
);