import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, CheckCircle2, Lock, Zap, Eye, MessageSquare, AlertCircle } from 'lucide-react';

interface LandingPageProps {
  onStartFeedback: () => void;
  onCheckResponse: () => void;
  onSeeWhatChanged: () => void;
  onOpenPrivacy: () => void;
  onVerifyAccessCode: (code: string) => Promise<boolean>;
  isStaffVerified: boolean;
}

const TRUST_ITEMS = [
  { icon: Lock, label: 'No names stored' },
  { icon: Eye, label: 'No IP logged' },
  { icon: Shield, label: 'End-to-end encrypted' },
  { icon: Zap, label: 'Instant delivery' },
];


export const LandingPage: React.FC<LandingPageProps> = ({
  onStartFeedback,
  onCheckResponse,
  onSeeWhatChanged,
  onOpenPrivacy,
  onVerifyAccessCode,
  isStaffVerified,
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessSuccess, setAccessSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setIsVerifying(true);
    setAccessError(null);
    try {
      const ok = await onVerifyAccessCode(accessCode.trim());
      if (ok) {
        setAccessSuccess(true);
        setTimeout(() => {
          setIsVerifying(false);
          onStartFeedback();
        }, 300);
      } else {
        setAccessError('Invalid access code. Please check with your team lead.');
        setIsVerifying(false);
      }
    } catch (err: any) {
      setAccessError(err.message || 'Verification failed');
      setIsVerifying(false);
    }
  };

  const handleShareClick = () => {
    if (isStaffVerified || accessSuccess) {
      onStartFeedback();
    } else {
      const input = document.getElementById('staff-access-input') as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        onStartFeedback();
      }
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 120px)' }}>
      {/* Background decorations */}
      <div className="hero-bg-grid" />
      <div className="hero-bg-gradient" />
      <div className="hero-blob-1" />
      <div className="hero-blob-2" />

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '52px 20px 80px',
        textAlign: 'center',
        maxWidth: '860px',
        margin: '0 auto',
      }}>

        {/* Trust pill */}
        <div
          className="trust-pill"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
            marginBottom: '28px',
          }}
        >
          <Shield size={13} />
          Fully anonymous · Zero-knowledge design
        </div>

        {/* Hero heading */}
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(28px, 6vw, 56px)',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-1.5px',
            lineHeight: 1.15,
            marginBottom: '20px',
            maxWidth: '720px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(18px)',
            transition: 'opacity 0.55s ease 0.08s, transform 0.55s ease 0.08s',
          }}
        >
          <span style={{ display: 'block' }}>Your voice shapes</span>
          <span className="gradient-text" style={{ display: 'block' }}>how we grow.</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(15px, 2.5vw, 17.5px)',
            color: '#475569',
            maxWidth: '540px',
            lineHeight: 1.65,
            marginBottom: '36px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.55s ease 0.16s, transform 0.55s ease 0.16s',
          }}
        >
          Share an idea, raise a concern, or celebrate a win. Your name is never
          attached — only your perspective matters.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            width: '100%',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.55s ease 0.24s, transform 0.55s ease 0.24s',
          }}
        >
          <button
            id="share-feedback-btn"
            onClick={handleShareClick}
            className="btn-primary-pill"
            style={{
              fontFamily: 'var(--font-controls)',
              fontSize: '15.5px',
              padding: '14px 42px',
              minWidth: 'min(260px, 100%)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}
          >
            <span>Share feedback</span>
            <ArrowRight size={16} />
          </button>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            <button
              onClick={onCheckResponse}
              className="btn-secondary-pill"
              style={{ fontFamily: 'var(--font-controls)', fontSize: '13.5px' }}
            >
              <MessageSquare size={14} color="#64748b" />
              <span>Check a response</span>
            </button>
            <button
              onClick={onSeeWhatChanged}
              className="btn-secondary-pill"
              style={{ fontFamily: 'var(--font-controls)', fontSize: '13.5px' }}
            >
              <CheckCircle2 size={14} color="#64748b" />
              <span>See what changed</span>
            </button>
          </div>

          <button
            onClick={onOpenPrivacy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#6366f1',
              background: 'none',
              marginTop: '4px',
              fontFamily: 'var(--font-controls)',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Shield size={13} color="#6366f1" />
            <span>How your privacy is protected</span>
          </button>
        </div>

        {/* Trust feature strip */}
        <div
          style={{
            display: 'flex',
            gap: 'clamp(12px, 3vw, 24px)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '40px',
            padding: '14px 20px',
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(226,232,240,0.8)',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.55s ease 0.35s',
            fontFamily: 'var(--font-body)',
            width: '100%',
            maxWidth: '680px',
          }}
        >
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="feature-strip-item" style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px' }}>
              <div style={{
                width: 22,
                height: 22,
                borderRadius: '6px',
                background: 'rgba(79, 70, 229, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={13} color="#4f46e5" />
              </div>
              {label}
            </div>
          ))}
        </div>


        {/* Staff Access Code section */}
        <div
          style={{
            marginTop: '42px',
            width: '100%',
            maxWidth: '480px',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.55s ease 0.55s',
          }}
        >
          <div style={{
            padding: 'clamp(20px, 4vw, 28px)',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(226,232,240,0.9)',
            borderRadius: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            textAlign: 'left',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '16px',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '4px',
            }}>
              First time here?
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#64748b',
              marginBottom: '16px',
            }}>
              Enter the shared staff access code to begin.
            </p>

            <form onSubmit={handleAccessSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                id="staff-access-input"
                type="text"
                placeholder="Access code"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value)}
                style={{
                  flex: '1 1 200px',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  border: accessError
                    ? '1.5px solid #ef4444'
                    : accessSuccess
                    ? '1.5px solid #10b981'
                    : '1.5px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'var(--font-controls)',
                  color: '#0f172a',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onFocus={e => {
                  if (!accessError && !accessSuccess) {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                  }
                }}
                onBlur={e => {
                  if (!accessError && !accessSuccess) {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                  }
                }}
              />
              <button
                type="submit"
                disabled={isVerifying || accessSuccess}
                className="btn-dark"
                style={{
                  flex: '0 0 auto',
                  padding: '11px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'var(--font-controls)',
                  whiteSpace: 'nowrap',
                  opacity: isVerifying ? 0.8 : 1,
                  backgroundColor: accessSuccess ? '#10b981' : undefined,
                }}
              >
                {isVerifying
                  ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Verifying</>
                  : accessSuccess
                  ? <><CheckCircle2 size={14} /> Verified</>
                  : 'Continue'}
              </button>
            </form>

            {accessError && (
              <p style={{
                color: '#ef4444',
                fontSize: '12px',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                animation: 'fadeIn 0.2s ease',
              }}>
                <AlertCircle size={13} />
                {accessError}
              </p>
            )}

            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.8px',
                color: '#94a3b8',
                textTransform: 'uppercase',
              }}>
                Ask your lead for the current code
              </span>
              <span style={{ color: '#cbd5e1', fontSize: '10px' }}>·</span>
              <button
                type="button"
                onClick={() => setAccessCode('DCREATIVS2024')}
                style={{
                  fontSize: '11px',
                  color: '#6366f1',
                  background: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Try: DCREATIVS2024
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
