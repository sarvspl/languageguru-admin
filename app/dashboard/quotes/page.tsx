'use client';

import React, { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected quote for detail modal
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const fetchQuotes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/quotes`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setQuotes(data.data);
      else setError(data.message || 'Failed to fetch quotes');
    } catch (err) {
      setError('Cannot connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/quotes/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update status');

      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote({ ...selectedQuote, status: newStatus });
      }

      fetchQuotes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete quote request from "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/quotes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete');

      if (selectedQuote?.id === id) setSelectedQuote(null);
      fetchQuotes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <TopNav title="💬 Customer Quotations" />
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>
              Quote Requests ({quotes.length})
            </h2>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading from API...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Service / Pair</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr key={quote.id}>
                      <td style={{ color: 'var(--tm)', fontSize: '13px' }}>{new Date(quote.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--td)' }}>{quote.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--mu)' }}>{quote.email} · {quote.phone || 'No Phone'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--bd)' }}>{quote.serviceKey || 'Translation'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--mu)' }}>{quote.sourceLang || 'EN'} → {quote.targetLang || 'DE'}</div>
                      </td>
                      <td>
                        <span className="price-badge" style={{ 
                          background: quote.status === 'PENDING' ? '#fef3c7' : quote.status === 'COMPLETED' ? '#dcfce7' : '#dbeafe', 
                          color: quote.status === 'PENDING' ? '#92400e' : quote.status === 'COMPLETED' ? '#166534' : '#1e40af', 
                        }}>
                          {quote.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => setSelectedQuote(quote)} style={{ background: 'none', border: 'none', color: 'var(--bb)', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Details</button>
                        {quote.status !== 'COMPLETED' && (
                          <button onClick={() => handleUpdateStatus(quote.id, 'COMPLETED')} style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: '700', cursor: 'pointer', marginRight: '12px' }}>Mark Done</button>
                        )}
                        <button onClick={() => handleDelete(quote.id, quote.name)} style={{ background: 'none', border: 'none', color: 'var(--rd)', fontWeight: '700', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {quotes.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--mu)' }}>No quotes found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedQuote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: '18px', fontWeight: '700', color: 'var(--bd)' }}>
                Quote Details
              </h3>
              <button onClick={() => setSelectedQuote(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
              <div><strong>Name:</strong> {selectedQuote.name}</div>
              <div><strong>Email:</strong> {selectedQuote.email}</div>
              <div><strong>Phone:</strong> {selectedQuote.phone || 'N/A'}</div>
              <div><strong>Status:</strong> {selectedQuote.status}</div>
              <div><strong>Service:</strong> {selectedQuote.serviceKey || 'Translation'}</div>
              <div><strong>Languages:</strong> {selectedQuote.sourceLang || 'EN'} → {selectedQuote.targetLang || 'DE'}</div>
              <div><strong>Pages:</strong> {selectedQuote.pages || 1}</div>
              <div><strong>Interpreter:</strong> {selectedQuote.isInterpreter ? 'Yes' : 'No'}</div>
            </div>

            {selectedQuote.notes && (
              <div style={{ marginBottom: '16px', background: '#f9fafb', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
                <strong>Customer Notes:</strong>
                <p style={{ marginTop: '4px', color: '#4b5563' }}>{selectedQuote.notes}</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--br)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleUpdateStatus(selectedQuote.id, 'PENDING')} style={{ padding: '6px 12px', fontSize: '12px', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Set Pending</button>
                <button onClick={() => handleUpdateStatus(selectedQuote.id, 'IN_PROGRESS')} style={{ padding: '6px 12px', fontSize: '12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Set In Progress</button>
                <button onClick={() => handleUpdateStatus(selectedQuote.id, 'COMPLETED')} style={{ padding: '6px 12px', fontSize: '12px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Set Completed</button>
              </div>
              <button onClick={() => setSelectedQuote(null)} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
