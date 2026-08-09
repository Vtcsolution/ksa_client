import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'الشروط والأحكام | Omnira Valet',
  description:
    'الشروط والأحكام الخاصة باستخدام موقع وخدمات أومنيرا فاليه لصف السيارات والفاليه باركينج وإدارة المواقف في المملكة العربية السعودية.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
};

const sections = [
  {
    h: 'قبول الشروط',
    p: 'باستخدامك لموقع أومنيرا فاليه أو طلب أيٍّ من خدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا لم توافق عليها، يُرجى عدم استخدام الموقع أو الخدمات.',
  },
  {
    h: 'الخدمات',
    p: 'نقدّم خدمات صف السيارات (الفاليه باركينج)، إدارة وتشغيل المواقف، والحلول التقنية المرتبطة بها للمنشآت والفعاليات. تخضع تفاصيل كل خدمة ونطاقها لاتفاقٍ مستقلٍّ يُبرم مع العميل.',
  },
  {
    h: 'استخدام الموقع',
    p: 'تلتزم باستخدام الموقع لأغراض مشروعة فقط، وبعدم القيام بأي فعل قد يضرّ بالموقع أو يعطّل عمله أو ينتهك حقوق الآخرين.',
  },
  {
    h: 'الحجوزات وعروض الأسعار',
    p: 'تُعدّ الأسعار المعروضة على الموقع إرشادية، ويُحدَّد السعر النهائي بحسب نطاق الخدمة ومدّتها وموقع التنفيذ ضمن عرض السعر الرسمي. نحتفظ بحق تعديل العروض دون إشعار مسبق.',
  },
  {
    h: 'الملكية الفكرية',
    p: 'جميع محتويات الموقع من نصوص وشعارات وصور وتصاميم مملوكة لشركة أومنيرا فاليه، ولا يجوز نسخها أو إعادة استخدامها دون إذن خطّي مسبق.',
  },
  {
    h: 'حدود المسؤولية',
    p: 'نبذل جهدنا لتقديم خدمة احترافية وموثوقة، إلا أننا لا نتحمّل المسؤولية عن أي أضرار غير مباشرة تنشأ عن استخدام الموقع. تخضع مسؤوليتنا التشغيلية لبنود العقد المُبرم مع العميل.',
  },
  {
    h: 'التعديلات والقانون المطبق',
    p: 'قد نُحدّث هذه الشروط من حين لآخر. وتخضع هذه الشروط لأنظمة المملكة العربية السعودية، وتختص جهاتها القضائية بالنظر في أي نزاع ينشأ عنها.',
  },
];

export default function TermsPage() {
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
            <h1 className="text-4xl font-extralight gold-shine-effect sm:text-6xl">الشروط والأحكام</h1>
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
