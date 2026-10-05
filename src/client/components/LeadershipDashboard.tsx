import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, BarChart2, Eye, AlertTriangle } from 'lucide-react';
import { getLeadershipMetrics, getPublicUpdates } from '../api.js';

interface LeadershipDashboardProps {
  reviewer: any;
  onBack: () => void;
  onNavigateUpdatesBoard: () => void;
}

export const LeadershipDashboard: React.FC<LeadershipDashboardProps> = ({
  reviewer,
  onBack,
  onNavigateUpdatesBoard,
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mRes, uRes] = await Promise.all([
        getLeadershipMetrics(),
        getPublicUpdates(),
      ]);
      setMetrics(mRes);
      setUpdates(uRes.updates || []);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px clamp(16px, 4vw, 40px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            aria-label="Back"
            style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: '#0f172a' }}>
              Leadership Insights & Reporting
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#64748b' }}>
              Viewing as: {reviewer.name} ({reviewer.title}) • Executive Board & Leadership
            </p>
          </div>
        </div>

        <button onClick={onNavigateUpdatesBoard} className="btn-secondary-pill" style={{ fontFamily: 'var(--font-controls)', fontSize: '13px' }}>
          Open "You Said, We Did" Board
        </button>
      </div>

      {/* Governance & Privacy Notice */}
      <div style={{
        backgroundColor: '#eef2ff',
        border: '1px solid #c7d2fe',
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '28px',
      }}>
        <Shield size={22} color="#4f46e5" style={{ flexShrink: 0 }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#3730a3', lineHeight: 1.5 }}>
          <strong>Small Team Privacy Safeguard:</strong> CEO, COO, and Board titles do not grant automatic access to private unredacted reports.
          To protect confidentiality across D'Creativs, exact timestamps, submitter identities, and aggregate categories with fewer than {metrics?.min_threshold || 5} responses are suppressed.
        </p>
      </div>

      {/* Aggregated Trends */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px', marginBottom: '36px' }}>
          {/* Category Distribution */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="#4f46e5" />
              Category Activity (Broad Trends)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {metrics.category_breakdown?.map((cat: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>{cat.category}</span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: cat.is_suppressed ? '#94a3b8' : '#0f172a',
                    fontStyle: cat.is_suppressed ? 'italic' : 'normal'
                  }}>
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} color="#059669" />
              Resolution Pipeline
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {metrics.status_breakdown?.map((st: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>{st.status}</span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: st.is_suppressed ? '#94a3b8' : '#0f172a',
                    fontStyle: st.is_suppressed ? 'italic' : 'normal'
                  }}>
                    {st.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Approved Summaries Preview */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
          Approved Public Summaries ({updates.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {updates.map((u) => (
            <div key={u.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className={`badge ${u.status === 'COMPLETED' ? 'badge-completed' : 'badge-in-progress'}`}>{u.status}</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{u.published_date}</span>
              </div>
              <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#1e293b', marginBottom: '10px' }}>"{u.staff_perspective}"</p>
              <p style={{ fontSize: '12.5px', color: '#64748b' }}>{u.our_response}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
