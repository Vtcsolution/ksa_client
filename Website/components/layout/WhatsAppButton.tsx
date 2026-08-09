'use client';

import { MessageCircle, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { contactConfig } from '@/lib/contact-config';

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { whatsapp, phone } = contactConfig;

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(whatsapp.defaultMessage)}`;
    window.open(url, '_blank');
  };

  const handleCallClick = () => {
    window.location.href = `tel:${phone.primary}`;
  };

  return (
    <motion.div
      className="fixed bottom-8 left-8 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 22 }}
    >
      {/* Menu Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 left-0 mb-2 space-y-2.5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={handleWhatsAppClick}
              className="flex w-[190px] items-center gap-3 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#20bd5a]"
            >
              <MessageCircle className="h-5 w-5" />
              <span>محادثة واتساب</span>
            </button>
            <button
              onClick={handleCallClick}
              className="flex w-[190px] items-center gap-3 rounded-full bg-gold-primary px-5 py-3 text-sm font-medium text-[#0A0A0C] transition-colors duration-300 hover:bg-gold-light"
            >
              <Phone className="h-5 w-5" />
              <span>اتصال مباشر</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="تواصل معنا"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/25 transition-colors duration-300 hover:bg-[#20bd5a]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="wa"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-7 w-7 fill-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}
