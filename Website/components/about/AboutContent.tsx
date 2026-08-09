'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Image from '@/components/ui/BlurImage';
import ParallaxImage from '@/components/ui/ParallaxImage';
import { Award, Users, Target, Heart, Lightbulb, Shield } from 'lucide-react';
import CinematicBreak from '@/components/ui/CinematicBreak';
import RevealMask from '@/components/ui/RevealMask';

function CountUp({ value, active }: { value: string; active: boolean }) {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    if (!active) return;
    const m = value.match(/^([\d.,]+)(.*)$/);
    const numStr = (m?.[1] || '0').replace(/,/g, '');
    const suffix = m?.[2] || '';
    const target = parseFloat(numStr) || 0;
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
    const fmt = (n: number) =>
      (decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-US')) + suffix;
    let raf = 0;
    let startT = 0;
    const dur = 1600;
    const tick = (t: number) => {
      if (!startT) startT = t;
      const p = Math.min(1, (t - startT) / dur);
      setDisplay(fmt(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(fmt(target));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value]);
  return <>{display}</>;
}

const AboutContent = () => {
  return (
    <div className="bg-[#0A0A0C]">
      <StorySection />
      <VisionMissionSection />
      <CinematicBreak image="/images/atmos/atmos-3.jpg" kicker="فلسفتنا">
        التفاصيل الصغيرة هي ما يصنع
        <span className="text-gold-light"> الفخامة الحقيقية</span>.
      </CinematicBreak>
      <ValuesSection />
      <StatsSection />
      <TeamSection />
    </div>
  );
};

const StorySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="bg-[#0A0A0C] py-28 lg:py-40">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <RevealMask className="relative h-96 rounded-2xl overflow-hidden">
              <ParallaxImage src="/images/hero/hero-5.jpg" alt="مقر شركة أومنيرا فاليه" strength={55} />
            </RevealMask>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-5 flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
              <span className="h-px w-10 bg-gold-primary/50" />
              البداية
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 gold-shine-effect leading-[0.95]">قصتنا</h2>
            <div className="space-y-4 text-brown-text leading-relaxed">
              <p>
                تأسست <span className="text-sage-primary font-bold">أومنيرا فاليه (Omnira Valet)</span> برؤية واضحة:
                تحويل صناعة صف السيارات في المملكة من خدمة عادية إلى تجربة فاخرة لا تُنسى.
              </p>
              <p>
                نؤمن بأن كل تفصيل مهم، من اللحظة التي يصل فيها الضيف إلى لحظة مغادرته. 
                فريقنا المدرب بعناية، وأنظمتنا التقنية المتطورة، وشغفنا بالتميز، كلها عناصر 
                تجعل Omnira Valet الخيار الأول للفنادق الفاخرة، المطاعم الراقية، والمنشآت الكبرى.
              </p>
              <p>
                <strong className="text-sage-primary">السجل التجاري:</strong> 7051975600<br/>
                <strong className="text-sage-primary">المقر الرئيسي:</strong> مركز الملك عبدالله المالي (KAFD)، المنطقة 4، مبنى 4.07، الدور 7، الرياض
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const VisionMissionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="bg-[#0A0A0C] py-28 lg:py-40">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.2 }}
            className="group relative overflow-hidden p-10 rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.015] border border-white/10 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="w-16 h-16 rounded-full border border-gold-primary/25 bg-gold-primary/10 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110">
              <Target className="w-8 h-8 text-gold-primary" />
            </div>
            <h3 className="text-3xl font-medium mb-4 text-sage-primary">رؤيتنا</h3>
            <p className="text-white/60 text-lg leading-relaxed">
              أن نكون الخيار الأول لخدمات صف السيارات في المملكة والمنطقة، ونضع معايير 
              جديدة للاحترافية والجودة في هذا القطاع. نسعى للمساهمة في تحقيق أهداف 
              <span className="text-sunset-golden font-semibold">رؤية المملكة 2030</span> من خلال تقديم خدمات متطورة تدعم قطاع الضيافة والسياحة.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.2, delay: 0 }}
            className="group relative overflow-hidden p-10 rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.015] border border-white/10 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="w-16 h-16 rounded-full border border-gold-primary/25 bg-gold-primary/10 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110">
              <Award className="w-8 h-8 text-gold-primary" />
            </div>
            <h3 className="text-3xl font-medium mb-4 text-sage-primary">رسالتنا</h3>
            <p className="text-white/60 text-lg leading-relaxed">
              تقديم خدمات صف سيارات استثنائية تجمع بين التكنولوجيا المتقدمة، الفريق المحترف، 
              والاهتمام بأدق التفاصيل لضمان تجربة مميزة لعملائنا وضيوفهم.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ValuesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const values = [
    {
      icon: Award,
      title: 'الاحترافية',
      description: 'نلتزم بأعلى معايير المهنية في كل ما نقوم به',
    },
    {
      icon: Shield,
      title: 'الأمانة',
      description: 'ثقة عملائنا هي أغلى ما نملك، نحافظ عليها بكل أمانة',
    },
    {
      icon: Target,
      title: 'التميز',
      description: 'نسعى دائماً للتفوق وتقديم أفضل من المتوقع',
    },
    {
      icon: Lightbulb,
      title: 'الابتكار',
      description: 'نستخدم أحدث التقنيات لتحسين خدماتنا باستمرار',
    },
    {
      icon: Heart,
      title: 'العناية بالعميل',
      description: 'رضا عملائنا وضيوفهم هو هدفنا الأول والأخير',
    },
    {
      icon: Users,
      title: 'العمل الجماعي',
      description: 'نؤمن بقوة الفريق والتعاون لتحقيق النجاح',
    },
  ];

  return (
    <section ref={ref} className="bg-[#0A0A0C] py-28 lg:py-40">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="mb-5 flex items-center justify-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
            <span className="h-px w-10 bg-gold-primary/50" />
            ما يحرّكنا
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-4 gold-shine-effect leading-[0.95]">قيمنا</h2>
          <p className="text-brown-text text-lg">المبادئ التي نؤمن بها ونعمل وفقها</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative overflow-hidden p-8 rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.015] border border-white/10 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <Icon className="w-12 h-12 text-gold-primary mb-4 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-xl font-medium mb-2 text-white">{value.title}</h3>
                <p className="text-white/60 leading-relaxed">{value.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { label: 'سيارة مخدومة شهرياً', value: '5,000+' },
    { label: 'عميل راضي', value: '200+' },
    { label: 'معدل الرضا', value: '99.9%' },
    { label: 'موظف محترف', value: '100+' },
  ];

  return (
    <section ref={ref} className="bg-[#0A0A0C] py-28 lg:py-40">
      <div className="container-custom">
        <div className="mb-14 flex items-center justify-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
          <span className="h-px w-10 bg-gold-primary/50" />
          بالأرقام
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center glass-effect p-10 rounded-3xl border border-white/10 hover:border-sage-primary transition-all duration-300"
            >
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-sage-primary to-sage-medium bg-clip-text text-transparent">
                <CountUp value={stat.value} active={isInView} />
              </div>
              <div className="text-brown-text font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TeamSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="bg-[#0A0A0C] py-28 lg:py-40">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="mb-5 flex items-center justify-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
            <span className="h-px w-10 bg-gold-primary/50" />
            الأشخاص
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-4 gold-shine-effect leading-[0.95]">فريقنا</h2>
          <p className="text-brown-text text-lg max-w-2xl mx-auto">
            فريق متخصص من الخبراء الملتزمين بتقديم أفضل خدمة لعملائنا
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.2, delay: 0 }}
              className="group"
            >
              <div className="relative h-64 mb-4 rounded-3xl overflow-hidden border border-white/10 group-hover:border-sage-primary transition-all">
                <Image
                  src={index === 0 ? '/images/people/person-3.jpg' : index === 1 ? '/images/people/person-1.jpg' : '/images/people/person-4.jpg'}
                  alt="عضو فريق"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sage-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-xl font-medium text-sage-primary mb-2 text-center">
                {index === 0 ? 'فريق الإدارة' : index === 1 ? 'فريق العمليات' : 'فريق خدمة العملاء'}
              </h3>
              <p className="text-brown-text text-center">محترفون في مجالهم</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutContent;
