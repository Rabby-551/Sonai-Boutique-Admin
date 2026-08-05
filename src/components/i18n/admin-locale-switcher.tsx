"use client";

import { useAdminLocale } from "./admin-locale-provider";

export function AdminLocaleSwitcher() {
  const { locale, dictionary, setLocale } = useAdminLocale();
  const nextLocale = locale === "en" ? "bn" : "en";

  return (
    <button
      aria-label={dictionary.shell.viewInLanguage}
      className={`admin-locale-toggle is-${locale}`}
      onClick={() => setLocale(nextLocale)}
      title={dictionary.shell.viewInLanguage}
      type="button"
    >
      <span className="admin-locale-option" lang="en">
        EN
      </span>
      <span className="admin-locale-option" lang="bn">
        বাংলা
      </span>
      <span aria-hidden className="admin-locale-thumb" />
    </button>
  );
}
