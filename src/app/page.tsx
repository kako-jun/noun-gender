'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // ルートページにアクセスした場合、/browseにリダイレクト
    router.replace('/browse');
  }, [router]);

  return null;
}