import { TrpcProvider } from '@/utils/trpc-provider';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TRPC TODO LIST APP',
  description: 'A todo list app built with TRPC'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-200`}>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}
