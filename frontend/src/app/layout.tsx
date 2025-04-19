import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header/Header';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const geistRoboto = Geist({
  variable: '--font-geist-roboto',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tonfy',
  description:
    'Tonfy - A tool for extracting ads data from global social media platforms.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistRoboto.variable} antialiased`}>
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
