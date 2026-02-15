import type { Metadata } from 'next';
import { Liu_Jian_Mao_Cao } from 'next/font/google';
import './globals.css';

const brushFont = Liu_Jian_Mao_Cao({
  weight: '400',
  subsets: ['latin'],
});

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
      <body className={`${brushFont.className} min-h-screen min-h-dvh bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 overflow-x-hidden`}>{children}</body>
    </html>
  );
}
