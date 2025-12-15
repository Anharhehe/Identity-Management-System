'use client';

import { useLoading } from '@/context/LoadingContext';
import Loader from '@/components/loader/page';

export default function GlobalLoader() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-800 rounded-lg p-8 shadow-2xl">
        <Loader loading={true} color="#a855f7" size={60} />
        <p className="text-white text-center mt-4 font-medium">Loading...</p>
      </div>
    </div>
  );
}
