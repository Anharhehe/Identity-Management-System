'use client';

import { Rings } from 'react-loader-spinner';

interface LoaderProps {
  loading?: boolean;
  color?: string;
  size?: number;
}

export default function Loader({
  loading = true,
  color = '#a855f7',
  size = 60,
}: LoaderProps) {
  return (
    <div className="flex items-center justify-center">
      <Rings
        visible={loading}
        height={size}
        width={size}
        color={color}
        ariaLabel="rings-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
}
