'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import App from './App';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout() {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <App />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
