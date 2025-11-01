import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "医药考试通 - 执业药师题库 | AI智能刷题平台",
  description: "医药考试通提供执业药师、药学职称、中医师等考试题库，支持AI智能出题、错题解析、模拟考试，助你高效通关。",
  keywords: ["执业药师题库", "药学考试", "执业药师刷题", "中医师题库", "药学职称考试"],
  authors: [{ name: "医药考试通" }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://medexam.pro",
    title: "医药考试通 - 执业药师题库",
    description: "10万+精选题目，AI智能解析",
    siteName: "医药考试通",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

