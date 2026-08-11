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
  status: string;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalRequests: number;
  lastRequestDate: string;
  isCompletedClient: boolean;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAndProcessClients = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/quotes`, { credentials: 'include' });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch clients');
      }

      // Aggregate quotes into unique clients
      const clientMap = new Map<string, Client>();
      
      data.data.forEach((q: Quote) => {
        const identifier = q.email || q.phone; // Group by email, fallback to phone
        if (!identifier) return;

        if (!clientMap.has(identifier)) {
          clientMap.set(identifier, {
            id: identifier,
            name: q.name,
            email: q.email || '',
            phone: q.phone || '',
            totalRequests: 1,
            lastRequestDate: q.createdAt,
            isCompletedClient: q.status === 'COMPLETED'
          });
        } else {
          const existing = clientMap.get(identifier)!;
          existing.totalRequests += 1;
          
          if (new Date(q.createdAt) > new Date(existing.lastRequestDate)) {
            existing.lastRequestDate = q.createdAt;
            existing.name = q.name; // Keep the most recent name provided
          }
          if (q.status === 'COMPLETED') {
            existing.isCompletedClient = true;
          }
        }
      });

      // Sort by most recent request
      const processedClients = Array.from(clientMap.values()).sort(
        (a, b) => new Date(b.lastRequestDate).getTime() - new Date(a.lastRequestDate).getTime()
      );

      setClients(processedClients);
    } catch (err: any) {
      setError(err.message || 'Cannot connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessClients();
  }, []);

  return (
    <>
      <TopNav title="👥 Client Database" />
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>
              Unique Clients ({clients.length})
            </h2>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Analyzing and loading client database...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Contact Info</th>
                    <th>Status</th>
                    <th>Total Requests</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--td)', fontSize: '15px' }}>{client.name}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: 'var(--tm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>✉</span> {client.email || 'N/A'}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--tm)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span>📞</span> {client.phone || 'N/A'}
                        </div>
                      </td>
                      <td>
                        {client.isCompletedClient ? (
                          <span className="price-badge" style={{ background: '#dcfce7', color: '#166534' }}>⭐ Active Client</span>
                        ) : (
                          <span className="price-badge" style={{ background: '#fef3c7', color: '#92400e' }}>🔍 Prospect</span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: '800', color: 'var(--bb)', fontSize: '16px' }}>{client.totalRequests}</div>
                      </td>
                      <td style={{ color: 'var(--mu)', fontSize: '13px' }}>
                        {new Date(client.lastRequestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--mu)' }}>No clients found in the database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
