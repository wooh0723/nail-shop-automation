import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "시그니초 네일 룩북",
  description: "시그니초 네일 네일아트 룩북",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&display=swap"
        />
      </head>
      <body className="grain min-h-[100dvh]">{children}</body>
    </html>
  );
}
