import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { QuestlyProvider } from '@/lib/store';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Questly — The Living Productivity Game',
  description:
    'Build habits, complete quests, and watch your kingdom evolve with every minute of deep focus.',
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-theme-main text-theme-main selection:bg-purple-600 selection:text-white">
        <QuestlyProvider>{children}</QuestlyProvider>
      </body>
    </html>
  );
}
