import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 Luxury Gold Palette - أسود وذهبي فاخر
        sage: {
          50: '#16130C',           // خلفية ناعمة داكنة (ثيم أسود فاخر)
          100: '#1E1910',          // داكن دافئ
          200: '#E8D6A0',          // فاتح مع حيوية
          300: '#DBC074',          // متوسط فاتح
          400: '#D0AE55',          // فاتح
          500: '#C9A24A',          // رئيسي - اللون الأساسي
          600: '#B58E36',          // متوسط
          700: '#94722A',          // داكن
          800: '#735820',          // داكن جداً
          900: '#544015',          // أغمق درجة
          primary: '#C9A24A',
          light: '#E0C273',
          medium: '#B58E36',
          dark: '#8A6E2F',
          soft: '#1C1A14',
        },

        // 🏜️ Noir Palette - أسود فاخر
        sand: {
          50: '#0A0A0C',           // أعمق سواد
          100: '#0E0E11',          // أسود ناعم
          200: '#141418',          // فحمي رئيسي
          300: '#1A1A20',          // فحمي متوسط
          400: '#222229',          // فحمي فاتح
          500: '#2C2C34',          // فحمي أفتح
          600: '#3A3A44',          // رمادي داكن
          700: '#474752',          // رمادي
          800: '#565663',          // رمادي متوسط
          900: '#6A6A78',          // رمادي فاتح
        },

        // Noir & Cream Palette - المحدثة
        beige: {
          primary: '#141418',
          light: '#0E0E11',
          medium: '#1A1A20',
          dark: '#222229',
        },
        brown: {
          primary: '#C8B58A',
          light: '#D9CBB0',
          medium: '#C9A24A',
          dark: '#EFE3CE',
          text: '#F5ECDB',
        },

        // ✨ Accent Colors - مضبوطة على عائلة الذهبي
        accents: {
          emerald: '#C9A24A',      // ذهبي
          amber: '#E0C273',        // ذهبي فاتح
          rose: '#D9B66A',         // ذهبي وردي
          sky: '#C8B58A',          // كريمي
          violet: '#B58E36',       // برونزي
          coral: '#E0C273',        // ذهبي فاتح
          mint: '#C8B58A',         // كريمي
          honey: '#E0C273',        // عسلي ذهبي
        },

        // 🌅 Golden Gradient Palette - ألوان ذهبية
        sunset: {
          dawn: '#F3E7C6',         // فجر
          morning: '#EAD79A',      // صباح
          noon: '#DBC074',         // ظهيرة
          golden: '#C9A24A',       // ذهبي
          amber: '#B58E36',        // كهرماني
          dusk: '#8A6E2F',         // غسق
        },
        // Keep old colors for compatibility
        gold: {
          primary: '#C9A24A',
          light: '#E0C273',
          medium: '#B58E36',
          dark: '#8A6E2F',
          rose: '#D9B66A',
          champagne: '#E8D6A8',
          bronze: '#8A6E2F',
        },
        black: {
          DEFAULT: '#0A0A0C',
          primary: '#0A0A0C',
          rich: '#050506',
          soft: '#15151B',
          medium: '#1E1E26',
          light: '#2A2A33',
          charcoal: '#17171C',
        },
        luxury: {
          pearl: '#F5ECDB',
          cream: '#E8D6A8',
          silver: '#C8B58A',
          platinum: '#D9CBB0',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        // 🌟 Premium Luxury Gradients
        'gradient-luxury': 'linear-gradient(135deg, #C9A24A 0%, #E0C273 50%, #8A6E2F 100%)',
        'gradient-luxury-reverse': 'linear-gradient(135deg, #8A6E2F 0%, #E0C273 50%, #C9A24A 100%)',
        'gradient-gold-shine': 'linear-gradient(90deg, #8A6E2F 0%, #C9A24A 25%, #E0C273 50%, #C9A24A 75%, #8A6E2F 100%)',

        // 🎭 Sophisticated Backgrounds
        'gradient-dark': 'linear-gradient(180deg, #141418 0%, #0E0E11 50%, #0A0A0C 100%)',
        'gradient-dark-elegant': 'radial-gradient(ellipse at top, #1A1A20 0%, #141418 50%, #0A0A0C 100%)',
        'gradient-soft': 'linear-gradient(135deg, #1A1A20 0%, #141418 50%, #0E0E11 100%)',

        // 🌅 Sunset & Nature Inspired
        'gradient-sunset': 'linear-gradient(135deg, #F3E7C6 0%, #EAD79A 25%, #DBC074 50%, #C9A24A 75%, #B58E36 100%)',
        'gradient-forest': 'linear-gradient(135deg, #0A0A0C 0%, #8A6E2F 25%, #C9A24A 50%, #E0C273 75%, #1C1A14 100%)',
        'gradient-oasis': 'linear-gradient(135deg, #8A6E2F 0%, #C9A24A 50%, #E0C273 100%)',

        // 🏜️ Desert Dreams
        'gradient-desert': 'linear-gradient(135deg, #E0C273 0%, #C9A24A 25%, #8A6E2F 50%, #141418 100%)',
        'gradient-sand': 'linear-gradient(180deg, #0A0A0C 0%, #141418 50%, #0E0E11 100%)',

        // ✨ Hero & Premium Sections
        'gradient-hero': 'linear-gradient(135deg, rgba(10, 10, 12, 0.95) 0%, rgba(201, 162, 74, 0.10) 50%, rgba(10, 10, 12, 0.95) 100%)',
        'gradient-hero-premium': 'radial-gradient(circle at 50% 50%, rgba(201, 162, 74, 0.08) 0%, rgba(14, 14, 17, 0.9) 50%, rgba(10, 10, 12, 1) 100%)',
        'gradient-hero-modern': 'linear-gradient(135deg, #C9A24A 0%, rgba(201, 162, 74, 0.8) 50%, #1C1A14 100%)',

        // 🎨 Interactive Cards
        'gradient-card': 'linear-gradient(145deg, rgba(20, 20, 24, 0.9) 0%, rgba(14, 14, 17, 0.95) 100%)',
        'gradient-card-hover': 'linear-gradient(145deg, rgba(201, 162, 74, 0.08) 0%, rgba(20, 20, 24, 0.9) 100%)',
        'gradient-card-premium': 'linear-gradient(145deg, #1A1A20 0%, #141418 50%, #0E0E11 100%)',
        'gradient-card-accent': 'linear-gradient(135deg, rgba(224, 194, 115, 0.12) 0%, rgba(201, 162, 74, 0.12) 100%)',

        // 🌈 Overlay & Effects
        'gradient-overlay': 'linear-gradient(to bottom, rgba(10, 10, 12, 0) 0%, rgba(10, 10, 12, 0.9) 100%)',
        'gradient-overlay-dark': 'linear-gradient(to bottom, rgba(10, 10, 12, 0) 0%, rgba(10, 10, 12, 0.85) 100%)',
        'gradient-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(201, 162, 74, 0.18) 50%, transparent 100%)',
        'gradient-shimmer-gold': 'linear-gradient(90deg, transparent 0%, rgba(224, 194, 115, 0.25) 50%, transparent 100%)',

        // 🔥 Animated Gradients
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, #C9A24A 0%, transparent 50%), radial-gradient(at 80% 80%, #E0C273 0%, transparent 50%), radial-gradient(at 0% 50%, #8A6E2F 0%, transparent 50%)',
      },
      fontFamily: {
        // WARNING: every var() here MUST be defined (app/layout.tsx localFont.variable).
        // An undefined var() invalidates the whole font-family declaration and the
        // browser silently falls back to the UA default font.
        arabic: [
          'var(--font-ibm-plex)',
          'IBM Plex Sans Arabic',
          'Segoe UI',
          'Tahoma',
          'sans-serif'
        ],
        english: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Arial',
          'sans-serif'
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // ✨ Enhanced Core Animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        
        // 🎬 Entrance Animations
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        zoomIn: {
          from: { opacity: '0', transform: 'scale(0.5)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        
        // ✨ Shine & Glow Effects
        goldShine: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        shimmerRotate: {
          '0%': { transform: 'translateX(-100%) rotate(0deg)' },
          '100%': { transform: 'translateX(100%) rotate(360deg)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201, 162, 74, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201, 162, 74, 0.6), 0 0 60px rgba(201, 162, 74, 0.4)' },
        },
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(201, 162, 74, 0.3)',
            transform: 'scale(1)'
          },
          '50%': {
            boxShadow: '0 0 50px rgba(201, 162, 74, 0.8), 0 0 80px rgba(201, 162, 74, 0.5)',
            transform: 'scale(1.05)'
          },
        },
        
        // 🌊 Float & Movement
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatHorizontal: {
          '0%, 100%': { transform: 'translateX(0px)' },
          '50%': { transform: 'translateX(20px)' },
        },
        
        // 💫 Pulse Variations
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        
        // 🎯 Slide Animations
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-50px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(50px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInTop: {
          from: { opacity: '0', transform: 'translateY(-50px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInBottom: {
          from: { opacity: '0', transform: 'translateY(50px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        
        // 📏 Scale Animations
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        scaleUp: {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.1)' },
        },
        
        // 🌀 Rotation & Spin
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        
        // 🎨 Creative Effects
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20px, -20px) scale(1.1)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '75%': { transform: 'translate(10px, 10px) scale(1.05)' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(5deg)' },
          '75%': { transform: 'rotate(-5deg)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-25px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        
        // 🌈 Gradient Animations
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        rainbowGlow: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
      },
      animation: {
        // Core
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        
        // Entrance
        fadeIn: "fadeIn 0.5s ease-out",
        fadeInUp: "fadeInUp 0.6s ease-out",
        fadeInDown: "fadeInDown 0.6s ease-out",
        zoomIn: "zoomIn 0.5s ease-out",
        
        // Shine & Glow
        goldShine: "goldShine 3s linear infinite",
        shimmer: "shimmer 2s linear infinite",
        shimmerRotate: "shimmerRotate 3s linear infinite",
        glow: "glow 2s ease-in-out infinite",
        glowPulse: "glowPulse 3s ease-in-out infinite",
        
        // Float & Movement
        float: "float 3s ease-in-out infinite",
        floatSlow: "floatSlow 6s ease-in-out infinite",
        floatHorizontal: "floatHorizontal 4s ease-in-out infinite",
        
        // Pulse
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
        
        // Slide
        slideInLeft: "slideInLeft 0.6s ease-out",
        slideInRight: "slideInRight 0.6s ease-out",
        slideInTop: "slideInTop 0.6s ease-out",
        slideInBottom: "slideInBottom 0.6s ease-out",
        
        // Scale
        scaleIn: "scaleIn 0.5s ease-out",
        scaleUp: "scaleUp 0.3s ease-out",
        
        // Rotation
        spin: "spin 1s linear infinite",
        spinSlow: "spinSlow 3s linear infinite",
        
        // Creative
        blob: "blob 7s ease-in-out infinite",
        wave: "wave 2s ease-in-out infinite",
        bounce: "bounce 1s ease-in-out infinite",
        wiggle: "wiggle 0.5s ease-in-out infinite",
        
        // Gradient
        gradientShift: "gradientShift 3s ease infinite",
        rainbowGlow: "rainbowGlow 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
