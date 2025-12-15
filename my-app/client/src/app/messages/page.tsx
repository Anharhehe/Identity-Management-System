'use client';

import { useRouter } from 'next/navigation';
import { BiArrowBack } from 'react-icons/bi';

export default function MessagesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="text-6xl mb-6">💬</div>
          <h1 className="text-5xl font-bold dark:text-white text-gray-900 mb-4">
            Messages
          </h1>
          <p className="text-xl dark:text-gray-400 text-gray-600 mb-8">
            Coming Soon
          </p>
          <p className="dark:text-gray-400 text-gray-600 mb-8 max-w-md mx-auto">
            We're working on bringing you a messaging feature. Stay tuned!
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            Go to Home
          </button>
        </div>
      </main>
    </div>
  );
}
