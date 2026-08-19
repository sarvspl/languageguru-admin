'use client';

import React, { useState } from 'react';

export default function TopNav({ title }: { title: string }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await fetch(`${API_URL}/api/v1/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  const triggerMobileSidebar = () => {
    window.dispatchEvent(new Event('toggle-mobile-sidebar'));
  };

  return (
    <div 
      className="adm-hd" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 16px', 
        height: '56px',
        minHeight: '56px',
        background: '#fff', 
        borderBottom: '1px solid var(--br)',
        position: 'relative',
        zIndex: 50
      }}
    >
      <button 
        className="mobile-menu-btn" 
        onClick={triggerMobileSidebar}
        style={{
          background: 'var(--bd)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          width: '34px',
          height: '34px',
          fontSize: '18px',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginRight: '10px',
          flexShrink: 0
        }}
        title="Open Navigation Menu"
      >
        ☰
      </button>

      <div 
        className="adm-hd-title" 
        id="admTitle" 
        style={{ 
          fontSize: '16px', 
          fontWeight: '800', 
          color: 'var(--bd)', 
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
          marginRight: '8px'
        }}
      >
        {title}
      </div>
      
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <button
          style={{ 
            fontSize: '12px', 
            color: 'var(--bb)', 
            cursor: 'pointer', 
            fontWeight: '700', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            background: '#f1f5f9',
            border: '1px solid var(--br)',
            padding: '6px 10px',
            borderRadius: '6px'
          }}
          onClick={() => { window.open('http://localhost:3000', '_blank'); }}
          title="View Live Website"
        >
          <span>🌐</span> <span className="top-link-text">View Site</span>
        </button>
        
        <div style={{ position: 'relative' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid var(--br)', cursor: 'pointer' }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="adm-av" style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>A</div>
            <div className="adm-user-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', lineHeight: '1' }}>Admin</div>
              <div style={{ fontSize: '10px', color: 'var(--mu)', marginTop: '3px' }}>Super Admin</div>
            </div>
            <span style={{ fontSize: '9px', color: 'var(--mu)' }}>▼</span>
          </div>
          
          {isDropdownOpen && (
            <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', background: '#fff', border: '1px solid var(--br)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', minWidth: '150px', zIndex: 100 }}>
              <div 
                style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--rd)', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }} 
                onClick={handleLogout}
              >
                <span>🚪</span> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


