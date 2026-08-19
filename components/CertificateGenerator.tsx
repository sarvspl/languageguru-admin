'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CertificateGenerator() {
  const [name, setName] = useState('John Doe');
  const [docType, setDocType] = useState('Marriage Certificate');
  const [certDate, setCertDate] = useState(new Date().toISOString().split('T')[0]);

  const handleDownload = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('cert-template');
      
      const opt = {
        margin:       0.5,
        filename:     `LanguageGuru_Certificate_${name.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };
      
      html2pdf().set(opt).from(element).save();
    } catch(e) {
      console.error("PDF generation failed:", e);
      alert("Could not generate PDF. Please try again.");
    }
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
        {/* Controls */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#334155' }}>Customize Fields</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#475569' }}>Customer Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#475569' }}>Document Type</label>
            <input 
              type="text" 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#475569' }}>Date</label>
            <input 
              type="date" 
              value={certDate}
              onChange={(e) => setCertDate(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <button 
            onClick={handleDownload}
            style={{ width: '100%', padding: '14px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            📄 Download Certificate as PDF
          </button>
        </div>

        {/* Live Preview Pane */}
        <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '12px', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
          
          {/* A4 Paper Container for html2pdf */}
          <div 
            id="cert-template" 
            style={{ 
              background: '#fff', 
              width: '100%', 
              maxWidth: '816px', // 8.5in at 96dpi
              aspectRatio: '8.5/11',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
              padding: '60px',
              position: 'relative',
              boxSizing: 'border-box',
              fontFamily: 'serif',
              color: '#333',
              border: '10px solid #e2e8f0', // decorative border
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '42px', color: '#1e7fc5', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '2px' }}>Language Guru</h1>
              <h2 style={{ fontSize: '24px', color: '#64748b', margin: 0, fontWeight: 400 }}>ISO 17100:2015 Certified Translation Agency</h2>
            </div>
            
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <h1 style={{ fontSize: '48px', color: '#0f172a', margin: '0 0 30px', fontFamily: '"Georgia", serif' }}>Certificate of Accuracy</h1>
              
              <p style={{ fontSize: '18px', lineHeight: '1.8', margin: '0 0 20px', color: '#475569' }}>
                This is to certify that the translation of the document titled
              </p>
              
              <h2 style={{ fontSize: '28px', color: '#1e7fc5', margin: '0 0 20px', fontStyle: 'italic' }}>
                "{docType || 'Document'}"
              </h2>

              <p style={{ fontSize: '18px', lineHeight: '1.8', margin: '0 0 20px', color: '#475569' }}>
                belonging to <strong>{name || 'Customer'}</strong> has been completed by professional translators.
              </p>

              <p style={{ fontSize: '18px', lineHeight: '1.8', margin: 0, color: '#475569' }}>
                We certify that the translation is a true and accurate rendering of the original document provided to us, to the best of our knowledge, ability, and belief.
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
              <div style={{ textAlign: 'center', borderTop: '2px solid #cbd5e1', paddingTop: '10px', width: '250px' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Date</p>
                <p style={{ margin: '5px 0 0', color: '#64748b' }}>{certDate ? new Date(certDate).toLocaleDateString() : 'Date'}</p>
              </div>

              <div style={{ textAlign: 'center', borderTop: '2px solid #cbd5e1', paddingTop: '10px', width: '250px' }}>
                <div style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '32px', color: '#1e7fc5', marginBottom: '-10px', position: 'relative', top: '-40px' }}>Language Guru</div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Authorized Signature</p>
                <p style={{ margin: '5px 0 0', color: '#64748b' }}>Language Guru Translators</p>
              </div>
            </div>
            
            {/* Stamp/Seal placeholder */}
            <div style={{ 
              position: 'absolute', 
              bottom: '80px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              border: '4px solid rgba(30, 127, 197, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <p style={{ textAlign: 'center', margin: 0, color: 'rgba(30, 127, 197, 0.4)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px', transform: 'rotate(-15deg)' }}>Certified<br/>Translation</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
