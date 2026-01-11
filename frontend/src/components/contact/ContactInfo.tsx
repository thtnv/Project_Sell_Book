"use client";
import React from 'react';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';

const ContactInfo = () => {
  const infoItems = [
    {
      icon: <MapPin size={20} />,
      title: "Địa Chỉ",
      content: "48 Cao Thắng, Phường Thanh Bình, Quận Hải Châu, TP Đà Nẵng"
    },
    {
      icon: <Mail size={20} />,
      title: "Email",
      content: "info@bookshop.com"
    },
    {
      icon: <Phone size={20} />,
      title: "Điện Thoại",
      content: "+012 345 67890"
    },
    {
      icon: <Clock size={20} />,
      title: "Giờ Làm Việc",
      content: "Thứ 2 - Thứ 7: 8:00 - 18:00"
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-[#0f9d58]/10 p-8 h-full flex flex-col animate-fade-left">
      <h3 className="text-2xl font-bold text-slate-800 mb-6 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:height-1 after:bg-[#0F9D58] after:rounded-full">
        Thông Tin
      </h3>

      <div className="space-y-6 grow">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-10 h-10 bg-[#0F9D58]/10 rounded-full flex shrink-0 items-center justify-center mr-4">
              <span className="text-[#0F9D58]">{item.icon}</span>
            </div>
            <div className="info-content">
              <h5 className="text-base font-bold text-slate-800 leading-tight">{item.title}</h5>
              <p className="text-slate-500 text-sm leading-relaxed">{item.content}</p>
            </div>
          </div>
        ))}

        {/* Google Maps Embed Placeholder */}
        <div className="mt-4 rounded-xl overflow-hidden shadow-sm h-50 border border-slate-100">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.811832049282!2d108.21319247582534!3d16.075253839257643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314218307d81cc95%3A0x292f167ad3089945!2zNDggQ2FvIFRo4bqvbmcsIFRoYW5oIELDr25oLCBI4bqjaSBDaMOidSwgxJDDoCBO4bq5bmcgNTUwMDAwLCBWaWV0bmFt!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;