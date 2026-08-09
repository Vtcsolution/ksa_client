// Static mock layer for the Ziwo speech-to-text + GPT call-analysis pipeline
// (Milestone 1). Self-contained on purpose: once the real Ziwo webhook / STT /
// GPT backend is wired up, this file is the only thing that gets replaced —
// nothing else in the app should need to change shape.

export type CallSentiment = "positive" | "neutral" | "negative";
export type BuyingIntent = "low" | "medium" | "high";
export type CallInsightStatus = "processing" | "analyzed" | "failed";
export type FollowupChannel = "whatsapp" | "call" | "meeting";

export interface Bi18n {
  ar: string;
  en: string;
}

export interface TranscriptLine {
  speaker: "rep" | "customer";
  tSec: number;
  ar: string;
  en: string;
}

export interface CallInsight {
  id: string;
  leadName: string;
  leadNameEn?: string;
  leadPhone: string;
  segment: string;
  repId: string;
  at: number;
  durSec: number;
  status: CallInsightStatus;
  transcript: TranscriptLine[];
  summary: Bi18n;
  sentiment: CallSentiment;
  sentimentScore: number; // 0-100
  intent: Bi18n;
  buyingIntent: BuyingIntent;
  leadScore: number; // 0-100
  objections: Bi18n[];
  actionItems: Bi18n[];
  aiNotes: Bi18n;
  nextFollowup: {
    channel: FollowupChannel;
    at: number;
    recommendation: Bi18n;
  };
  whatsappSent: boolean;
}

const DAY_MS = 86400000;
const now = Date.now();
const hoursAgo = (h: number) => now - h * 3600000;
const daysFromNow = (d: number, hour = 10) => {
  const dt = new Date(now + d * DAY_MS);
  dt.setHours(hour, 0, 0, 0);
  return dt.getTime();
};

export const CALL_INSIGHTS: CallInsight[] = [
  {
    id: "ci_1",
    leadName: "فندق النخيل الذهبي",
    leadNameEn: "Golden Palm Hotel",
    leadPhone: "0114567890",
    segment: "hotels",
    repId: "u_faris",
    at: hoursAgo(3),
    durSec: 222,
    status: "analyzed",
    sentiment: "positive",
    sentimentScore: 88,
    buyingIntent: "high",
    leadScore: 88,
    intent: { ar: "مهتم بباقة فاليه دائمة لمدخل الفندق الرئيسي", en: "Interested in a permanent valet package for the main hotel entrance" },
    summary: {
      ar: "العميل (مدير العمليات) أبدى اهتمامًا واضحًا بخدمة الفاليه الدائمة بعد شكاوى من النزلاء بخصوص وقوف السيارات. ناقشنا باقة Gold (12 ساعة يوميًا) وطلب عرض سعر رسمي قبل نهاية الأسبوع.",
      en: "The customer (Operations Manager) showed clear interest in a permanent valet service after guest complaints about parking. We discussed the Gold package (12 hrs/day) and he asked for a formal quote before the end of the week.",
    },
    objections: [{ ar: "يحتاج موافقة الإدارة العليا على الميزانية", en: "Needs upper-management budget approval" }],
    actionItems: [
      { ar: "إرسال عرض سعر باقة Gold خلال 24 ساعة", en: "Send a Gold package quote within 24 hours" },
      { ar: "جدولة زيارة ميدانية لمعاينة المدخل الرئيسي", en: "Schedule a site visit to inspect the main entrance" },
    ],
    aiNotes: { ar: "نبرة صوت متحمسة ومتعاونة طوال المكالمة — فرصة عالية للإغلاق خلال أسبوعين.", en: "Enthusiastic, cooperative tone throughout the call — high odds of closing within two weeks." },
    nextFollowup: {
      channel: "whatsapp",
      at: daysFromNow(1, 11),
      recommendation: { ar: "إرسال عرض السعر عبر واتساب مع صور مرجعية لفنادق مشابهة", en: "Send the quote via WhatsApp with reference photos from similar hotels" },
    },
    whatsappSent: false,
    transcript: [
      { speaker: "rep", tSec: 0, ar: "مساء الخير أستاذ خالد، معك فارس من أمنيرا فاليه. كيف الحال؟", en: "Good evening Mr. Khalid, this is Faris from Omnira Valet. How are you?" },
      { speaker: "customer", tSec: 6, ar: "أهلًا فارس، تمام الحمدلله، بس عندنا مشكلة مواقف من فترة.", en: "Hi Faris, all good thanks — though we've had a parking problem for a while." },
      { speaker: "rep", tSec: 13, ar: "فهمتك، هذا بالضبط اللي نحلّه. عندنا باقة Gold تغطي 12 ساعة يوميًا بفريق مدرّب ومؤمّن بالكامل.", en: "I hear you — that's exactly what we solve. Our Gold package covers 12 hours a day with a trained, fully insured team." },
      { speaker: "customer", tSec: 24, ar: "يسمعني منطقي. كم السعر الشهري تقريبًا؟", en: "Sounds reasonable. What's the rough monthly price?" },
      { speaker: "rep", tSec: 30, ar: "أرسل لك عرض رسمي مفصّل اليوم، وممكن نحدد زيارة ميدانية نعاين فيها المدخل.", en: "I'll send you a detailed formal quote today, and we can schedule a site visit to inspect the entrance." },
      { speaker: "customer", tSec: 41, ar: "تمام، بس لازم أرفعه للإدارة العليا للموافقة على الميزانية.", en: "Okay, but I'll need to run it by upper management for budget approval." },
    ],
  },
  {
    id: "ci_2",
    leadName: "مطعم البخاري الفاخر",
    leadNameEn: "Al Bukhari Elite Restaurant",
    leadPhone: "0126789012",
    segment: "restaurants",
    repId: "u_faris",
    at: hoursAgo(7),
    durSec: 310,
    status: "analyzed",
    sentiment: "neutral",
    sentimentScore: 58,
    buyingIntent: "medium",
    leadScore: 62,
    intent: { ar: "يقارن بين عدة مزودين لخدمة الفاليه", en: "Comparing several valet service providers" },
    summary: {
      ar: "مدير التشغيل يقارن حاليًا بين ثلاثة مزودين. أبدى قلقًا من السعر مقارنة بالمزود الحالي، لكنه أعجب بمعايير السلامة والتأمين. طلب مهلة أسبوع قبل اتخاذ القرار.",
      en: "The operations manager is currently comparing three providers. He's price-sensitive relative to the current vendor, but liked our safety and insurance standards. Asked for a week before deciding.",
    },
    objections: [
      { ar: "السعر أعلى من المزود الحالي بحوالي 15٪", en: "Price is roughly 15% higher than the current vendor" },
      { ar: "يحتاج وقت للمقارنة مع عرضين آخرين", en: "Needs time to compare with two other offers" },
    ],
    actionItems: [
      { ar: "إرسال جدول مقارنة يوضح فروقات التأمين والسلامة", en: "Send a comparison sheet highlighting insurance & safety differences" },
      { ar: "متابعة الأربعاء القادم قبل انتهاء المهلة", en: "Follow up next Wednesday before his deadline" },
    ],
    aiNotes: { ar: "حساس للسعر لكنه يقدّر الجودة — التركيز في المتابعة يجب أن يكون على القيمة وليس الخصم.", en: "Price-sensitive but values quality — the follow-up should emphasize value, not discounting." },
    nextFollowup: {
      channel: "call",
      at: daysFromNow(4, 12),
      recommendation: { ar: "اتصال متابعة الأربعاء مع جدول مقارنة جاهز", en: "Follow-up call on Wednesday with the comparison sheet ready" },
    },
    whatsappSent: false,
    transcript: [
      { speaker: "rep", tSec: 0, ar: "السلام عليكم أستاذ عمر، معك فارس من أمنيرا فاليه، تكلمنا الأسبوع الماضي.", en: "Hello Mr. Omar, this is Faris from Omnira Valet — we spoke last week." },
      { speaker: "customer", tSec: 7, ar: "أهلًا فارس، أيوه فاكرك. لسه بقارن بين شركتكم وشركتين تانيين.", en: "Hi Faris, yes I remember. I'm still comparing your company with two others." },
      { speaker: "rep", tSec: 16, ar: "تمام، ممكن أعرف إيه أهم نقطة بتقارن عليها؟", en: "Understood — what's the main thing you're comparing on?" },
      { speaker: "customer", tSec: 22, ar: "بصراحة السعر. المزود الحالي أرخص بحوالي 15٪.", en: "Honestly, price. Our current provider is about 15% cheaper." },
      { speaker: "rep", tSec: 30, ar: "أقدر كلامك، بس نقدر نوريك فرق التأمين ومعايير السلامة عندنا اللي بتقلل مخاطر كبيرة على المطعم.", en: "I understand — but let me show you the difference in insurance and safety standards, which cuts real risk for the restaurant." },
      { speaker: "customer", tSec: 45, ar: "ابعتلي مقارنة مكتوبة وأنا هرجعلك الأربعاء الجاي.", en: "Send me a written comparison and I'll get back to you next Wednesday." },
    ],
  },
  {
    id: "ci_3",
    leadName: "مجمّع الواحة الطبي",
    leadNameEn: "Al Waha Medical Complex",
    leadPhone: "0113344556",
    segment: "hospitals",
    repId: "u_azza",
    at: hoursAgo(20),
    durSec: 401,
    status: "analyzed",
    sentiment: "positive",
    sentimentScore: 94,
    buyingIntent: "high",
    leadScore: 91,
    intent: { ar: "يريد بدء الخدمة قبل افتتاح الجناح الجديد", en: "Wants service to start before the new wing opens" },
    summary: {
      ar: "مدير المرافق متحمس جدًا ويريد بدء التعاقد قبل افتتاح الجناح الجديد خلال 3 أسابيع. تم الاتفاق شفهيًا على باقة Platinum المخصصة وطلب اجتماع حضوري هذا الأسبوع لإغلاق التفاصيل.",
      en: "The facilities manager is very enthusiastic and wants to sign before the new wing opens in 3 weeks. Verbally agreed on a custom Platinum package and requested an in-person meeting this week to close details.",
    },
    objections: [],
    actionItems: [
      { ar: "تجهيز عقد Platinum مخصص لعدد الموظفين والمناوبات", en: "Prepare a custom Platinum contract for staff count & shifts" },
      { ar: "تأكيد موعد الاجتماع الحضوري خلال 48 ساعة", en: "Confirm the in-person meeting within 48 hours" },
    ],
    aiNotes: { ar: "عميل ساخن جدًا — يُنصح بإشعار المدير المباشر وعدم تأخير المتابعة أكثر من يوم واحد.", en: "Very hot lead — recommend alerting the manager directly and following up within one day." },
    nextFollowup: {
      channel: "meeting",
      at: daysFromNow(2, 11),
      recommendation: { ar: "تثبيت اجتماع حضوري هذا الأسبوع لإغلاق العقد", en: "Lock in an in-person meeting this week to close the contract" },
    },
    whatsappSent: true,
    transcript: [
      { speaker: "rep", tSec: 0, ar: "صباح الخير دكتور سعود، معك عزة من أمنيرا فاليه.", en: "Good morning Dr. Saud, this is Azza from Omnira Valet." },
      { speaker: "customer", tSec: 5, ar: "أهلًا عزة، إحنا فاتحين جناح جديد بعد 3 أسابيع ومحتاجين حل فاليه بسرعة.", en: "Hi Azza, we're opening a new wing in 3 weeks and need a valet solution fast." },
      { speaker: "rep", tSec: 14, ar: "ممتاز، نقدر نجهز باقة Platinum مخصصة حسب عدد الموظفين والمناوبات المطلوبة.", en: "Great — we can put together a custom Platinum package based on your staffing and shift needs." },
      { speaker: "customer", tSec: 25, ar: "تمام، متى نقدر نتقابل نشوف التفاصيل؟", en: "Good — when can we meet to go over the details?" },
      { speaker: "rep", tSec: 31, ar: "أقدر أجي هذا الأسبوع، وأجهز لك العقد مسبقًا عشان نوفر وقت.", en: "I can come this week, and I'll prepare the contract in advance to save time." },
      { speaker: "customer", tSec: 40, ar: "ممتاز، خلنا نثبت الموعد بأقرب وقت.", en: "Perfect, let's lock in the earliest possible date." },
    ],
  },
  {
    id: "ci_4",
    leadName: "مول الرياض بارك",
    leadNameEn: "Riyadh Park Mall",
    leadPhone: "0115566778",
    segment: "malls",
    repId: "u_azza",
    at: hoursAgo(28),
    durSec: 187,
    status: "analyzed",
    sentiment: "negative",
    sentimentScore: 24,
    buyingIntent: "low",
    leadScore: 28,
    intent: { ar: "غير مقتنع — لديه عقد قائم لمدة سنة إضافية", en: "Unconvinced — locked into an existing contract for another year" },
    summary: {
      ar: "مدير المول أوضح أن لديهم عقد فاليه قائم لمدة سنة كاملة إضافية ولا خطة للتغيير حاليًا. المكالمة قصيرة ونبرة الصوت كانت متحفظة. يستحق إعادة تواصل بعد 8-9 أشهر فقط.",
      en: "The mall manager stated they have a full year left on an existing valet contract with no plan to switch. The call was short and reserved in tone. Only worth re-contacting in 8-9 months.",
    },
    objections: [
      { ar: "مرتبط بعقد سنوي قائم مع مزود آخر", en: "Locked into an existing annual contract with another provider" },
      { ar: "لا يرى داعيًا للتغيير حاليًا", en: "Doesn't see a reason to switch right now" },
    ],
    actionItems: [{ ar: "تعليم الحساب كـ 'غير جاهز' وإعادة الجدولة بعد 8 أشهر", en: "Mark account as 'not ready' and re-schedule after 8 months" }],
    aiNotes: { ar: "لا داعي لمتابعة قريبة — إهدار وقت الفريق. أضِف لتذكير طويل المدى بدلًا من قائمة المتابعة الأسبوعية.", en: "No near-term follow-up needed — would waste rep time. Add to a long-term reminder instead of the weekly follow-up list." },
    nextFollowup: {
      channel: "call",
      at: daysFromNow(60, 10),
      recommendation: { ar: "إعادة تواصل قبل انتهاء العقد الحالي بشهرين", en: "Re-engage two months before their current contract expires" },
    },
    whatsappSent: false,
    transcript: [
      { speaker: "rep", tSec: 0, ar: "مساء الخير، معك عزة من أمنيرا فاليه، عندكم دقيقة؟", en: "Good evening, this is Azza from Omnira Valet — do you have a minute?" },
      { speaker: "customer", tSec: 5, ar: "أهلًا، عندنا عقد فاليه قائم لسنة زيادة، مش محتاجين حاليًا.", en: "Hi, we already have a valet contract for another year — we don't need anything right now." },
      { speaker: "rep", tSec: 13, ar: "تمام، تسمح أرسل لك ملف تعريفي بسيط لو احتجتوا بديل مستقبلًا؟", en: "Understood — would you mind if I send a short intro pack in case you need an alternative in the future?" },
      { speaker: "customer", tSec: 20, ar: "ماشي، ابعته بس مش هيكون قريب.", en: "Sure, send it, but it won't be soon." },
    ],
  },
  {
    id: "ci_5",
    leadName: "قاعة أفراح الماس",
    leadNameEn: "Almas Wedding Hall",
    leadPhone: "0117788990",
    segment: "halls",
    repId: "u_azza",
    at: hoursAgo(1),
    durSec: 265,
    status: "processing",
    sentiment: "neutral",
    sentimentScore: 0,
    buyingIntent: "medium",
    leadScore: 0,
    intent: { ar: "—", en: "—" },
    summary: { ar: "قيد التحليل — سيتم تحديث الملخص عند اكتمال معالجة الذكاء الاصطناعي.", en: "Analysis in progress — summary will update once AI processing completes." },
    objections: [],
    actionItems: [],
    aiNotes: { ar: "—", en: "—" },
    nextFollowup: { channel: "call", at: daysFromNow(1, 10), recommendation: { ar: "—", en: "—" } },
    whatsappSent: false,
    transcript: [
      { speaker: "rep", tSec: 0, ar: "مساء الخير، معك عزة من أمنيرا فاليه بخصوص خدمة الفاليه لمناسباتكم.", en: "Good evening, this is Azza from Omnira Valet regarding valet service for your events." },
      { speaker: "customer", tSec: 6, ar: "أهلًا، عندنا أفراح كل نهاية أسبوع ومحتاجين حل ثابت.", en: "Hi, we host weddings every weekend and need a steady solution." },
      { speaker: "rep", tSec: 15, ar: "ممتاز، نقدر نرتب باقة موسمية حسب عدد المناسبات شهريًا.", en: "Great, we can arrange a seasonal package based on your monthly event count." },
    ],
  },
  {
    id: "ci_6",
    leadName: "فندق روز جاردن",
    leadNameEn: "Rose Garden Hotel",
    leadPhone: "0118877665",
    segment: "hotels",
    repId: "u_azza",
    at: hoursAgo(30),
    durSec: 198,
    status: "analyzed",
    sentiment: "neutral",
    sentimentScore: 55,
    buyingIntent: "medium",
    leadScore: 55,
    intent: { ar: "يريد تجربة الخدمة لمدة أسبوعين قبل الالتزام", en: "Wants a two-week trial before committing" },
    summary: {
      ar: "مدير الاستقبال منفتح على الفكرة لكنه يفضل تجربة قصيرة قبل توقيع عقد سنوي. تم الاتفاق على اجتماع لعرض تفاصيل فترة تجريبية.",
      en: "The front-office manager is open to the idea but prefers a short trial before signing an annual contract. Agreed on a meeting to outline trial-period details.",
    },
    objections: [{ ar: "يفضل عدم الالتزام بعقد سنوي مباشرة", en: "Prefers not to commit to a yearly contract right away" }],
    actionItems: [{ ar: "تجهيز عرض تجربة أسبوعين قبل الاجتماع", en: "Prepare a two-week trial proposal ahead of the meeting" }],
    aiNotes: { ar: "قرار حذر ومنهجي — تجربة قصيرة منخفضة المخاطر قد تسرّع الإغلاق.", en: "Cautious, methodical decision-maker — a low-risk short trial may speed up the close." },
    nextFollowup: {
      channel: "meeting",
      at: daysFromNow(3, 11),
      recommendation: { ar: "اجتماع لعرض تفاصيل الفترة التجريبية", en: "Meeting to walk through the trial-period details" },
    },
    whatsappSent: false,
    transcript: [
      { speaker: "rep", tSec: 0, ar: "مساء الخير، معك عزة من أمنيرا فاليه.", en: "Good evening, this is Azza from Omnira Valet." },
      { speaker: "customer", tSec: 5, ar: "أهلًا، سمعت عن خدمتكم من فندق تاني، بس حابين نجرب الأول.", en: "Hi, we heard about your service from another hotel, but we'd like to trial it first." },
      { speaker: "rep", tSec: 14, ar: "بالتأكيد، نقدر نرتب فترة تجريبية أسبوعين قبل أي التزام سنوي.", en: "Absolutely, we can arrange a two-week trial before any yearly commitment." },
      { speaker: "customer", tSec: 24, ar: "هذا يريحنا، خلنا نتقابل نناقش التفاصيل.", en: "That works for us — let's meet to discuss the details." },
    ],
  },
  {
    id: "ci_7",
    leadName: "برج مكاتب العليا",
    leadNameEn: "Al Ulya Office Tower",
    leadPhone: "0116677889",
    segment: "complexes",
    repId: "u_faris",
    at: hoursAgo(50),
    durSec: 276,
    status: "analyzed",
    sentiment: "positive",
    sentimentScore: 79,
    buyingIntent: "high",
    leadScore: 79,
    intent: { ar: "يطلب عرض سعر رسمي لـ 5 مواقف VIP", en: "Requesting a formal quote for 5 VIP parking spots" },
    summary: {
      ar: "مدير المبنى طلب عرض سعر رسمي لخدمة فاليه لـ 5 مواقف VIP بمعدل 8,000 ريال شهريًا لكل موقف. بانتظار موافقة الإدارة العليا على العرض المرسل.",
      en: "The building manager requested a formal quote for valet service on 5 VIP spots at SAR 8,000/month each. Currently awaiting upper-management approval on the sent quote.",
    },
    objections: [],
    actionItems: [{ ar: "متابعة حالة موافقة الإدارة على العرض المرسل", en: "Follow up on management's approval status for the sent quote" }],
    aiNotes: { ar: "العرض قيد المراجعة من الإدارة العليا — يظهر في قائمة العروض المعلّقة بانتظار الموافقة.", en: "Quote is pending upper-management review — appears in the pending-quotes list awaiting approval." },
    nextFollowup: {
      channel: "whatsapp",
      at: daysFromNow(2, 10),
      recommendation: { ar: "رسالة متابعة واتساب لمعرفة حالة الموافقة", en: "WhatsApp follow-up to check on approval status" },
    },
    whatsappSent: false,
    transcript: [
      { speaker: "rep", tSec: 0, ar: "صباح الخير أستاذ ماجد، معك فارس من أمنيرا فاليه.", en: "Good morning Mr. Majed, this is Faris from Omnira Valet." },
      { speaker: "customer", tSec: 5, ar: "أهلًا فارس، محتاجين فاليه لـ 5 مواقف VIP في البرج.", en: "Hi Faris, we need valet service for 5 VIP spots in the tower." },
      { speaker: "rep", tSec: 13, ar: "تمام، أقدر أجهز عرض سعر رسمي بمعدل 8,000 ريال شهريًا لكل موقف.", en: "Sure, I can prepare a formal quote at SAR 8,000/month per spot." },
      { speaker: "customer", tSec: 22, ar: "ابعته وأنا أرفعه للإدارة العليا للموافقة.", en: "Send it over and I'll pass it up to management for approval." },
    ],
  },
  {
    id: "ci_8",
    leadName: "مستشفى الحياة",
    leadNameEn: "Al Hayat Hospital",
    leadPhone: "0112233445",
    segment: "hospitals",
    repId: "u_faris",
    at: hoursAgo(0.4),
    durSec: 142,
    status: "processing",
    sentiment: "neutral",
    sentimentScore: 0,
    buyingIntent: "low",
    leadScore: 0,
    intent: { ar: "—", en: "—" },
    summary: { ar: "قيد التحليل — النص يُترجم حاليًا من العربية إلى الإنجليزية.", en: "Analysis in progress — transcript is currently being translated from Arabic to English." },
    objections: [],
    actionItems: [],
    aiNotes: { ar: "—", en: "—" },
    nextFollowup: { channel: "call", at: daysFromNow(1, 9), recommendation: { ar: "—", en: "—" } },
    whatsappSent: false,
    transcript: [
      { speaker: "rep", tSec: 0, ar: "مساء الخير، معك فارس من أمنيرا فاليه.", en: "Good evening, this is Faris from Omnira Valet." },
      { speaker: "customer", tSec: 5, ar: "أهلًا، تفضل، إحنا نبحث عن حل مواقف للزوار.", en: "Hi, go ahead — we're looking for a visitor parking solution." },
    ],
  },
];

export function computeCallInsightStats(insights: { status: CallInsightStatus; leadScore: number; sentimentScore: number }[]) {
  const analyzed = insights.filter((c) => c.status === "analyzed");
  const processing = insights.filter((c) => c.status === "processing");
  const failed = insights.filter((c) => c.status === "failed");
  const hotLeads = analyzed.filter((c) => c.leadScore >= 75);
  const avgSentiment = analyzed.length
    ? Math.round(analyzed.reduce((sum, c) => sum + c.sentimentScore, 0) / analyzed.length)
    : 0;
  const avgLeadScore = analyzed.length
    ? Math.round(analyzed.reduce((sum, c) => sum + c.leadScore, 0) / analyzed.length)
    : 0;
  return {
    total: insights.length,
    analyzed: analyzed.length,
    processing: processing.length,
    failed: failed.length,
    hotLeads: hotLeads.length,
    avgSentiment,
    avgLeadScore,
  };
}
