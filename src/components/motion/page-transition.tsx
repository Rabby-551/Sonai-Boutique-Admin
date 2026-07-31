"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { m, useReducedMotion } from "motion/react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className="page-transition"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      key={pathname}
      transition={{
        duration: reduceMotion ? 0.1 : 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </m.div>
  );
}
