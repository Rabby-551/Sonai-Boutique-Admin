import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Shonai Admin", template: "%s · Shonai Admin" },
  description: "Shonai Boutique operations workspace",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
