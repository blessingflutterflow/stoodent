import type { Metadata } from "next";
import { Sofia_Sans } from "next/font/google";
import "./globals.css";

const sofiaSans = Sofia_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sofia",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stoodent — Assignment Help Platform",
  description: "Get real-time tutor assistance on your assignments",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sofiaSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
