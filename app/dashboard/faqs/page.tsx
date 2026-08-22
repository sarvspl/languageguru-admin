'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FaqsManagement() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/home-sections?tab=faqs');
  }, [router]);

  return (
    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
      <p>Redirecting to <strong>Home Sections → FAQs</strong>...</p>
    </div>
  );
}
