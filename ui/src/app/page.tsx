'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Disable SSR for AppRoot since it uses browser APIs
const AppRoot = dynamic(() => import('@/components/AppRoot'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl text-gray-600">Loading...</div>
    </div>
  )
});

export default function Home() {
  return <AppRoot />;
}
