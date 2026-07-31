"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Role } from "@/lib/auth/permissions";
import { navigationForRole } from "@/lib/navigation";

export function QuickNavigation({ role }: { role: Role }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const items = useMemo(
    () => navigationForRole(role).flatMap((group) => group.items),
    [role],
  );
  const results = items.filter((item) => {
    const haystack = [item.label, item.description, ...item.keywords]
      .join(" ")
      .toLowerCase();
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return terms.every((term) => haystack.includes(term));
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        dialogRef.current?.showModal();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function close() {
    dialogRef.current?.close();
    setQuery("");
  }

  return (
    <>
      <button
        className="navigation-search-trigger"
        onClick={() => dialogRef.current?.showModal()}
        ref={triggerRef}
      >
        <Search aria-hidden size={17} />
        <span>Quick navigation</span>
        <kbd>Ctrl K</kbd>
      </button>
      <dialog
        aria-labelledby="quick-navigation-title"
        className="quick-navigation-dialog"
        onClick={(event) => event.target === event.currentTarget && close()}
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className="quick-navigation-panel">
          <div className="quick-navigation-heading">
            <div>
              <span className="eyebrow">Go to</span>
              <h2 id="quick-navigation-title">Quick navigation</h2>
            </div>
            <button
              className="topbar-icon-button"
              onClick={close}
              aria-label="Close quick navigation"
            >
              <X aria-hidden size={18} />
            </button>
          </div>
          <label className="quick-navigation-input">
            <Search aria-hidden size={18} />
            <span className="sr-only">Search admin pages</span>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pages and workflows"
            />
          </label>
          <div className="quick-navigation-results" aria-live="polite">
            {results.length ? (
              results.map(({ href, id, label, description, icon: Icon }) => (
                <Link
                  data-navigation-id={id}
                  href={href}
                  key={id}
                  onClick={close}
                >
                  <Icon aria-hidden size={18} />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </Link>
              ))
            ) : (
              <p className="empty-search">No matching admin pages.</p>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
