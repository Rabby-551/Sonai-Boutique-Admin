import type { Metadata } from "next";
import "./globals.css";
import "@/styles/tokens.css";
import "@/styles/shell.css";
import "@/styles/components.css";
import "@/styles/motion.css";
import { MotionProvider } from "@/components/motion/motion-provider";

export const metadata: Metadata = {
  title: { default: "Sonai Admin", template: "%s · Sonai Admin" },
  description: "Sonai Boutique operations workspace",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
