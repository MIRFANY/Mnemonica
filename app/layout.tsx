import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mnemonica - AI-Powered Mnemonic Generator",
  description: "Transform information into unforgettable memory aids with AI-powered intelligence",
  applicationName: "Mnemonica",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mnemonica",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mnemonica.app",
    title: "Mnemonica - AI-Powered Mnemonic Generator",
    description: "Transform information into unforgettable memory aids with AI-powered intelligence",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><rect fill='%233b82f6' width='180' height='180'/><text x='90' y='90' font-size='100' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='central'>M</text></svg>" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mnemonica" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

function ServiceWorkerRegister() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                  console.log('[PWA] Service Worker registered:', registration);
                })
                .catch((error) => {
                  console.error('[PWA] Service Worker registration failed:', error);
                });
            });
          }
        `,
      }}
    />
  );
}
