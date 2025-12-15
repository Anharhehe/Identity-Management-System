'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/header/page';

export default function HeaderWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40 h-20"></header>
    );
  }

  return <Header />;
}
