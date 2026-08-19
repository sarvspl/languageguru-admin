'use client';

import React, { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';
import { API_URL } from '../../../lib/env';


interface Quote {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceKey: string;
  sourceLang: string;
  targetLang: string;
  pages: number;
  isInterpreter: boolean;
  notes: string;
  status: string;
  createdAt: string;
}

const CRM_STAGES = [
  { key: 'PENDING', label: 'New Leads', color: '#fef3c7', dot: '#d97706' },
  { key: 'CONTACTED', label: 'Contacted', color: '#e0e7ff', dot: '#4f46e5' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#dbeafe', dot: '#2563eb' },
  { key: 'COMPLETED', label: 'Completed', color: '#dcfce7', dot: '#16a34a' },
  { key: 'CANCELLED', label: 'Cancelled', color: '#fee2e2', dot: '#dc2626' }
];

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

export default function LeadsCRMPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchQuotes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/quotes`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setQuotes(data.data);
      else setError(data.message || 'Failed to fetch leads');
    } catch (err) {
      setError('Cannot connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setTypeFilter(params.get('type') || '');
    }
    fetchQuotes();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      // Optimistic update
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
      
      const res = await fetch(`${API_URL}/api/v1/quotes/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err: any) {
      alert(err.message);
      fetchQuotes(); // Revert on failure
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete lead for "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/quotes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete');
      setQuotes(prev => prev.filter(q => q.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredQuotes = quotes.filter(q => {
    if (!typeFilter) return true;
    if (typeFilter === 'translation') {
      return !q.isInterpreter && !['apostille', 'attestation', 'training'].includes(q.serviceKey || '');
    }
    if (typeFilter === 'interpreter') {
      return q.isInterpreter;
    }
    if (typeFilter === 'apostille') {
      return ['apostille', 'attestation'].includes(q.serviceKey || '');
    }
    if (typeFilter === 'training') {
      return (q.serviceKey || '').includes('training');
    }
    return true;
  });

  const getTitle = () => {
    if (typeFilter === 'translation') return '📝 Translation Leads';
    if (typeFilter === 'interpreter') return '🎤 Interpreter Leads';
    if (typeFilter === 'apostille') return '📌 Apostille Leads';
    if (typeFilter === 'training') return '🎓 Training Leads';
    return '🎯 Leads / CRM Pipeline';
  };

  return (
    <>
      <TopNav title={getTitle()} />
      
      {/* Category Tabs */}
      <div style={{ padding: '0 24px', marginTop: '16px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        <button 
          onClick={() => setTypeFilter('')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--br)', background: typeFilter === '' ? 'var(--ac)' : '#fff', color: typeFilter === '' ? '#fff' : 'var(--tm)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          All Leads
        </button>
        <button 
          onClick={() => setTypeFilter('translation')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--br)', background: typeFilter === 'translation' ? 'var(--ac)' : '#fff', color: typeFilter === 'translation' ? '#fff' : 'var(--tm)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📝 Translation
        </button>
        <button 
          onClick={() => setTypeFilter('interpreter')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--br)', background: typeFilter === 'interpreter' ? 'var(--ac)' : '#fff', color: typeFilter === 'interpreter' ? '#fff' : 'var(--tm)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🎤 Interpreter
        </button>
        <button 
          onClick={() => setTypeFilter('apostille')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--br)', background: typeFilter === 'apostille' ? 'var(--ac)' : '#fff', color: typeFilter === 'apostille' ? '#fff' : 'var(--tm)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📌 Apostille
        </button>
        <button 
          onClick={() => setTypeFilter('training')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--br)', background: typeFilter === 'training' ? 'var(--ac)' : '#fff', color: typeFilter === 'training' ? '#fff' : 'var(--tm)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          🎓 Training
        </button>
      </div>
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading pipeline...</div>
        ) : (
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px', flex: 1, alignItems: 'flex-start' }}>
            {CRM_STAGES.map(stage => {
              const stageLeads = filteredQuotes.filter(q => q.status === stage.key);
              
              return (
                <div key={stage.key} style={{ minWidth: '320px', maxWidth: '320px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--br)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--br)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: '12px 12px 0 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stage.dot }}></div>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--bd)' }}>{stage.label}</h3>
                    </div>
                    <div style={{ background: stage.color, color: stage.dot, padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                      {stageLeads.length}
                    </div>
                  </div>
                  
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                    {stageLeads.map(lead => (
                      <div key={lead.id} style={{ background: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--td)' }}>{lead.name}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--mu)', whiteSpace: 'nowrap' }}>
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--tm)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span>📞</span> {lead.phone}</div>
                          {lead.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span>✉</span> {lead.email}</div>}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span>🎯</span> {formatServiceName(lead.serviceKey)}</div>
                          {(lead.sourceLang || lead.targetLang) && (
                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span>🌐</span> {lead.sourceLang || 'Any'} → {lead.targetLang || 'Any'}</div>
                          )}
                        </div>

                        <div style={{ borderTop: '1px dashed var(--br)', paddingTop: '10px', marginTop: '2px', display: 'flex', gap: '6px' }}>
                          <select 
                            value={lead.status}
                            onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                            style={{ flex: 1, padding: '4px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--br)', outline: 'none' }}
                          >
                            {CRM_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                          </select>
                          <button onClick={() => handleDelete(lead.id, lead.name)} style={{ padding: '4px 8px', fontSize: '12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {stageLeads.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--mu)', fontSize: '13px', fontStyle: 'italic' }}>
                        No leads here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
