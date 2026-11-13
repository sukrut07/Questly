import type { Metadata } from 'next';
import { Space_Grotesk, Space_Mono, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { QuestlyProvider } from '@/lib/store';
import { NeonCursor } from '@/components/common/NeonCursor';

const barlowCondensed = Barlow_Condensed({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const spaceMono = Space_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Questly — Personal Academic & Productivity Operating System',
  description:
    'Make progress. Make it count. Questly brings your tasks, learning goals, checklists, and daily progress into one system you control.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${spaceGrotesk.variable} ${spaceMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#090A0D] text-[#F5F5F5] selection:bg-[#B5FF55] selection:text-[#090A0D] font-sans">
        <NeonCursor />
        <QuestlyProvider>{children}</QuestlyProvider>
      </body>
    </html>
  );
}
