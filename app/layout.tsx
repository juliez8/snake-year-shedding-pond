import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shedding Island | Year of the Snake',
  description: 'An anonymous web ritual for Lunar New Year. Draw a snake, shed the past, welcome the Fire Horse Year.',
  keywords: ['lunar new year', 'year of the snake', 'web art', 'ritual', 'anonymous'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
