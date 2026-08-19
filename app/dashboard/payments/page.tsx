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
  status: string;
  pages: number;
  createdAt: string;
}

interface Service {
  key: string;
  name: string;
  price: number;
}

interface Invoice extends Quote {
  serviceName: string;
  amountDue: number;
  isPaid: boolean;
}

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPaymentsData = async () => {
    try {
      // Fetch Quotes (Orders)
      const quotesRes = await fetch(`${API_URL}/api/v1/quotes`, { credentials: 'include' });
      const quotesData = await quotesRes.json();
      
      if (!quotesData.success) throw new Error(quotesData.message || 'Failed to fetch data');

      // Fetch Services (for Pricing)
      const servicesRes = await fetch(`${API_URL}/api/v1/services`, { credentials: 'include' });
      const servicesData = await servicesRes.json();
      
      if (!servicesData.success) throw new Error(servicesData.message || 'Failed to fetch services');

      const services: Service[] = servicesData.data;
      const quotes: Quote[] = quotesData.data;

      // Filter only COMPLETED orders for the Invoicing ledger
      const completedOrders = quotes.filter(q => q.status === 'COMPLETED');

      const processedInvoices: Invoice[] = completedOrders.map(quote => {
        const matchingService = services.find(s => 
          s.key === quote.serviceKey || 
          (quote.serviceKey && s.name && quote.serviceKey.toLowerCase().includes(s.name.toLowerCase())) ||
          (quote.serviceKey && s.key && quote.serviceKey.toLowerCase().includes(s.key.toLowerCase()))
        );
        
        const unitPrice = matchingService?.price || 0; 
        const amountDue = unitPrice * (quote.pages || 1);

        return {
          ...quote,
          serviceName: matchingService?.name || quote.serviceKey || 'General Translation',
          amountDue,
          isPaid: false // Default UI state (since we lack a payment DB table)
        };
      });

      setInvoices(processedInvoices);
    } catch (err: any) {
      setError(err.message || 'Cannot connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const handleMarkPaid = (id: string) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, isPaid: true } : inv));
  };

  const totalReceivables = invoices
    .filter(i => !i.isPaid)
    .reduce((sum, i) => sum + i.amountDue, 0);

  const totalCollected = invoices
    .filter(i => i.isPaid)
    .reduce((sum, i) => sum + i.amountDue, 0);

  return (
    <>
      <style>{`
        .btn-mark-paid {
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
        }
        .btn-mark-paid:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
        }
        .btn-mark-paid:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
        }
        .btn-undo {
          background: #f1f5f9;
          color: var(--mu);
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-undo:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
      `}</style>
      <TopNav title="💳 Payments & Invoicing" />
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        
        {/* Financial Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
           <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--br)', boxShadow: 'var(--sh)', borderLeft: '4px solid #f59e0b' }}>
             <div style={{ color: 'var(--mu)', fontSize: '13px', fontWeight: '700' }}>Total Receivables (Pending)</div>
             <div style={{ fontSize: '28px', fontWeight: '800', color: '#b45309', marginTop: '8px' }}>₹{totalReceivables.toLocaleString()}</div>
           </div>
           <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--br)', boxShadow: 'var(--sh)', borderLeft: '4px solid #16a34a' }}>
             <div style={{ color: 'var(--mu)', fontSize: '13px', fontWeight: '700' }}>Total Collected (Paid)</div>
             <div style={{ fontSize: '28px', fontWeight: '800', color: '#16a34a', marginTop: '8px' }}>₹{totalCollected.toLocaleString()}</div>
           </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>
              Accounts Receivable ({invoices.length})
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--mu)', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
              ℹ️ Only "Completed" orders appear here for invoicing.
            </div>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Compiling financial ledger...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Billed To</th>
                    <th>Service Provided</th>
                    <th>Amount Due</th>
                    <th>Payment Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} style={{ opacity: invoice.isPaid ? 0.6 : 1 }}>
                      <td>
                        <div style={{ fontFamily: 'monospace', color: 'var(--bd)', fontSize: '13px', fontWeight: '700' }}>
                          INV-{invoice.id.substring(0, 6).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--mu)', marginTop: '4px' }}>
                           Issued: {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--td)', fontSize: '14px' }}>{invoice.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--tm)' }}>{invoice.email || invoice.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--td)', fontSize: '13px' }}>
                           {invoice.serviceName}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '16px', color: 'var(--bd)', fontWeight: '800' }}>
                           {invoice.amountDue > 0 ? `₹${invoice.amountDue.toLocaleString()}` : 'TBD'}
                        </div>
                      </td>
                      <td>
                        {invoice.isPaid ? (
                          <span className="price-badge" style={{ background: '#dcfce7', color: '#166534' }}>✅ Paid</span>
                        ) : (
                          <span className="price-badge" style={{ background: '#fef3c7', color: '#92400e' }}>⏳ Pending</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {!invoice.isPaid ? (
                          <button 
                            onClick={() => handleMarkPaid(invoice.id)} 
                            className="btn-mark-paid"
                          >
                            Mark as Paid
                          </button>
                        ) : (
                          <>
                            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>Cleared</span>
                            <button 
                              onClick={() => setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, isPaid: false } : inv))} 
                              className="btn-undo"
                              title="Revert to Unpaid"
                            >
                              Undo
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--mu)' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                        <div>No pending invoices.</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>Complete an order in the Projects dashboard to generate an invoice.</div>
                      </td>
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
