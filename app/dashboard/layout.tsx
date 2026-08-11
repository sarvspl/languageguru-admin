'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="spa-main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      <div className="topbar" style={{ flexShrink: 0 }}>
        <div className="topbar-inner" style={{ maxWidth: '100%', padding: '0 10px' }}>
          <span>📍 617, West End Mall, Janakpuri, New Delhi – 110058</span>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
            <a href="tel:+919312690490">📞 +91-9312690490</a>
            <a href="mailto:info@languageguruindia.com">✉ info@languageguruindia.com</a>
          </div>
        </div>
      </div>

      <div className="page active" id="page-admin" style={{ display: 'block', flex: 1, minHeight: 0 }}>
        <div className="adm-wrap">
          <Sidebar />
          <div className="adm-main">
            {children}
          </div>
        </div>
      </div>

    </main>
  );
}
