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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/quotes`, { credentials: 'include' });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch projects');
      }

      // A 'Project' is defined as a QuoteRequest that has moved past the lead stage
      // and is actively being worked on (IN_PROGRESS) or is finished (COMPLETED).
      const activeProjects = data.data.filter(
        (q: Quote) => q.status === 'IN_PROGRESS' || q.status === 'COMPLETED'
      );
      
      setProjects(activeProjects);
    } catch (err: any) {
      setError(err.message || 'Cannot connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      // Optimistic update
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      
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
      fetchProjects(); // Revert on failure
    }
  };

  return (
    <>
      <TopNav title="📁 Active Projects" />
      
      <div className="adm-cnt" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: 'var(--sh)', border: '1px solid var(--br)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '20px', fontWeight: '700', color: 'var(--bd)' }}>
              Project Dashboard ({projects.length})
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--mu)', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
              ℹ️ Leads moved to "In Progress" or "Completed" appear here automatically.
            </div>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mu)' }}>Loading projects...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Project ID</th>
                    <th>Client</th>
                    <th>Service Scope</th>
                    <th>Volume</th>
                    <th>Project Status</th>
                    <th style={{ textAlign: 'right' }}>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div style={{ fontFamily: 'monospace', color: 'var(--mu)', fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                          PRJ-{project.id.substring(0, 6).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--mu)', marginTop: '4px' }}>
                           Started: {new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--td)', fontSize: '14px' }}>{project.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--tm)' }}>{project.email || project.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--bb)', fontSize: '13px' }}>
                           {project.serviceKey || 'General Translation'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--tm)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <span>🌐</span> {project.sourceLang || 'Any'} ➞ {project.targetLang || 'Any'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: 'var(--td)', fontWeight: '600' }}>
                           {project.pages} {project.pages === 1 ? 'Page' : 'Pages'}
                        </div>
                        {project.isInterpreter && (
                           <div style={{ fontSize: '11px', color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                             Interpreter Req.
                           </div>
                        )}
                      </td>
                      <td>
                        {project.status === 'COMPLETED' ? (
                          <span className="price-badge" style={{ background: '#dcfce7', color: '#166534' }}>⭐ Delivered</span>
                        ) : (
                          <span className="price-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>⏳ In Progress</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {project.status === 'IN_PROGRESS' ? (
                          <button 
                            onClick={() => handleUpdateStatus(project.id, 'COMPLETED')} 
                            style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Mark Delivered
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(project.id, 'IN_PROGRESS')} 
                            style={{ background: '#f1f5f9', color: 'var(--mu)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Reopen Project
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--mu)' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📂</div>
                        <div>No active projects yet.</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>Move a lead to "In Progress" in the CRM to start a project.</div>
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
