import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { ConnectivityBanner } from '@/components/layout/ConnectivityBanner';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'JeevanSetu — Rural Public Healthcare Access Platform',
  description:
    'A unified public healthcare access and continuity platform connecting patients, frontline health workers, doctors, and hospitals.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0d9488',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen selection:bg-teal-500 selection:text-white pb-20 md:pb-6">
        <AppProvider>
          <DemoBanner />
          <ConnectivityBanner />
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">{children}</main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
