import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Планер",
  description: "Твій AI-планер дня",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI Планер",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#222631",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body style={{ background: '#222631', color: 'rgba(255,255,255,0.95)' }}>
        {children}
      </body>
    </html>
  );
}
