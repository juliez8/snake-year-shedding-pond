import type { Metadata } from 'next';
import { Liu_Jian_Mao_Cao } from 'next/font/google';
import './globals.css';

const brushFont = Liu_Jian_Mao_Cao({
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Shedding Pond — Release What No Longer Serves You',
  description: 'A Spring Festival experience 🐍 Draw a snake, whisper what you wish to let go, and watch it drift into the pond.',
  keywords: ['spring festival', 'lunar new year', 'year of the snake', 'shedding', 'web art', 'ritual', 'anonymous'],
  openGraph: {
    title: 'Shedding Pond — Release What No Longer Serves You',
    description: 'A Spring Festival experience 🐍 Draw a snake, whisper what you wish to let go, and watch it drift into the pond.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shedding Pond — Release What No Longer Serves You',
    description: 'A Spring Festival experience 🐍 Draw a snake, whisper what you wish to let go, and watch it drift into the pond.',
  },
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
