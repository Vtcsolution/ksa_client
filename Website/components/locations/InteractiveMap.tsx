'use client';

import React, { useState, useEffect } from 'react';

// تعريف بيانات المناطق الرئيسية في السعودية
type Region = {
  id: string;
  name: string;
  cities: string[];
  coordinates: { x: number; y: number };
  hoverRadius?: number;
  color?: string;
}

// بيانات المناطق الرئيسية في المملكة العربية السعودية
const saudiRegions: Region[] = [
  {
    id: 'riyadh',
    name: 'منطقة الرياض',
    cities: ['الرياض', 'الخرج', 'الدوادمي', 'المجمعة', 'الزلفي', 'شقراء', 'عفيف', 'الغاط', 'الدرعية', 'القويعية', 'وادي الدواسر', 'الأفلاج', 'السليل'],
    coordinates: { x: 52, y: 50 },
    hoverRadius: 12,
    color: '#C68B48'
  },
  {
    id: 'makkah',
    name: 'منطقة مكة المكرمة',
    cities: ['مكة المكرمة', 'جدة', 'الطائف', 'القنفذة', 'الليث', 'رابغ', 'خليص', 'الجموم', 'الكامل', 'الخرمة', 'رنية', 'تربة', 'العرضيات'],
    coordinates: { x: 32, y: 60 },
    hoverRadius: 10,
    color: '#AF7C3D'
  },
  {
    id: 'madinah',
    name: 'منطقة المدينة المنورة',
    cities: ['المدينة المنورة', 'ينبع', 'العلا', 'المهد', 'الحناكية', 'بدر', 'خيبر', 'العيص', 'الحناكية'],
    coordinates: { x: 25, y: 42 },
    hoverRadius: 10,
    color: '#C09856'
  },
  {
    id: 'qassim',
    name: 'منطقة القصيم',
    cities: ['بريدة', 'عنيزة', 'الرس', 'المذنب', 'البكيرية', 'البدائع', 'الأسياح', 'النبهانية', 'عيون الجواء', 'رياض الخبراء'],
    coordinates: { x: 45, y: 38 },
    hoverRadius: 8,
    color: '#D09F5F'
  },
  {
    id: 'eastern',
    name: 'المنطقة الشرقية',
    cities: ['الدمام', 'الخبر', 'الظهران', 'القطيف', 'الأحساء', 'حفر الباطن', 'الجبيل', 'الخفجي', 'رأس تنورة', 'بقيق', 'النعيرية', 'قرية العليا'],
    coordinates: { x: 68, y: 45 },
    hoverRadius: 11,
    color: '#BF8A47'
  },
  {
    id: 'asir',
    name: 'منطقة عسير',
    cities: ['أبها', 'خميس مشيط', 'بيشة', 'النماص', 'محايل', 'ظهران الجنوب', 'تثليث', 'سراة عبيدة', 'رجال ألمع', 'بالقرن', 'أحد رفيدة', 'المجاردة'],
    coordinates: { x: 42, y: 78 },
    hoverRadius: 9,
    color: '#BD8B4D'
  },
  {
    id: 'tabouk',
    name: 'منطقة تبوك',
    cities: ['تبوك', 'الوجه', 'ضباء', 'تيماء', 'أملج', 'حقل'],
    coordinates: { x: 12, y: 25 },
    hoverRadius: 8,
    color: '#D1A362'
  },
  {
    id: 'hail',
    name: 'منطقة حائل',
    cities: ['حائل', 'بقعاء', 'الغزالة', 'الحائط', 'السليمي', 'الشنان', 'موقق'],
    coordinates: { x: 42, y: 28 },
    hoverRadius: 8,
    color: '#C29651'
  },
  {
    id: 'northern',
    name: 'منطقة الحدود الشمالية',
    cities: ['عرعر', 'رفحاء', 'طريف', 'العويقيلة'],
    coordinates: { x: 58, y: 12 },
    hoverRadius: 7,
    color: '#BE8D4F'
  },
  {
    id: 'jazan',
    name: 'منطقة جازان',
    cities: ['جازان', 'صبيا', 'أبو عريش', 'صامطة', 'الدائر', 'أحد المسارحة', 'بيش', 'فرسان', 'الدرب', 'الريث', 'ضمد', 'الطوال'],
    coordinates: { x: 35, y: 92 },
    hoverRadius: 6,
    color: '#CDA05F'
  },
  {
    id: 'najran',
    name: 'منطقة نجران',
    cities: ['نجران', 'شرورة', 'حبونا', 'بدر الجنوب', 'يدمة', 'ثار'],
    coordinates: { x: 52, y: 88 },
    hoverRadius: 7,
    color: '#BC8946'
  },
  {
    id: 'bahah',
    name: 'منطقة الباحة',
    cities: ['الباحة', 'بلجرشي', 'المندق', 'المخواة', 'قلوة', 'العقيق', 'القرى', 'غامد الزناد', 'الحجرة'],
    coordinates: { x: 35, y: 70 },
    hoverRadius: 6,
    color: '#C7904E'
  },
  {
    id: 'jouf',
    name: 'منطقة الجوف',
    cities: ['سكاكا', 'القريات', 'دومة الجندل', 'طبرجل'],
    coordinates: { x: 32, y: 12 },
    hoverRadius: 7,
    color: '#D4A666'
  },
];

export default function InteractiveMap() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // تحقق من أن الكود يعمل على متصفح العميل وليس على الخادم
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // إذا كان التحميل على الخادم، إظهار رسالة تحميل
  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-gold-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="py-28 lg:py-40 bg-[#0A0A0C]">
      <div className="container mx-auto px-4">
        <div className="mb-5 flex items-center justify-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
          <span className="h-px w-10 bg-gold-primary/50" />
          التغطية
        </div>
        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[0.95] text-center mb-8 gold-shine-effect">
          خدماتنا تغطي جميع مدن المملكة
        </h2>
        <p className="text-lg text-center text-[#C8B58A] max-w-3xl mx-auto mb-12">
          تتوفر خدمات أومنيرا فاليه في جميع مناطق المملكة العربية السعودية. انقر على المنطقة لمعرفة المدن التي نخدمها.
        </p>

        <div className="flex flex-col lg:flex-row gap-8 justify-between">
          {/* الخريطة التفاعلية */}
          <div className="relative w-full lg:w-2/3 h-[420px] sm:h-[600px] bg-white/[0.03] border border-white/10 rounded-lg overflow-hidden">
            {/* صورة خريطة السعودية كخلفية */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full" 
              style={{ 
                background: 'url(/images/saudi-map-outline.svg) no-repeat center center',
                backgroundSize: 'contain'
              }}
            >
              {/* دوائر المناطق */}
              {saudiRegions.map((region) => (
                <circle
                  key={region.id}
                  cx={region.coordinates.x}
                  cy={region.coordinates.y}
                  r={hoveredRegion?.id === region.id || selectedRegion?.id === region.id 
                      ? (region.hoverRadius || 8) + 2 
                      : region.hoverRadius || 8}
                  fill={region.color || '#C68B48'}
                  opacity={selectedRegion ? (selectedRegion.id === region.id ? 0.9 : 0.3) : 0.7}
                  stroke={hoveredRegion?.id === region.id || selectedRegion?.id === region.id ? '#E8D6A8' : 'transparent'}
                  strokeWidth="2"
                  cursor="pointer"
                  role="button"
                  aria-label={region.name}
                  className="transition-all duration-300 ease-in-out hover:opacity-90"
                  onClick={() => setSelectedRegion(region)}
                  onMouseEnter={() => setHoveredRegion(region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
              ))}
              
              {/* أسماء المناطق */}
              {saudiRegions.map((region) => (
                <text
                  key={`text-${region.id}`}
                  x={region.coordinates.x}
                  y={region.coordinates.y + (region.hoverRadius || 8) + 4}
                  textAnchor="middle"
                  fill={hoveredRegion?.id === region.id || selectedRegion?.id === region.id ? '#F5ECDB' : '#C8B58A'}
                  fontSize="2.5"
                  fontWeight={hoveredRegion?.id === region.id || selectedRegion?.id === region.id ? 'bold' : 'normal'}
                  className="pointer-events-none select-none"
                >
                  {region.name}
                </text>
              ))}
            </svg>
            
            {/* تعليمات استخدام الخريطة */}
            <div className="absolute bottom-4 right-4 bg-[#141418] bg-opacity-80 p-3 rounded-lg shadow-sm text-sm">
              <p className="font-medium text-[#F5ECDB]">انقر على أي منطقة لمعرفة المدن المتوفرة</p>
            </div>
          </div>
          
          {/* قائمة المدن */}
          <div className="w-full lg:w-1/3 bg-white/[0.03] border border-white/10 rounded-lg p-6 shadow-lg">
            <h3 className="text-2xl font-medium mb-4 text-brown-dark">
              {selectedRegion ? `مدن ${selectedRegion.name}` : 'اختر منطقة من الخريطة'}
            </h3>
            
            {selectedRegion ? (
              <div>
                <p className="text-[#C8B58A] mb-4">
                  نقدم خدماتنا في {selectedRegion.cities.length} مدينة في {selectedRegion.name}
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRegion.cities.map((city) => (
                    <li key={city} className="flex items-center">
                      <span className="w-2 h-2 bg-gold-primary rounded-full mr-2"></span>
                      <span>{city}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="mt-6 text-sm text-gold-primary hover:text-gold-dark underline"
                >
                  العودة للخريطة الكاملة
                </button>
              </div>
            ) : (
              <div>
                <p className="text-[#C8B58A]">
                  تتوفر خدمات أومنيرا فاليه في أكثر من 150 مدينة ومحافظة في جميع أنحاء المملكة العربية السعودية.
                </p>
                <p className="text-[#C8B58A] mt-4">
                  اختر منطقة من الخريطة لعرض المدن التي نخدمها فيها.
                </p>
                <div className="mt-6">
                  <h4 className="font-medium mb-2">المناطق الرئيسية:</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {saudiRegions.slice(0, 8).map((region) => (
                      <li
                        key={region.id}
                        aria-label={region.name}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedRegion(region)}
                          className="w-full text-right cursor-pointer text-white/70 hover:text-gold-primary transition-colors"
                        >
                          {region.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
