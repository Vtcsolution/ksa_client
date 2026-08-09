'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

const KAFD_MAP_LINK = 'https://www.google.com/maps/search/?api=1&query=King+Abdullah+Financial+District+Riyadh';

const ContactInfo = () => {
  const contactItems = [
    {
      icon: MapPin,
      title: 'العنوان',
      details: ['مركز الملك عبدالله المالي (KAFD)', 'المنطقة 4 · مبنى 4.07 · الدور 7', 'الرياض، المملكة العربية السعودية'],
      link: KAFD_MAP_LINK,
    },
    {
      icon: Phone,
      title: 'الهاتف',
      details: ['+966 55 196 2033'],
      link: 'tel:+966551962033',
    },
    {
      icon: MessageCircle,
      title: 'واتساب',
      details: ['+966 55 196 2033'],
      link: 'https://wa.me/966551962033',
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      details: ['info@omniravalet.com'],
      link: 'mailto:info@omniravalet.com',
    },
    {
      icon: Clock,
      title: 'ساعات العمل',
      details: ['خدمة العملاء: 24/7', 'المكتب الإداري: الأحد - الخميس', '9:00 ص - 6:00 م'],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-medium mb-4 text-white">معلومات التواصل</h2>
        <p className="text-white/55 text-lg leading-relaxed">
          يسعدنا تواصلك معنا عبر أي من القنوات التالية. فريقنا جاهز لخدمتك على مدار الساعة.
        </p>
      </div>

      <div className="space-y-4">
        {contactItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden p-8 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.015] backdrop-blur-md border border-white/10 transition-all duration-500 hover:-translate-y-1 hover:border-gold-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gold-primary/10 border border-gold-primary/25 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <Icon className="w-7 h-7 text-gold-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-3 text-white">{item.title}</h3>
                  {item.link ? (
                    <a
                      href={item.link}
                      target={item.link.startsWith('http') ? '_blank' : undefined}
                      rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-white/70 hover:text-gold-primary transition-colors font-medium"
                    >
                      {item.details.map((detail, i) => (
                        <div key={i}>{detail}</div>
                      ))}
                    </a>
                  ) : (
                    <div className="text-white/70 font-medium">
                      {item.details.map((detail, i) => (
                        <div key={i}>{detail}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Google Maps - خريطة تفاعلية */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="rounded-2xl overflow-hidden border border-white/10 transition-all duration-300"
      >
        {/* Header */}
        <div className="bg-white/[0.03] border-b border-white/10 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <MapPin className="w-5 h-5 text-gold-primary" />
            <div>
              <h3 className="text-white font-medium text-base">موقعنا على الخريطة</h3>
              <p className="text-white/45 text-sm">مركز الملك عبدالله المالي (KAFD)، الرياض</p>
            </div>
          </div>
          <a
            href={KAFD_MAP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/15 hover:border-gold-primary text-white/70 hover:text-gold-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 space-x-reverse"
          >
            <span>فتح في Google Maps</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Map */}
        <div className="relative h-96 bg-[#141418]">
          <iframe
            src="https://maps.google.com/maps?q=King%20Abdullah%20Financial%20District%20Riyadh&t=&z=14&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="موقع أومنيرا فاليه - مركز الملك عبدالله المالي (KAFD)"
            className="absolute inset-0"
          />
        </div>

        {/* Footer Info */}
        <div className="bg-white/[0.03] p-4 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex items-center space-x-2 space-x-reverse text-brown-dark">
              <span className="font-bold">العنوان:</span>
              <span className="text-sage-primary">KAFD · المنطقة 4 · مبنى 4.07 · الدور 7</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-brown-text">
              <MapPin className="w-4 h-4" />
              <span>الرياض، المملكة العربية السعودية</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactInfo;
