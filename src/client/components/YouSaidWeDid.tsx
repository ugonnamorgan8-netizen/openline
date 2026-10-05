import React from 'react';
import { ArrowLeft, Sparkles, Check, Clock } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface YouSaidWeDidProps {
  updates: any[];
  onBack: () => void;
}

export const YouSaidWeDid: React.FC<YouSaidWeDidProps> = ({ updates, onBack }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fcfdfd', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px clamp(16px, 4vw, 40px)',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
      }}>
        <BrandLogo variant="dark" onClick={onBack} />

        <button
          onClick={onBack}
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            fontFamily: 'var(--font-controls)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* Main Container */}
      <div style={{
        maxWidth: '960px',
        width: '100%',
        margin: '0 auto',
        padding: '20px clamp(16px, 3vw, 24px) 80px',
        flex: 1,
      }}>
        {/* Title & Subtitle matching Page 7 */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-1px',
            marginBottom: '12px',
          }}>
            You Said, We Did.
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15.5px',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.55,
          }}>
            Transparency is our priority. See how your collective feedback is driving real change across D'Creativs.
          </p>
        </div>

        {/* 2x2 Grid matching Page 7 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '20px',
          marginBottom: '56px',
        }}>
          {updates.map((item) => {
            const isCompleted = item.status === 'COMPLETED';

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '28px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Top Status & Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span className={`badge ${isCompleted ? 'badge-completed' : 'badge-in-progress'}`} style={{ fontSize: '10.5px', padding: '4px 10px' }}>
                      {item.status}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', color: '#94a3b8', textTransform: 'uppercase' }}>
                      {item.published_date || item.published_at}
                    </span>
                  </div>

                  {/* Staff Perspective */}
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.8px',
                      color: '#4f46e5',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}>
                      STAFF PERSPECTIVE
                    </p>
                    <p style={{
                      fontSize: '14.5px',
                      color: '#1e293b',
                      fontStyle: 'italic',
                      lineHeight: 1.5,
                    }}>
                      "{item.staff_perspective}"
                    </p>
                  </div>

                  {/* Our Response */}
                  <div>
                    <p style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.8px',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}>
                      OUR RESPONSE
                    </p>
                    <p style={{
                      fontSize: '13.5px',
                      color: '#475569',
                      lineHeight: 1.6,
                    }}>
                      {item.our_response}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* More coming soon card matching Page 7 */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: '20px',
              padding: '36px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              minHeight: '260px',
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#f1f5f9',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              More coming soon
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              We review and action feedback every week.
            </p>
          </div>
        </div>
      </div>

      {/* Footer matching Page 7 */}
      <div style={{
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid #e2e8f0',
        fontSize: '12px',
        color: '#94a3b8',
      }}>
        © 2024 D’Creativs OpenLine. Accountability through transparency.
      </div>
    </div>
  );
};
