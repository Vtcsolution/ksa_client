'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from '@/components/ui/BlurImage';
import { CheckCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { generateFAQSchema } from '@/lib/schemas';
import CinematicBreak from '@/components/ui/CinematicBreak';
import RevealMask from '@/components/ui/RevealMask';

interface ServiceContentProps {
  data: any;
}

const FALLBACK_IMG = '/images/services/valet-parking.jpg';

const ServiceContent = ({ data }: ServiceContentProps) => {
  return (
    <div className="bg-[#0A0A0C]">
      <OverviewSection data={data.overview} />
      <BenefitsSection benefits={data.benefits} />
      <FeaturesSection features={data.features} />
      <CinematicBreak image="/images/atmos/atmos-2.jpg" kicker="التزامنا">
        كل تفصيلة مدروسة — لتجربة وصول
        <span className="text-gold-light"> لا تشوبها شائبة</span>.
      </CinematicBreak>
      <ProcessSection process={data.process} />
      <ClientsSection clients={data.clients} />
      <FAQSection faqs={data.faqs} />
    </div>
  );
};

const FeatureItem = ({ feature, index, isInView }: { feature: any; index: number; isInView: boolean }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
    >
      <div className="flex-1">
        <RevealMask className="relative h-64 rounded-xl overflow-hidden">
          <Image
            src={imgError ? FALLBACK_IMG : feature.image}
            alt={feature.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        </RevealMask>
      </div>
      <div className="flex-1">
        <h3 className="text-3xl font-semibold mb-4 text-sage-primary">{feature.title}</h3>
        <p className="text-brown-dark leading-relaxed text-lg">{feature.description}</p>
      </div>
    </motion.div>
  );
};

const OverviewSection = ({ data }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="section-padding py-28 lg:py-40 bg-[#0A0A0C]">
      <div className="container-custom max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="bg-white/[0.03] backdrop-blur-md p-12 md:p-16 rounded-3xl border border-white/10"
        >
          <div className="mb-5 flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
            <span className="h-px w-10 bg-gold-primary/50" />
            نظرة عامة
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-10 gold-shine-effect leading-[0.95]">{data.title}</h2>
          <div className="text-brown-dark text-lg leading-loose space-y-6 whitespace-pre-line">
            {data.description}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const BenefitsSection = ({ benefits }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="section-padding py-28 lg:py-40 bg-[#0A0A0C]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="mb-5 flex items-center justify-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
            <span className="h-px w-10 bg-gold-primary/50" />
            لماذا أومنيرا
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 gold-shine-effect leading-[0.95]">
            الفوائد والمزايا
          </h2>
          <p className="text-brown-dark text-xl max-w-3xl mx-auto font-medium">
            اكتشف كيف تضيف خدماتنا قيمة حقيقية لأعمالك
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative overflow-hidden group p-10 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.015] backdrop-blur-md border border-white/10 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="w-16 h-16 rounded-2xl bg-gold-primary/10 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 border border-gold-primary/25">
                <CheckCircle className="w-8 h-8 text-gold-primary" />
              </div>
              <h3 className="text-2xl font-medium mb-4 text-white">{benefit.title}</h3>
              <p className="text-white/60 leading-relaxed text-base">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = ({ features }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="section-padding py-28 lg:py-40 bg-[#0A0A0C]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <div className="mb-5 flex items-center justify-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
            <span className="h-px w-10 bg-gold-primary/50" />
            التقنية
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 gold-shine-effect leading-[0.95]">
            المميزات التقنية
          </h2>
          <p className="text-brown-dark text-xl max-w-3xl mx-auto font-medium">
            تقنيات وأدوات متقدمة لضمان أفضل خدمة
          </p>
        </motion.div>

        <div className="space-y-16">
          {features.map((feature: any, index: number) => (
            <FeatureItem key={index} feature={feature} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProcessSection = ({ process }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="section-padding py-28 lg:py-40 bg-[#0A0A0C]">
      <div className="container-custom max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <div className="mb-5 flex items-center justify-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
            <span className="h-px w-10 bg-gold-primary/50" />
            منهجيتنا
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 gold-shine-effect leading-[0.95]">
            كيف نعمل؟
          </h2>
          <p className="text-brown-dark text-xl font-medium">عملية واضحة ومنظمة من البداية للنهاية</p>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden lg:block absolute right-1/2 top-0 bottom-0 w-1 bg-white/10 rounded-full"></div>

          <div className="space-y-12">
            {process.map((step: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className={`relative overflow-hidden group flex-1 ${index % 2 === 0 ? 'lg:text-left' : 'lg:text-right lg:order-2'} p-8 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.015] backdrop-blur-md border border-white/10 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]`}>
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <h3 className="text-2xl font-medium mb-3 text-sage-primary">{step.title}</h3>
                    <p className="text-white/60 leading-relaxed">{step.description}</p>
                  </div>

                  {/* Circle */}
                  <div className="relative w-20 h-20 flex-shrink-0 lg:order-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-sage-primary to-sage-medium rounded-full"></div>
                    <div className="absolute inset-1 bg-[#0A0A0C] rounded-full flex items-center justify-center">
                      <span className="text-3xl font-black text-sage-primary">{step.step}</span>
                    </div>
                  </div>

                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:order-2' : ''}`}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ClientsSection = ({ clients }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="section-padding py-28 lg:py-40 bg-[#0A0A0C]">
      <div className="container-custom max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="mb-5 flex items-center justify-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
            <span className="h-px w-10 bg-gold-primary/50" />
            عملاؤنا
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 gold-shine-effect leading-[0.95]">
            من نخدم؟
          </h2>
          <p className="text-brown-dark text-xl font-medium">نخدم مجموعة متنوعة من العملاء في مختلف القطاعات</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clients.map((client: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="relative overflow-hidden group p-8 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.015] border border-white/10 text-center transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <p className="text-white font-medium group-hover:text-sage-primary transition-colors">{client}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQSection = ({ faqs }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      {faqs?.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(faqs)) }}
        />
      )}
      <section ref={ref} className="section-padding py-28 lg:py-40 bg-[#0A0A0C]">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <div className="mb-5 flex items-center justify-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
            <span className="h-px w-10 bg-gold-primary/50" />
            استفسارات
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-4 gold-shine-effect leading-[0.95]">
            الأسئلة الشائعة
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.03] backdrop-blur-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-right flex items-center justify-between hover:bg-sage-primary/10 transition-colors"
              >
                <span className="text-lg font-medium text-brown-dark">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gold-primary transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 bg-sage-primary/5">
                  <p className="text-brown-text leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      </section>
    </>
  );
};

export default ServiceContent;
