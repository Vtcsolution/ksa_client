'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { generateFAQSchema } from '@/lib/schemas';

const PricingFAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'هل الأسعار شاملة لضريبة القيمة المضافة؟',
      answer: 'جميع الأسعار المذكورة غير شاملة لضريبة القيمة المضافة (15%). سيتم إضافة الضريبة على الفاتورة النهائية.',
    },
    {
      question: 'هل هناك رسوم خفية؟',
      answer: 'لا يوجد أي رسوم خفية. جميع التكاليف واضحة ومحددة في العقد. أي خدمات إضافية تطلبها سيتم الاتفاق على تكلفتها مسبقاً.',
    },
    {
      question: 'كيف يتم الدفع؟',
      answer: 'نقبل الدفع نقداً، بالبطاقات الائتمانية، مدى، أو التحويل البنكي. للشركات، نوفر فواتير شهرية وخيارات دفع مرنة.',
    },
    {
      question: 'هل يمكن تخصيص الباقة حسب احتياجاتي؟',
      answer: 'نعم بالتأكيد! جميع باقاتنا قابلة للتخصيص. يمكنك اختيار عدد الساعات، عدد السائقين، والخدمات الإضافية حسب احتياجاتك.',
    },
    {
      question: 'ما هي سياسة الإلغاء؟',
      answer: 'يمكن الإلغاء مجاناً قبل 48 ساعة من موعد الخدمة. الإلغاء خلال 24-48 ساعة يخضع لرسوم 25%. الإلغاء خلال أقل من 24 ساعة يخضع لرسوم 50%.',
    },
    {
      question: 'هل تقدمون خصومات للعقود طويلة الأمد؟',
      answer: 'نعم! نقدم خصومات تصل إلى 15% للعقود السنوية، و10% للعقود نصف السنوية. كلما طالت مدة التعاقد، زاد الخصم.',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(faqs)) }}
      />
      <section ref={ref} className="py-28 lg:py-40 bg-[#0A0A0C]">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[0.95] mb-4 gold-shine-effect">أسئلة شائعة حول الأسعار</h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors bg-white/[0.03] backdrop-blur-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-right flex items-center justify-between hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-lg font-medium text-white">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gold-primary transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 bg-white/[0.02]">
                  <p className="text-white/65 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-white/65 mb-6">لديك استفسارات أخرى؟</p>
          <a
            href="/contact"
            className="btn-gold px-8 py-4 inline-flex items-center space-x-2 space-x-reverse"
          >
            <span>تواصل معنا</span>
          </a>
        </motion.div>
      </div>
      </section>
    </>
  );
};

export default PricingFAQ;
