"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  adminDictionaries,
  adminLocaleCookie,
  isAdminLocale,
  type AdminLocale,
} from "@/lib/i18n/admin-locale";

interface AdminLocaleContextValue {
  locale: AdminLocale;
  dictionary: (typeof adminDictionaries)[AdminLocale];
  setLocale: (locale: AdminLocale) => void;
}

const AdminLocaleContext = createContext<AdminLocaleContextValue | null>(null);

export function AdminLocaleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [locale, updateLocale] = useState<AdminLocale>("en");

  useEffect(() => {
    const savedLocale = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${adminLocaleCookie}=`))
      ?.split("=")[1];
    if (!isAdminLocale(savedLocale)) return;
    const timer = window.setTimeout(() => updateLocale(savedLocale), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (nextLocale: AdminLocale) => {
      updateLocale(nextLocale);
      document.cookie = `${adminLocaleCookie}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
      router.refresh();
    },
    [router],
  );

  const value = useMemo(
    () => ({ locale, dictionary: adminDictionaries[locale], setLocale }),
    [locale, setLocale],
  );

  return (
    <AdminLocaleContext.Provider value={value}>
      {children}
    </AdminLocaleContext.Provider>
  );
}

export function useAdminLocale() {
  const context = useContext(AdminLocaleContext);
  if (!context) {
    throw new Error("useAdminLocale must be used inside AdminLocaleProvider");
  }
  return context;
}
