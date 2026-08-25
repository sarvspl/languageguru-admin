'use client';

import React, { useEffect, useState } from 'react';
import { adminPath } from '../../lib/basePath';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import { API_URL } from '../../lib/env';


interface Quote {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceKey: string;
  sourceLang: string;
  targetLang: string;
  pages: number;
  status: string;
  createdAt: string;
}

const formatServiceName = (keyOrName: string) => {
  if (!keyOrName) return 'Certified Translation';
  const numericMap: Record<string, string> = {
    '850': 'Certified Translation',
    '899': 'Website Localization',
    '999': 'Notarized Translation',
    '1400': 'Apostille & Attestation',
    '2500': 'Interpreter Service',
    '4500': 'Interpreter Service (Half-Day)',
    '7500': 'Interpreter Service (Full-Day)',
    'certified': 'Certified Translation',
    'legal': 'Legal Translation',
    'medical': 'Medical Translation',
    'technical': 'Technical Translation',
    'business': 'Business Translation',
    'academic': 'Academic Translation',
    'interpretation': 'Interpretation Service',
    'apostille': 'MEA Apostille',
    'attestation': 'Embassy Attestation',
    'localization': 'Website Localization'
  };
  const lower = keyOrName.toLowerCase().trim();
  if (numericMap[lower]) {
    return numericMap[lower];
  }
  return keyOrName.split(' — ')[0].split(' - ')[0].trim();
};

export default function DashboardOverview() {
  const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [dbStats, setDbStats] = useState({
    totalQuotes: 0,
    pendingQuotes: 0,
    totalLanguages: 0,
    totalCities: 0,
    totalServices: 0,
    completedOrders: 0,
    revenue: 0,
    leadRouting: {
      translation: 0,
      interpreter: 0,
      apostille: 0,
      training: 0
    },
    recentOrders: [] as any[]
  });

  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/dashboard/stats`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDbStats(data.data);
          if (Array.isArray(data.data?.recentQuotes) && data.data.recentQuotes.length > 0) {
            setRecentQuotes(data.data.recentQuotes.slice(0, 5));
            setQuotesLoading(false);
          }
        }
      })
      .catch(err => console.error('Error fetching stats:', err));

    fetch(`${API_URL}/api/v1/quotes`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setRecentQuotes(data.data.slice(0, 5));
        }
      })
      .catch(err => console.error('Error fetching quotes:', err))
      .finally(() => setQuotesLoading(false));
  }, []);


  const stats = [
    { l: 'Total Cities Covered', v: dbStats.totalCities, s: 'Across India', c: '#dbeafe', tc: '#1d4ed8', ic: '🏙️' },
    { l: 'Total Quote Requests', v: dbStats.totalQuotes, s: 'All time', c: '#fef3c7', tc: '#b45309', ic: '📋' },
    { l: 'Pending Quotations', v: dbStats.pendingQuotes, s: 'Awaiting response', c: '#fee2e2', tc: '#b91c1c', ic: '⏳' },
    { l: 'Completed Orders', v: dbStats.completedOrders, s: `₹${(dbStats.revenue / 100000).toFixed(1)}L revenue`, c: '#d1fae5', tc: '#065f46', ic: '✅' },
    { l: 'Supported Languages', v: dbStats.totalLanguages, s: 'Indian & Foreign', c: '#ede9fe', tc: '#5b21b6', ic: '🌐' },
    { l: 'Active Services', v: dbStats.totalServices, s: 'Available now', c: '#ccfbf1', tc: '#0f766e', ic: '🛠️' },
  ];

  const leadRouting = [
    { icon: '📝', label: 'Translation Leads', team: 'Translation Team', count: dbStats.leadRouting.translation, color: '#dbeafe', tc: '#1d4ed8' },
    { icon: '🎤', label: 'Interpreter Leads', team: 'Interpretation Team', count: dbStats.leadRouting.interpreter, color: '#fef3c7', tc: '#b45309' },
    { icon: '📌', label: 'Apostille Leads', team: 'Documentation Team', count: dbStats.leadRouting.apostille, color: '#d1fae5', tc: '#065f46' },
    { icon: '🎓', label: 'Training Leads', team: 'Training Team', count: dbStats.leadRouting.training, color: '#ede9fe', tc: '#5b21b6' },
  ];

  const recentOrders = dbStats.recentOrders;

  return (
    <>
      <TopNav title="📊 Dashboard" />
      <div className="adm-cnt" id="admContent" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>Dashboard Overview</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--mu)' }}>{currentDate}</p>
          </div>
          <Link href="/dashboard/leads" style={{ textDecoration: 'none' }}>
            <button style={{ background: 'var(--ac)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              📨 New Leads
            </button>
          </Link>
        </div>

        <div className="stat-row">
          {stats.map((s, idx) => (
            <div key={idx} className="stat-box" style={{ background: s.c, border: `1.5px solid ${s.c}` }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{s.ic}</div>
              <div className="stat-box-n" style={{ color: s.tc }}>{s.v}</div>
              <div className="stat-box-l" style={{ color: s.tc }}>{s.l}</div>
              <div className="stat-box-s" style={{ color: s.tc }}>{s.s}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1.5px solid var(--br)', borderRadius: '14px', marginBottom: '16px', overflow: 'hidden' }}>
          <div style={{ background: 'var(--bd)', color: '#fff', padding: '12px 16px', fontWeight: '700', fontSize: '13px' }}>
            🚦 Automatic Lead Routing
          </div>
          <div className="grid-2" style={{ padding: '16px', gap: '10px' }}>
            {leadRouting.map((r, idx) => {
              const typeMap: Record<string, string> = {
                'Translation Leads': 'translation',
                'Interpreter Leads': 'interpreter',
                'Apostille Leads': 'apostille',
                'Training Leads': 'training'
              };
              const leadType = typeMap[r.label] || '';
              return (
                <Link key={idx} href={`/dashboard/leads${leadType ? `?type=${leadType}` : ''}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: r.color, borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <div style={{ fontSize: '24px' }}>{r.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '12.5px', color: r.tc }}>{r.label}</div>
                      <div style={{ fontSize: '11px', color: r.tc, opacity: 0.8 }}>→ {r.team}</div>
                    </div>
                    <div style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: r.tc }}>{r.count}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid-2">
          
          <div style={{ background: '#fff', border: '1.5px solid var(--br)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--br)' }}>
              <h3 style={{ fontWeight: '700', color: 'var(--bd)', fontSize: '14px' }}>📥 Live Quote Queue</h3>
              <a href={adminPath('dashboard/quotes')} style={{ fontSize: '12px', fontWeight: '600', color: 'var(--bb)', textDecoration: 'none' }}>View All →</a>
            </div>
            {quotesLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Loading...</div>
            ) : recentQuotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '13px' }}>
                No quote requests yet.<br />Submit the quote form to see them here.
              </div>
            ) : (
              recentQuotes.map((q) => {
                const statusColors: Record<string, { bg: string; tc: string }> = {
                  PENDING:     { bg: '#fef9c3', tc: '#854d0e' },
                  CONTACTED:   { bg: '#dbeafe', tc: '#1d4ed8' },
                  IN_PROGRESS: { bg: '#e0e7ff', tc: '#3730a3' },
                  COMPLETED:   { bg: '#d1fae5', tc: '#065f46' },
                  CANCELLED:   { bg: '#fee2e2', tc: '#b91c1c' },
                };
                const sc = statusColors[q.status] || statusColors.PENDING;
                const timeAgo = new Date(q.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', borderBottom: '1px solid var(--br)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bp)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>📋</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', fontSize: '12.5px', color: 'var(--bd)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.name}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{q.phone} · {formatServiceName(q.serviceKey)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ background: sc.bg, color: sc.tc, fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', display: 'block', marginBottom: '2px' }}>{q.status}</span>
                      <div style={{ fontSize: '10px', color: '#9ca3af' }}>{timeAgo}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ background: '#fff', border: '1.5px solid var(--br)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--br)' }}>
              <h3 style={{ fontWeight: '700', color: 'var(--bd)', fontSize: '14px' }}>📦 Recent Orders</h3>
              <Link href="/dashboard/orders" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--bb)', textDecoration: 'none' }}>View All →</Link>
            </div>
            {recentOrders.map((o, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', borderBottom: '1px solid var(--br)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bp)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                  📦
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '12.5px', color: 'var(--bd)' }}>{o.o}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{o.l} · {o.p}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', fontSize: '12.5px', color: 'var(--bd)' }}>{o.a}</div>
                  <span style={{ background: o.sc, color: o.tc, fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                    {o.s}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
