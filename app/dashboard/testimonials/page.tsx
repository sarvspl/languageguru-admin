'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestimonialsManagement() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/home-sections?tab=testimonials');
  }, [router]);

  return (
    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
      <p>Redirecting to <strong>Home Sections → Testimonials</strong>...</p>
    </div>
  );
}
