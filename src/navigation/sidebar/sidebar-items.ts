import {
  BadgeIndianRupee,
  BellRing,
  Bike,
  Building2,
  ClipboardCheck,
  FileClock,
  Headphones,
  LayoutDashboard,
  type LucideIcon,
  MapPinHouse,
  MapPinned,
  MessageSquareWarning,
  PackageCheck,
  Percent,
  Route,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export type NavBadge = "new" | "soon";
export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}
interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}
export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}
export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}
export type NavMainItem = NavMainLinkItem | NavMainParentItem;
export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Live operations",
    items: [
      { id: "overview", title: "Overview", url: "/dashboard", icon: LayoutDashboard },
      { id: "live-map", title: "Live driver map", url: "/dashboard/map", icon: MapPinned },
      { id: "trips", title: "Customer trips", url: "/dashboard/trips", icon: Route },
      { id: "orders", title: "Delivery orders", url: "/dashboard/orders", icon: PackageCheck },
    ],
  },
  {
    id: 2,
    label: "People & onboarding",
    items: [
      { id: "customers", title: "Customers", url: "/dashboard/customers", icon: Users },
      { id: "drivers", title: "Drivers", url: "/dashboard/drivers", icon: Bike },
      { id: "partners", title: "Partners", url: "/dashboard/partners", icon: Building2 },
      { id: "verification", title: "Verification", url: "/dashboard/verification", icon: ClipboardCheck },
    ],
  },
  {
    id: 3,
    label: "Control centre",
    items: [
      { id: "finance", title: "Finance", url: "/dashboard/finance", icon: BadgeIndianRupee },
      { id: "support", title: "Support", url: "/dashboard/support", icon: Headphones },
      { id: "safety", title: "Safety & fraud", url: "/dashboard/safety", icon: ShieldAlert },
      { id: "notifications", title: "Notifications", url: "/dashboard/notifications", icon: BellRing },
      { id: "promotions", title: "Promotions", url: "/dashboard/promotions", icon: Percent },
      { id: "service-areas", title: "Service areas", url: "/dashboard/service-areas", icon: MapPinHouse },
    ],
  },
  {
    id: 4,
    label: "Platform",
    items: [
      { id: "approvals", title: "Approvals", url: "/dashboard/approvals", icon: MessageSquareWarning },
      { id: "audit", title: "Audit log", url: "/dashboard/audit", icon: FileClock },
      { id: "configurations", title: "Configurations", url: "/dashboard/configurations", icon: SlidersHorizontal },
      { id: "settings", title: "Settings", url: "/dashboard/settings", icon: Settings },
    ],
  },
];
