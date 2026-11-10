import type { Metadata } from "next";
import "@fontsource/noto-serif/latin-ext-400.css";
import "@fontsource/noto-serif/latin-ext-600.css";
import "@fontsource/noto-serif/latin-ext-700.css";
import "@fontsource/roboto/latin-ext-400.css";
import "@fontsource/roboto/latin-ext-500.css";
import "@fontsource/roboto/latin-ext-700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Media hub – Posledný zostrel",
  description: "Podklady pre web, médiá a správcov FB stránok",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sk">
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
