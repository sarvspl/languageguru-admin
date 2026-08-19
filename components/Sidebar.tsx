'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-mobile-sidebar', handleToggle);
  }, []);

  const ADM_NAV = [
    { icon: '📊', label: 'Dashboard', sub: '/dashboard' },
    { icon: '🎯', label: 'Leads / CRM', sub: '/dashboard/leads' },
    { icon: '👥', label: 'Clients', sub: '/dashboard/clients' },
    { icon: '📁', label: 'Projects', sub: '/dashboard/projects' },
    { icon: '📦', label: 'Orders', sub: '/dashboard/orders' },
    { icon: '💳', label: 'Payments', sub: '/dashboard/payments' },
    { icon: '🧾', label: 'Invoices', sub: '/dashboard/invoices' },
    { icon: '💬', label: 'Quotes', sub: '/dashboard/quotes' },
    { icon: '📝', label: 'Translators & Interpreters', sub: '/dashboard/translators' },
    { icon: '🌐', label: 'Languages', sub: '/dashboard/languages' },
    { icon: '⚙️', label: 'Services', sub: '/dashboard/services' },
    { icon: '🏭', label: 'Industries', sub: '/dashboard/industries' },
    { icon: '🏙️', label: 'Cities', sub: '/dashboard/cities' },
    { icon: '⭐', label: 'Testimonials', sub: '/dashboard/testimonials' },
    { icon: '❓', label: 'FAQs', sub: '/dashboard/faqs' },
    { icon: '📃', label: 'CMS Pages', sub: '/dashboard/pages' },
    { icon: 'ℹ️', label: 'About Page', sub: '/dashboard/about' },
    { icon: '📞', label: 'Contact Page', sub: '/dashboard/contact' },
    { icon: '👥', label: 'Clients & Partners', sub: '/dashboard/clients' },
    { icon: '🏠', label: 'Home Sections', sub: '/dashboard/home-sections' },
    { icon: '🖼️', label: 'Gallery', sub: '/dashboard/gallery' },
    { icon: '📄', label: 'Certificates', sub: '/dashboard/certificate' },
    { icon: '📈', label: 'Reports', sub: '/dashboard/reports' },
    { icon: '🔧', label: 'Settings', sub: '/dashboard/settings' },
  ];

  return (
    <>
      {isMobileOpen && (
        <div 
          className="adm-mobile-backdrop" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}
      <div 
        className={`adm-sb ${isCollapsed ? 'coll' : ''} ${isMobileOpen ? 'mobile-open' : ''}`} 
        id="admSb" 
        style={{ position: 'relative' }}
      >
        <div className="adm-logo" style={{ padding: isCollapsed ? '16px 0' : '16px', justifyContent: isCollapsed ? 'center' : 'flex-start', position: 'relative' }}>
          <div className="adm-logo-icon">🌐</div>
          {(!isCollapsed || isMobileOpen) && (
            <div>
              <div className="adm-logo-text">Language Guru</div>
              <div className="adm-logo-sub">ADMIN PANEL</div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="desktop-collapse-btn"
          style={{ 
            position: 'absolute', 
            top: '22px', 
            right: isCollapsed ? '0' : '16px',
            width: isCollapsed ? '100%' : 'auto',
            textAlign: isCollapsed ? 'center' : 'right',
            background: 'none', 
            border: 'none', 
            color: 'rgba(255,255,255,.6)', 
            cursor: 'pointer', 
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: 10
          }}
        >
          {isCollapsed ? '⟩' : '⟨'}
        </button>
        
        <div className="adm-nav-area" id="admNavArea" style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {ADM_NAV.map((nav) => {
            const isActive = pathname === nav.sub;
            return (
              <Link 
                key={nav.label} 
                href={nav.sub} 
                className={`adm-nl ${isActive ? 'act' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <span className="icon">{nav.icon}</span>
                {(!isCollapsed || isMobileOpen) && <span>{nav.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

