import type { Metadata } from 'next';
import { Space_Grotesk, Space_Mono } from 'next/font/google';
import './globals.css';
import { QuestlyProvider } from '@/lib/store';

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
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-theme-main text-theme-main selection:bg-[#B5FF55] selection:text-[#101010] font-sans">
        <QuestlyProvider>{children}</QuestlyProvider>
      </body>
    </html>
  );
}
