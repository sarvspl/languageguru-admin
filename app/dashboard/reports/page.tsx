'use client';

import React, { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/dashboard/stats?filter=${filter}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <>
      <TopNav title="📊 Business Reports & Analytics" />
      
      <div className="adm-cnt" style={{ padding: '32px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--bd)', marginBottom: '8px' }}>Performance Overview</h2>
            <p style={{ color: 'var(--mu)', fontSize: '14px' }}>Real-time metrics and financial data for your agency.</p>
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--br)', outline: 'none', background: '#fff', fontSize: '14px', fontWeight: '700', color: 'var(--bd)', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
          >
            <option value="all">All Time</option>
            <option value="yearly">Last 1 Year</option>
            <option value="monthly">Last 30 Days</option>
            <option value="weekly">Last 7 Days</option>
            <option value="daily">Today (Last 24h)</option>
          </select>
        </div>

        {/* 4-Column Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid var(--br)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ background: '#dcfce7', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>💰</div>
              {filter !== 'all' && <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>Filtered</span>}
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--bd)', fontFamily: "'Lora', serif", marginBottom: '4px' }}>
              ₹{stats?.revenue?.toLocaleString() || '0'}
            </div>
            <div style={{ color: 'var(--mu)', fontSize: '14px', fontWeight: '600' }}>Total Revenue</div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid var(--br)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ background: '#f3f4f6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>✅</div>
              <span style={{ background: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>Orders</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--bd)', fontFamily: "'Lora', serif", marginBottom: '4px' }}>
              {stats?.completedOrders || '0'}
            </div>
            <div style={{ color: 'var(--mu)', fontSize: '14px', fontWeight: '600' }}>Completed Deliveries</div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid var(--br)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ background: '#dbeafe', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎯</div>
              <span style={{ background: '#dbeafe', color: '#1e3a8a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>Quotes</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--bd)', fontFamily: "'Lora', serif", marginBottom: '4px' }}>
              {stats?.totalQuotes || '0'}
            </div>
            <div style={{ color: 'var(--mu)', fontSize: '14px', fontWeight: '600' }}>Total Quotes Generated</div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid var(--br)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ background: '#fef3c7', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>⏳</div>
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>Action</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--bd)', fontFamily: "'Lora', serif", marginBottom: '4px' }}>
              {stats?.pendingQuotes || '0'}
            </div>
            <div style={{ color: 'var(--mu)', fontSize: '14px', fontWeight: '600' }}>Leads Requiring Action</div>
          </div>

        </div>

        {/* Analytics Chart */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--br)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '32px', marginBottom: '40px', overflowX: 'auto', position: 'relative' }}>
           
           {loading && (
             <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ fontWeight: '700', color: 'var(--bd)' }}>Loading...</span>
             </div>
           )}

           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', minWidth: '600px' }}>
             <div>
               <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--bd)' }}>Revenue Growth</h3>
               <p style={{ fontSize: '13px', color: 'var(--mu)', marginTop: '4px' }}>Revenue breakdown based on selected filter</p>
             </div>
           </div>
           
           <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', paddingBottom: '24px', borderBottom: '1px solid var(--br)', position: 'relative', minWidth: '600px' }}>
             {(() => {
               const chartValues = stats?.chartValues || new Array(12).fill(0);
               const chartLabels = stats?.chartLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
               const maxVal = Math.max(...chartValues, 1);
               
               return chartValues.map((val: number, i: number) => {
                 const heightPercent = Math.max((val / maxVal) * 100, 2); // Minimum 2% height so empty months still show a sliver
                 return (
                   <div 
                     key={i} 
                     style={{ 
                       flex: 1, 
                       background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)', 
                       height: `${heightPercent}%`, 
                       borderRadius: '6px 6px 0 0', 
                       opacity: '1', 
                       transition: 'all 0.3s', 
                       cursor: 'pointer' 
                     }} 
                     title={`Period: ${chartLabels[i]}\nRevenue: ₹${val.toLocaleString()}`} 
                   />
                 );
               });
             })()}
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', color: 'var(--mu)', fontSize: '12px', fontWeight: '600', minWidth: '600px' }}>
             {(stats?.chartLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']).map((lbl: string, i: number) => (
               <span key={i} style={{ flex: 1, textAlign: 'center' }}>{lbl}</span>
             ))}
           </div>
        </div>
      </div>
    </>
  );
}
