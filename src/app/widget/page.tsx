'use client';

import React from 'react';
import { useQuestly } from '@/lib/store';
import { MobileWidgetView } from '@/components/widgets/MobileWidgetView';

export default function StandaloneWidgetPage() {
  const { isHydrated } = useQuestly();

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[#090A0D] flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-xl bg-[#B5FF55] animate-pulse" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090A0D] flex items-center justify-center p-4">
      <MobileWidgetView standalone={true} />
    </main>
  );
}
