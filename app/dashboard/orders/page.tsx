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
  status: string;
  createdAt: string;
}

interface Service {
  key: string;
  name: string;
  price: number;
}

interface Order extends Quote {
  serviceName: string;
  unitPrice: number;
  estimatedValue: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrdersAndServices = async () => {
    try {
      // Fetch Quotes (Orders)
      const quotesRes = await fetch(`${API_URL}/api/v1/quotes`, { credentials: 'include' });
      const quotesData = await quotesRes.json();
      
      if (!quotesData.success) throw new Error(quotesData.message || 'Failed to fetch orders');

      // Fetch Services (for Pricing)
      const servicesRes = await fetch(`${API_URL}/api/v1/services`, { credentials: 'include' });
      const servicesData = await servicesRes.json();
      
      if (!servicesData.success) throw new Error(servicesData.message || 'Failed to fetch services');

      const services: Service[] = servicesData.data;
      const quotes: Quote[] = quotesData.data;

      // Join data and calculate financial value
      const processedOrders: Order[] = quotes.map(quote => {
        const matchingService = services.find(s => 
          s.key === quote.serviceKey || 
          (quote.serviceKey && s.name && quote.serviceKey.toLowerCase().includes(s.name.toLowerCase())) ||
          (quote.serviceKey && s.key && quote.serviceKey.toLowerCase().includes(s.key.toLowerCase()))
        );
        
        // Default to a base price of 0 if service pricing isn't found
        const unitPrice = matchingService?.price || 0; 
        const estimatedValue = unitPrice * (quote.pages || 1);

        return {
          ...quote,
          serviceName: matchingService?.name || quote.serviceKey || 'General Translation',
          unitPrice,
          estimatedValue
        };
      });

      setOrders(processedOrders);
    } catch (err: any) {
      setError(err.message || 'Cannot connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndServices();
  }, []);

  const totalRevenue = orders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.estimatedValue, 0);

  const pendingRevenue = orders
    .filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.estimatedValue, 0);

  return (
    <>
      <TopNav title="📦 Financial Orders" />
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        
        {/* Financial Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
           <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--br)', boxShadow: 'var(--sh)' }}>
             <div style={{ color: 'var(--mu)', fontSize: '13px', fontWeight: '700' }}>Total Orders</div>
             <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--td)', marginTop: '8px' }}>{orders.length}</div>
           </div>
           <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--br)', boxShadow: 'var(--sh)', borderLeft: '4px solid #16a34a' }}>
             <div style={{ color: 'var(--mu)', fontSize: '13px', fontWeight: '700' }}>Realized Revenue (Completed)</div>
             <div style={{ fontSize: '28px', fontWeight: '800', color: '#16a34a', marginTop: '8px' }}>₹{totalRevenue.toLocaleString()}</div>
           </div>
           <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--br)', boxShadow: 'var(--sh)', borderLeft: '4px solid #2563eb' }}>
             <div style={{ color: 'var(--mu)', fontSize: '13px', fontWeight: '700' }}>Pipeline Value (Pending/In Progress)</div>
             <div style={{ fontSize: '28px', fontWeight: '800', color: '#2563eb', marginTop: '8px' }}>₹{pendingRevenue.toLocaleString()}</div>
           </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>
              Commercial Order Log
            </h2>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Calculating financial data...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Order Ref</th>
                    <th>Client</th>
                    <th>Service & Pricing</th>
                    <th>Volume</th>
                    <th>Est. Value</th>
                    <th>Fulfillment</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div style={{ fontFamily: 'monospace', color: 'var(--bd)', fontSize: '13px', fontWeight: '700' }}>
                          ORD-{order.id.substring(0, 6).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--mu)', marginTop: '4px' }}>
                           {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--td)', fontSize: '14px' }}>{order.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--tm)' }}>{order.email || order.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--bb)', fontSize: '13px' }}>
                           {order.serviceName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--mu)', marginTop: '4px' }}>
                          Base Rate: {order.unitPrice > 0 ? `₹${order.unitPrice}/page` : 'Custom Quote'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '14px', color: 'var(--td)', fontWeight: '600' }}>
                           {order.pages} {order.pages === 1 ? 'Page' : 'Pages'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '16px', color: '#16a34a', fontWeight: '800' }}>
                           {order.estimatedValue > 0 ? `₹${order.estimatedValue.toLocaleString()}` : 'TBD'}
                        </div>
                      </td>
                      <td>
                        <span className="price-badge" style={{ 
                          background: order.status === 'COMPLETED' ? '#dcfce7' : order.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7', 
                          color: order.status === 'COMPLETED' ? '#166534' : order.status === 'CANCELLED' ? '#991b1b' : '#92400e', 
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {order.status === 'COMPLETED' ? (
                          <button 
                            onClick={() => alert(`Invoice generated for ${order.name} for ₹${order.estimatedValue}`)} 
                            style={{ background: 'var(--bd)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Generate Invoice
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--mu)', fontStyle: 'italic' }}>Awaiting Delivery</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--mu)' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧾</div>
                        <div>No financial orders logged yet.</div>
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
