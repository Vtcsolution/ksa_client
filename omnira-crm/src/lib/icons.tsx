import {
  LayoutDashboard,
  Users,
  Car,
  UploadCloud,
  UserCog,
  Target,
  Printer,
  BookOpen,
  FileText,
  File,
  Image,
  Copy,
  Receipt,
  Landmark,
  Gift,
  Trophy,
  Archive,
  Library,
  Bell,
  BellRing,
  Search,
  Phone,
  PhoneOff,
  PhoneMissed,
  MapPin,
  MapPinned,
  CalendarClock,
  CalendarCheck,
  Calculator,
  ArrowLeftRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  X,
  RotateCcw,
  Clock,
  Handshake,
  Scale,
  Camera,
  ScanFace,
  Video,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wallet,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  Stethoscope,
  Gem,
  Building,
  Globe,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  RefreshCw,
  Lock,
  Send,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  UserRound,
  Play,
  Pause,
  CreditCard,
  Menu,
  Languages,
  Loader2,
  FileSpreadsheet,
  UserPlus,
  IdCard,
  MessageSquareText,
  Sparkles,
  Info,
  ExternalLink,
  History,
  Lightbulb,
  Download,
  SearchX,
  Save,
  Mic,
  ListChecks,
  Smile,
  Meh,
  Frown,
  Flame,
  Gauge,
  Quote,
  Star,
  Mail,
  Megaphone,
  MessageCircle,
  Eye,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react";

export type { LucideIcon };

export {
  LayoutDashboard,
  Users,
  Car,
  UploadCloud,
  UserCog,
  Target,
  Printer,
  BookOpen,
  FileText,
  File,
  Image,
  Copy,
  Receipt,
  Landmark,
  Gift,
  Trophy,
  Archive,
  Library,
  Bell,
  BellRing,
  Search,
  Phone,
  PhoneOff,
  PhoneMissed,
  MapPin,
  MapPinned,
  CalendarClock,
  CalendarCheck,
  Calculator,
  ArrowLeftRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  X,
  RotateCcw,
  Clock,
  Handshake,
  Scale,
  Camera,
  ScanFace,
  Video,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Wallet,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  Stethoscope,
  Gem,
  Building,
  Globe,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  RefreshCw,
  Lock,
  Send,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  UserRound,
  Play,
  Pause,
  CreditCard,
  Menu,
  Languages,
  Loader2,
  FileSpreadsheet,
  UserPlus,
  IdCard,
  MessageSquareText,
  Sparkles,
  Info,
  ExternalLink,
  History,
  Lightbulb,
  Download,
  SearchX,
  Save,
  Mic,
  ListChecks,
  Smile,
  Meh,
  Frown,
  Flame,
  Gauge,
  Quote,
  Star,
  Mail,
  Megaphone,
  MessageCircle,
  Eye,
  MousePointerClick,
};

import type { MeetingType, LeadSource, Role } from "./types";
import type { CallSentiment } from "./callInsights";

export const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  leads: Users,
  field: Car,
  distribute: UploadCloud,
  calls: Mic,
  staff: UserCog,
  targets: Target,
  report: Printer,
  sops: BookOpen,
  services: FileText,
  segments: Trophy,
  archive: Archive,
  content: Library,
  myleads: Users,
  followups: Bell,
  search: Search,
  mystats: Target,
  quotation: Receipt,
  finance: Landmark,
  referrals: Gift,
  feedback: MessageSquareText,
  siteLeads: Globe,
  testimonials: Quote,
  marketing: Megaphone,
};

export const SEGMENT_ICONS: Record<string, LucideIcon> = {
  hotels: Building2,
  restaurants: UtensilsCrossed,
  malls: ShoppingBag,
  hospitals: Stethoscope,
  halls: Gem,
  complexes: Building,
};

export function getSegmentIcon(segmentId: string): LucideIcon {
  return SEGMENT_ICONS[segmentId] ?? MapPin;
}

type IconProps = { size?: number; strokeWidth?: number; className?: string };

/**
 * Icon-picking components below render a literal, statically-known JSX tag per
 * branch (never a component reference stashed in a variable) so the react
 * compiler can treat them as stable — the pattern it flags is `const X = fn();
 * <X/>`, not a switch/ternary of literal elements.
 */
export function SegmentIcon({ segmentId, ...props }: { segmentId: string } & IconProps) {
  switch (segmentId) {
    case "hotels":
      return <Building2 {...props} />;
    case "restaurants":
      return <UtensilsCrossed {...props} />;
    case "malls":
      return <ShoppingBag {...props} />;
    case "hospitals":
      return <Stethoscope {...props} />;
    case "halls":
      return <Gem {...props} />;
    case "complexes":
      return <Building {...props} />;
    default:
      return <MapPin {...props} />;
  }
}

export function getContentTypeIcon(fileType: string): LucideIcon {
  switch (fileType) {
    case "pdf":
      return FileText;
    case "image":
      return Image;
    case "doc":
      return ClipboardList;
    case "link":
      return Globe;
    default:
      return File;
  }
}

export const SOP_ICONS: Record<string, LucideIcon> = {
  daily: Clock,
  call: Phone,
  visit: Car,
  meeting: Handshake,
  rules: Scale,
};

export function getUserIcon(role: Role): LucideIcon {
  return role === "manager" ? ShieldCheck : UserRound;
}

export function getMeetingTypeIcon(type: MeetingType): LucideIcon {
  return type === "inperson" ? Handshake : Video;
}

export function getSourceIcon(source: LeadSource): LucideIcon {
  if (source === "field") return Car;
  if (source === "ziwo") return Phone;
  if (source === "website") return Globe;
  return FileSpreadsheet;
}

export function UserRoleIcon({ role, ...props }: { role: Role } & IconProps) {
  if (role === "manager") return <ShieldCheck {...props} />;
  return <UserRound {...props} />;
}

export function MeetingTypeIcon({ type, ...props }: { type: MeetingType } & IconProps) {
  if (type === "inperson") return <Handshake {...props} />;
  return <Video {...props} />;
}

export function SourceIcon({ source, ...props }: { source: LeadSource } & IconProps) {
  if (source === "field") return <Car {...props} />;
  if (source === "ziwo") return <Phone {...props} />;
  if (source === "website") return <Globe {...props} />;
  return <FileSpreadsheet {...props} />;
}

export function SentimentIcon({ sentiment, ...props }: { sentiment: CallSentiment } & IconProps) {
  if (sentiment === "positive") return <Smile {...props} />;
  if (sentiment === "negative") return <Frown {...props} />;
  return <Meh {...props} />;
}
