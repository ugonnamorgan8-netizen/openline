import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, CheckCircle2, Lock, Zap, Eye } from 'lucide-react';

interface LandingPageProps {
  onStartFeedback: () => void;
  onSeeWhatChanged: () => void;
  onOpenPrivacy: () => void;
}

const TRUST_ITEMS = [
  { icon: Lock, label: 'No names stored' },
  { icon: Eye, label: 'No IP logged' },
  { icon: Shield, label: 'End-to-end encrypted' },
  { icon: Zap, label: 'Instant delivery' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartFeedback,
  onSeeWhatChanged,
  onOpenPrivacy,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

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
            gap: '16px',
            width: '100%',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.55s ease 0.24s, transform 0.55s ease 0.24s',
          }}
        >
          <button
            id="share-feedback-btn"
            onClick={onStartFeedback}
            className="btn-primary-pill"
            style={{
              fontFamily: 'var(--font-controls)',
              fontSize: '15.5px',
              padding: '14px 44px',
              minWidth: 'min(260px, 100%)',
              animation: 'pulse-glow 3s ease-in-out infinite',
              cursor: 'pointer',
            }}
          >
            <span>Share feedback</span>
            <ArrowRight size={16} />
          </button>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            <button
              onClick={onSeeWhatChanged}
              className="btn-secondary-pill"
              style={{ fontFamily: 'var(--font-controls)', fontSize: '13.5px', cursor: 'pointer' }}
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
              border: 'none',
              marginTop: '4px',
              fontFamily: 'var(--font-controls)',
              transition: 'opacity 0.15s ease',
              cursor: 'pointer',
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
            marginTop: '48px',
            padding: '16px 24px',
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
      </div>

      {/* Page Footer */}
      <footer style={{
        marginTop: '40px',
        padding: '32px 20px',
        textAlign: 'center',
        borderTop: '1px solid rgba(226, 232, 240, 0.7)',
        fontSize: '12.5px',
        color: '#94a3b8',
        fontFamily: 'var(--font-body)',
      }}>
        © 2026 D’Creativs OpenLine • A product of D’Creativs. Professional. Anonymous. Trustworthy.
      </footer>
    </div>
  );
};
