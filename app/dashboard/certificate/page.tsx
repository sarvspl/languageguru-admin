'use client';

import React from 'react';
import TopNav from '@/components/TopNav';
import CertificateGenerator from '@/components/CertificateGenerator';

export default function CertificatePage() {
  return (
    <>
      <TopNav title="📄 Certificate Generator" />
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <CertificateGenerator />
      </div>
    </>
  );
}
