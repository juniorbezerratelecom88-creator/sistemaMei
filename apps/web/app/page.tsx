'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTokens } from '../lib/api-client';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const { accessToken } = getTokens();
    router.replace(accessToken ? '/dashboard' : '/login');
  }, [router]);

  return null;
}
