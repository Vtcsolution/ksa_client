import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | Omnira Valet',
  description:
    'سياسة الخصوصية لموقع أومنيرا فاليه — كيف نجمع بياناتك ونستخدمها ونحميها عند استخدامك لخدمات صف السيارات والفاليه باركينج.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
};

const sections = [
  {
    h: 'البيانات التي نجمعها',
    p: 'نجمع المعلومات التي تزوّدنا بها مباشرةً عند تعبئة نموذج التواصل أو طلب عرض سعر، مثل الاسم، البريد الإلكتروني، رقم الجوال، واسم المنشأة. كما قد نجمع بيانات تقنية محدودة (نوع المتصفح وصفحات الزيارة) لتحسين تجربة الموقع.',
  },
  {
    h: 'كيف نستخدم بياناتك',
    p: 'نستخدم بياناتك للرد على استفساراتك، تقديم عروض الأسعار، تنظيم الخدمات المتفق عليها، وتحسين جودة خدماتنا. لا نستخدم بياناتك لأي غرض آخر دون موافقتك.',
  },
  {
    h: 'مشاركة البيانات',
    p: 'لا نبيع بياناتك الشخصية ولا نشاركها مع أطراف ثالثة لأغراض تسويقية. قد تتم مشاركتها فقط مع مزوّدي خدمات موثوقين يساعدوننا في تشغيل أعمالنا، وبما يلتزم بسرّية بياناتك.',
  },
  {
    h: 'ملفات تعريف الارتباط (Cookies)',
    p: 'قد يستخدم الموقع ملفات تعريف ارتباط أساسية لتشغيل الصفحات وتحسين الأداء. يمكنك التحكم في هذه الملفات من إعدادات متصفحك.',
  },
  {
    h: 'أمن المعلومات',
    p: 'نتّخذ إجراءات تقنية وتنظيمية معقولة لحماية بياناتك من الوصول أو الاستخدام غير المصرّح به. ومع ذلك، لا يمكن ضمان أمان أي وسيلة نقل عبر الإنترنت بشكل مطلق.',
  },
  {
    h: 'حقوقك',
    p: 'يحق لك الاطلاع على بياناتك أو طلب تصحيحها أو حذفها، وذلك عبر التواصل معنا على البريد info@omniravalet.com.',
  },
  {
    h: 'التحديثات',
    p: 'قد نُحدّث سياسة الخصوصية من حين لآخر. ستظهر أي تعديلات على هذه الصفحة، ويُعدّ استمرارك في استخدام الموقع موافقةً على السياسة المُحدّثة.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0C]">
      <Header />
      <section className="container-custom pb-24 pt-36">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <span className="mb-5 inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
              <span className="h-px w-10 bg-gold-primary/50" />
              أومنيرا فاليه
            </span>
            <h1 className="text-4xl font-extralight gold-shine-effect sm:text-6xl">سياسة الخصوصية</h1>
          </div>
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.h} className="border-b border-white/10 pb-10 last:border-0">
                <h2 className="mb-4 text-xl font-medium text-white sm:text-2xl">{s.h}</h2>
                <p className="text-base font-light leading-relaxed text-white/65">{s.p}</p>
              </div>
            ))}
            <p className="text-sm text-white/40">آخر تحديث: 2026</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
