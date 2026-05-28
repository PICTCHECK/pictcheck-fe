import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/src/components/providers/app-providers";

export const metadata: Metadata = {
  title: "PictCheck",
  description: "이미지 기반 분석 결과를 신뢰감 있게 전달하는 AI 분석 서비스",
  icons: {
    icon: "/pictcheck_favicon.svg",
    shortcut: "/pictcheck_favicon.svg",
    apple: "/pictcheck_favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
