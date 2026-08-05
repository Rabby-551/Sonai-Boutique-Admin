export type AdminLocale = "en" | "bn";

export const adminLocaleCookie = "sonai-admin-locale";

export function isAdminLocale(value: unknown): value is AdminLocale {
  return value === "en" || value === "bn";
}

interface AdminDictionary {
  shell: {
    skipToContent: string;
    primaryNavigation: string;
    navigationMenu: string;
    openNavigation: string;
    closeNavigation: string;
    expandSidebar: string;
    collapseSidebar: string;
    operationsWorkspace: string;
    adminFallback: string;
    activeBranch: string;
    allLocations: string;
    online: string;
    notifications: string;
    noUnreadNotifications: string;
    profileMenu: string;
    access: string;
    signOut: string;
    quickNavigation: string;
    goTo: string;
    closeQuickNavigation: string;
    searchAdminPages: string;
    searchPlaceholder: string;
    noMatchingPages: string;
    boutique: string;
    brandAlt: string;
    viewInLanguage: string;
  };
  dashboard: {
    eyebrow: string;
    title: string;
    summary: (range: string, location: string) => string;
    brandEyebrow: string;
    brandTitle: string;
    brandDescription: string;
    brandAria: string;
    brandArtworkAlt: string;
    location: string;
    channel: string;
    dateRange: string;
    allChannels: string;
    branches: string;
    last7Days: string;
    last30Days: string;
    last90Days: string;
    updateDashboard: string;
    reset: string;
    revenue: string;
    orders: string;
    grossProfit: string;
    inventoryValue: string;
    previousPeriod: string;
    deliverySuccess: string;
    margin: string;
    currentScope: string;
    businessMetrics: string;
    revenueTrend: string;
    filteredPerformance: string;
    peak: string;
    values: string;
    attentionQueue: string;
    needsAction: string;
    noAlerts: string;
    fulfillment: string;
    orderProgress: string;
    channelMix: string;
    revenueContribution: string;
    recentActivity: string;
    recentOrders: string;
    viewAllOrders: string;
    order: string;
    customer: string;
    total: string;
    payment: string;
    status: string;
    noOrders: string;
  };
}

const en: AdminDictionary = {
  shell: {
    skipToContent: "Skip to main content",
    primaryNavigation: "Primary navigation",
    navigationMenu: "Navigation menu",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    expandSidebar: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
    operationsWorkspace: "Operations workspace",
    adminFallback: "Sonai Admin",
    activeBranch: "Active branch",
    allLocations: "All locations",
    online: "Online",
    notifications: "Notifications, none unread",
    noUnreadNotifications: "No unread notifications",
    profileMenu: "Profile menu for",
    access: "access",
    signOut: "Sign out",
    quickNavigation: "Quick navigation",
    goTo: "Go to",
    closeQuickNavigation: "Close quick navigation",
    searchAdminPages: "Search admin pages",
    searchPlaceholder: "Search pages and workflows",
    noMatchingPages: "No matching admin pages.",
    boutique: "Boutique",
    brandAlt: "Sonai Boutique",
    viewInLanguage: "বাংলায় দেখুন",
  },
  dashboard: {
    eyebrow: "Business intelligence · FR-182",
    title: "Operations overview",
    summary: (range, location) => `${range} revenue across ${location}.`,
    brandEyebrow: "One Sonai workspace",
    brandTitle: "Website, branches and atelier operations in one view.",
    brandDescription:
      "Publish the collection, protect stock, fulfil every order and keep the customer promise consistent across every Sonai channel.",
    brandAria: "Sonai Boutique operations",
    brandArtworkAlt: "Sonai Boutique saree and three-piece campaign",
    location: "Location",
    channel: "Channel",
    dateRange: "Date range",
    allChannels: "All channels",
    branches: "Branches",
    last7Days: "Last 7 days",
    last30Days: "Last 30 days",
    last90Days: "Last 90 days",
    updateDashboard: "Update dashboard",
    reset: "Reset",
    revenue: "Revenue",
    orders: "Orders",
    grossProfit: "Gross profit",
    inventoryValue: "Inventory value",
    previousPeriod: "vs previous period",
    deliverySuccess: "delivery success",
    margin: "margin",
    currentScope: "Current filtered scope",
    businessMetrics: "Business metrics",
    revenueTrend: "Revenue trend",
    filteredPerformance: "Filtered performance",
    peak: "Peak",
    values: "Values",
    attentionQueue: "Attention queue",
    needsAction: "What needs action",
    noAlerts: "No operational alerts in this scope.",
    fulfillment: "Fulfillment",
    orderProgress: "Order progress",
    channelMix: "Channel mix",
    revenueContribution: "Revenue contribution",
    recentActivity: "Recent activity",
    recentOrders: "Recent orders",
    viewAllOrders: "View all orders",
    order: "Order",
    customer: "Customer",
    total: "Total",
    payment: "Payment",
    status: "Status",
    noOrders: "No orders in this filtered period.",
  },
};

const bn: AdminDictionary = {
  shell: {
    skipToContent: "মূল কনটেন্টে যান",
    primaryNavigation: "প্রধান নেভিগেশন",
    navigationMenu: "নেভিগেশন মেনু",
    openNavigation: "নেভিগেশন খুলুন",
    closeNavigation: "নেভিগেশন বন্ধ করুন",
    expandSidebar: "সাইডবার প্রসারিত করুন",
    collapseSidebar: "সাইডবার সংকুচিত করুন",
    operationsWorkspace: "অপারেশনস ওয়ার্কস্পেস",
    adminFallback: "সোনাই অ্যাডমিন",
    activeBranch: "সক্রিয় শাখা",
    allLocations: "সব লোকেশন",
    online: "অনলাইন",
    notifications: "কোনো অপঠিত নোটিফিকেশন নেই",
    noUnreadNotifications: "কোনো অপঠিত নোটিফিকেশন নেই",
    profileMenu: "প্রোফাইল মেনু",
    access: "অ্যাক্সেস",
    signOut: "সাইন আউট",
    quickNavigation: "দ্রুত নেভিগেশন",
    goTo: "যান",
    closeQuickNavigation: "দ্রুত নেভিগেশন বন্ধ করুন",
    searchAdminPages: "অ্যাডমিন পেজ খুঁজুন",
    searchPlaceholder: "পেজ ও কার্যপ্রবাহ খুঁজুন",
    noMatchingPages: "কোনো মিলযুক্ত অ্যাডমিন পেজ নেই।",
    boutique: "বুটিক",
    brandAlt: "সোনাই বুটিক",
    viewInLanguage: "View in English",
  },
  dashboard: {
    eyebrow: "ব্যবসায়িক তথ্য · FR-182",
    title: "অপারেশনস ওভারভিউ",
    summary: (range, location) => `${location}-এর ${range} আয়ের সারাংশ।`,
    brandEyebrow: "একটি সোনাই ওয়ার্কস্পেস",
    brandTitle: "ওয়েবসাইট, শাখা ও অ্যাটেলিয়ার অপারেশনস এক নজরে।",
    brandDescription:
      "কালেকশন প্রকাশ, স্টক সুরক্ষা, অর্ডার পূরণ এবং সোনাইয়ের প্রতিটি চ্যানেলে একই গ্রাহকসেবা নিশ্চিত করুন।",
    brandAria: "সোনাই বুটিক অপারেশনস",
    brandArtworkAlt: "সোনাই বুটিক শাড়ি ও থ্রি-পিস ক্যাম্পেইন",
    location: "লোকেশন",
    channel: "চ্যানেল",
    dateRange: "তারিখের পরিসর",
    allChannels: "সব চ্যানেল",
    branches: "শাখা",
    last7Days: "গত ৭ দিন",
    last30Days: "গত ৩০ দিন",
    last90Days: "গত ৯০ দিন",
    updateDashboard: "ড্যাশবোর্ড হালনাগাদ করুন",
    reset: "রিসেট",
    revenue: "আয়",
    orders: "অর্ডার",
    grossProfit: "মোট মুনাফা",
    inventoryValue: "ইনভেন্টরির মূল্য",
    previousPeriod: "আগের সময়ের তুলনায়",
    deliverySuccess: "ডেলিভারি সফলতা",
    margin: "মার্জিন",
    currentScope: "বর্তমান ফিল্টার করা পরিসর",
    businessMetrics: "ব্যবসায়িক সূচক",
    revenueTrend: "আয়ের প্রবণতা",
    filteredPerformance: "ফিল্টার করা কার্যসম্পাদন",
    peak: "সর্বোচ্চ",
    values: "মান",
    attentionQueue: "মনোযোগের তালিকা",
    needsAction: "যেগুলোতে পদক্ষেপ প্রয়োজন",
    noAlerts: "এই পরিসরে কোনো অপারেশনাল সতর্কতা নেই।",
    fulfillment: "অর্ডার পূরণ",
    orderProgress: "অর্ডারের অগ্রগতি",
    channelMix: "চ্যানেলের অনুপাত",
    revenueContribution: "আয়ে অবদান",
    recentActivity: "সাম্প্রতিক কার্যক্রম",
    recentOrders: "সাম্প্রতিক অর্ডার",
    viewAllOrders: "সব অর্ডার দেখুন",
    order: "অর্ডার",
    customer: "ক্রেতা",
    total: "মোট",
    payment: "পেমেন্ট",
    status: "অবস্থা",
    noOrders: "এই সময়ে কোনো অর্ডার নেই।",
  },
};

export const adminDictionaries: Record<AdminLocale, AdminDictionary> = {
  en,
  bn,
};

export const navigationGroupLabelsBn: Record<string, string> = {
  overview: "ওভারভিউ",
  commerce: "কমার্স",
  "relationships-supply": "সম্পর্ক ও সরবরাহ",
  "growth-finance": "প্রবৃদ্ধি ও অর্থ",
  "people-governance": "জনবল ও পরিচালনা",
  "platform-review": "প্ল্যাটফর্ম ও পর্যালোচনা",
};

export const navigationItemLabelsBn: Record<string, string> = {
  dashboard: "ড্যাশবোর্ড",
  pos: "পয়েন্ট অব সেল",
  "settings-pos": "পিওএস সেটিংস",
  products: "পণ্য",
  categories: "ক্যাটাগরি",
  website: "ওয়েবসাইট",
  inventory: "ইনভেন্টরি",
  "stock-movements": "স্টক মুভমেন্ট",
  "stock-counts": "স্টক গণনা",
  orders: "অর্ডার",
  customers: "ক্রেতা",
  complaints: "অভিযোগ",
  suppliers: "সরবরাহকারী",
  "purchase-orders": "ক্রয় অর্ডার",
  campaigns: "ক্যাম্পেইন",
  reports: "রিপোর্ট",
  insights: "ইনসাইট",
  "customers-segments": "সেগমেন্ট",
  "loyalty-rewards": "লয়্যালটি পুরস্কার",
  "finance-reconciliation": "হিসাব মিলানো",
  channels: "চ্যানেল",
  staff: "কর্মী",
  attendance: "উপস্থিতি",
  payroll: "বেতন",
  users: "ব্যবহারকারী",
  roles: "ভূমিকা",
  "audit-log": "অডিট লগ",
  settings: "সেটিংস",
  "settings-localization": "স্থানীয়করণ",
  "automation-rules": "অটোমেশন",
  platform: "প্ল্যাটফর্ম",
  demo: "ডেমো ও ইউএটি",
};

export function localizeAdminTerm(value: string, locale: AdminLocale): string {
  if (locale === "en") return value.replaceAll("_", " ");
  const terms: Record<string, string> = {
    confirmed: "নিশ্চিত",
    packed: "প্যাক করা",
    shipped: "পাঠানো হয়েছে",
    delivered: "ডেলিভারি হয়েছে",
    Website: "ওয়েবসাইট",
    WhatsApp: "হোয়াটসঅ্যাপ",
    Branch: "শাখা",
    Online: "অনলাইন",
    Paid: "পরিশোধিত",
    COD: "ক্যাশ অন ডেলিভারি",
    Confirmed: "নিশ্চিত",
    Packed: "প্যাক করা",
    Delivered: "ডেলিভারি হয়েছে",
    Rupnagar: "রূপনগর",
    "Mirpur 2": "মিরপুর ২",
  };
  return terms[value] ?? value.replaceAll("_", " ");
}
