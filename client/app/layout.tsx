'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout() {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <div id="__next">
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
              {/* Content will be rendered by page.tsx */}
            </div>
          </div>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
