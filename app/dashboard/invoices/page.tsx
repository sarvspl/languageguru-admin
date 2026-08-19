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
  sourceLang?: string;
  targetLang?: string;
  createdAt: string;
}

interface Service {
  key: string;
  name: string;
  price: number;
}

interface Invoice extends Quote {
  serviceName: string;
  unitPrice: number;
  amountDue: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoicesData = async () => {
    try {
      const quotesRes = await fetch(`${API_URL}/api/v1/quotes`, { credentials: 'include' });
      const quotesData = await quotesRes.json();
      if (!quotesData.success) throw new Error(quotesData.message || 'Failed to fetch data');

      const servicesRes = await fetch(`${API_URL}/api/v1/services`, { credentials: 'include' });
      const servicesData = await servicesRes.json();
      if (!servicesData.success) throw new Error(servicesData.message || 'Failed to fetch services');

      const services: Service[] = servicesData.data;
      const quotes: Quote[] = quotesData.data;

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
          unitPrice,
          amountDue
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
    fetchInvoicesData();
  }, []);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element || !selectedInvoice) return;
    
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_INV-${selectedInvoice.id.substring(0, 6).toUpperCase()}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      // Fallback
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body {
            background-color: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide navigation and sidebars */
          .no-print, .adm-sb, .adm-nav-area, .invoice-list-container {
            display: none !important;
          }
          /* Reset modal positioning to allow multi-page printing */
          .invoice-modal-overlay {
            position: relative !important;
            background: #fff !important;
            padding: 0 !important;
            display: block !important;
          }
          .invoice-modal-content {
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            border: none !important;
          }
          #printable-invoice {
            width: 100% !important;
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>

      <div className="no-print">
        <TopNav title="🧾 Invoice Vault" />
      </div>
      
      <div className="adm-cnt invoice-list-container" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>
              Generated Invoices ({invoices.length})
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--mu)', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
              ℹ️ Click "View Document" to print or save as PDF.
            </div>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Accessing invoice vault...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Invoice No.</th>
                    <th>Client</th>
                    <th>Issue Date</th>
                    <th>Total Amount</th>
                    <th style={{ textAlign: 'right' }}>Document</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <div style={{ fontFamily: 'monospace', color: 'var(--bd)', fontSize: '14px', fontWeight: '700' }}>
                          INV-{invoice.id.substring(0, 6).toUpperCase()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--td)', fontSize: '14px' }}>{invoice.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--tm)' }}>{invoice.email || invoice.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: 'var(--td)' }}>
                           {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '15px', color: '#16a34a', fontWeight: '800' }}>
                           {invoice.amountDue > 0 ? `₹${invoice.amountDue.toLocaleString()}` : 'TBD'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => setSelectedInvoice(invoice)} 
                          style={{ background: '#fff', color: '#2563eb', border: '1px solid #2563eb', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}
                        >
                          📄 View Document
                        </button>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--mu)' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗄️</div>
                        <div>No invoices generated.</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>Complete an order to automatically generate its invoice.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Document Modal */}
      {selectedInvoice && (
        <div className="invoice-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '40px 20px', overflowY: 'auto' }}>
          
          <div className="invoice-modal-content" style={{ background: '#fff', borderRadius: '12px', width: '800px', maxWidth: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Header */}
            <div className="no-print" style={{ padding: '16px 24px', borderBottom: '1px solid var(--br)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--bd)' }}>Invoice Preview</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  style={{ background: 'var(--ac)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: isDownloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', opacity: isDownloading ? 0.7 : 1 }}
                >
                  {isDownloading ? '⏳ Generating PDF...' : '📥 Download PDF'}
                </button>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* The Actual Printable Invoice */}
            <div style={{ background: '#e5e7eb', padding: '40px 20px', display: 'flex', justifyContent: 'center' }} className="no-print-bg">
            <div id="printable-invoice" style={{ width: '210mm', minHeight: '297mm', padding: '40px 50px', background: '#fff', color: '#1f2937', position: 'relative', boxSizing: 'border-box', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              
              {/* Watermark */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none', zIndex: 0 }}>
                <img src="/logo.jpg" alt="Watermark" style={{ width: '500px', height: 'auto', filter: 'grayscale(100%)' }} />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid var(--bd)', paddingBottom: '24px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src="/logo.jpg" alt="Language Guru Logo" style={{ width: '85px', height: '85px', objectFit: 'contain', borderRadius: '8px' }} />
                    <div>
                      <h1 style={{ fontFamily: "'Lora', serif", fontSize: '28px', fontWeight: '800', color: 'var(--bd)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>Language Guru</h1>
                      <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                        <strong>617, West End Mall</strong><br />
                        Janakpuri, New Delhi – 110058<br />
                        📞 +91-9312690490<br />
                        ✉️ info@languageguruindia.com
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#e2e8f0', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '4px' }}>INVOICE</h2>
                    <table style={{ borderCollapse: 'collapse', float: 'right' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '4px 12px', textAlign: 'right', fontWeight: '700', color: '#4b5563', fontSize: '13px' }}>Invoice No:</td>
                          <td style={{ padding: '4px 12px', textAlign: 'left', fontWeight: '800', color: '#111827', fontSize: '14px', background: '#f8fafc', borderRadius: '4px' }}>INV-{selectedInvoice.id.substring(0, 6).toUpperCase()}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 12px', textAlign: 'right', fontWeight: '700', color: '#4b5563', fontSize: '13px' }}>Date:</td>
                          <td style={{ padding: '4px 12px', textAlign: 'left', fontWeight: '600', color: '#111827', fontSize: '13px' }}>{new Date(selectedInvoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 12px', textAlign: 'right', fontWeight: '700', color: '#4b5563', fontSize: '13px' }}>Due Date:</td>
                          <td style={{ padding: '4px 12px', textAlign: 'left', fontWeight: '600', color: '#111827', fontSize: '13px' }}>Upon Receipt</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bill To Section */}
                <div style={{ marginBottom: '40px', background: '#f8fafc', padding: '16px 20px', borderRadius: '8px', borderLeft: '4px solid var(--bd)', width: 'fit-content', minWidth: '250px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0' }}>Billed To</h3>
                  <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: '800', marginBottom: '4px' }}>{selectedInvoice.name}</div>
                  <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                    {selectedInvoice.email && <div>✉️ {selectedInvoice.email}</div>}
                    {selectedInvoice.phone && <div>📞 {selectedInvoice.phone}</div>}
                  </div>
                </div>

                {/* Invoice Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px', border: '1px solid #e2e8f0' }}>
                  <thead>
                    <tr style={{ background: 'var(--bd)', color: '#fff' }}>
                      <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Volume (Pages)</th>
                      <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit Price</th>
                      <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '20px 16px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px', marginBottom: '4px' }}>{selectedInvoice.serviceName}</div>
                        {(selectedInvoice.sourceLang || selectedInvoice.targetLang) && (
                          <div style={{ fontSize: '13px', color: '#64748b' }}>
                            <span style={{ fontWeight: '600' }}>Language Pair:</span> {selectedInvoice.sourceLang || 'General'} → {selectedInvoice.targetLang || 'General'}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '20px 16px', textAlign: 'center', color: '#334155', fontSize: '14px', fontWeight: '600' }}>
                        {selectedInvoice.pages}
                      </td>
                      <td style={{ padding: '20px 16px', textAlign: 'right', color: '#334155', fontSize: '14px' }}>
                        ₹{selectedInvoice.unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '20px 16px', textAlign: 'right', color: '#0f172a', fontWeight: '800', fontSize: '15px' }}>
                        ₹{selectedInvoice.amountDue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals Section */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                  <div style={{ width: '320px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', color: '#475569', fontSize: '14px', fontWeight: '600' }}>
                      <span>Subtotal:</span>
                      <span>₹{selectedInvoice.amountDue.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', color: '#475569', fontSize: '14px', fontWeight: '600', borderBottom: '2px solid #cbd5e1' }}>
                      <span>Tax (0%):</span>
                      <span>₹0</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', color: 'var(--bd)', fontSize: '22px', fontWeight: '900' }}>
                      <span>Total Due:</span>
                      <span>₹{selectedInvoice.amountDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Footer / Terms */}
                <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: '#64748b', fontSize: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontWeight: '800', color: '#334155', fontSize: '13px' }}>Payment Terms & Conditions</h4>
                    <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.6' }}>
                      <li>Payment is due within 15 days of invoice date.</li>
                      <li>Please mention the Invoice No. when making a transfer.</li>
                      <li>This is a computer generated invoice and does not require a physical signature.</li>
                    </ul>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: '700', color: '#cbd5e1', fontSize: '14px', letterSpacing: '1px' }}>
                    THANK YOU FOR YOUR BUSINESS
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
