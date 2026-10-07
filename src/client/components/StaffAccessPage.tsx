import React, { useState } from 'react';
import { ArrowLeft, Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo.js';

interface StaffAccessPageProps {
  onBack: () => void;
  onVerified: () => void;
  onVerifyAccessCode: (code: string) => Promise<boolean>;
}

export const StaffAccessPage: React.FC<StaffAccessPageProps> = ({
  onBack,
  onVerified,
  onVerifyAccessCode,
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessSuccess, setAccessSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim() || isVerifying || accessSuccess) return;

    setIsVerifying(true);
    setAccessError(null);

    try {
      const ok = await onVerifyAccessCode(accessCode.trim());
      if (ok) {
        setAccessSuccess(true);
        setTimeout(() => {
          setIsVerifying(false);
          onVerified();
        }, 350);
      } else {
        setAccessError('Invalid access code. Please check with your team lead or HR.');
        setIsVerifying(false);
      }
    } catch (err: any) {
      setAccessError(err.message || 'Verification failed. Please try again.');
      setIsVerifying(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px clamp(16px, 4vw, 24px)',
      backgroundColor: '#f8fafc',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorations matching the app design */}
      <div className="hero-bg-grid" />
      <div className="hero-bg-gradient" />
      <div className="hero-blob-1" />
      <div className="hero-blob-2" />

      {/* Top Nav Bar */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 2,
      }}>
        <BrandLogo variant="dark" onClick={onBack} />
        <button
          onClick={onBack}
          aria-label="Back to landing page"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13.5px',
            fontWeight: 600,
            color: '#64748b',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '8px',
            transition: 'color 0.15s ease, background-color 0.15s ease',
            fontFamily: 'var(--font-controls)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#0f172a';
            e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Verification Card */}
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        padding: 'clamp(28px, 5vw, 40px)',
        boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0,0,0,0.02)',
        position: 'relative',
        zIndex: 2,
        textAlign: 'left',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: '#eef2ff',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.12)',
          }}>
            <Lock size={22} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(20px, 4vw, 24px)',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.5px',
          }}>
            Staff Access Gate
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13.5px',
            color: '#64748b',
            marginTop: '6px',
            lineHeight: 1.5,
          }}>
            Enter the shared company access code to unlock anonymous feedback.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="staff-access-gate-input"
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '8px',
                fontFamily: 'var(--font-controls)',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              Access Code
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '16px', top: '14px' }}
              />
              <input
                id="staff-access-gate-input"
                type="text"
                required
                autoFocus
                placeholder="e.g. DCREATIVS2026"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  if (accessError) setAccessError(null);
                }}
                style={{
                  width: '100%',
                  padding: '13px 16px 13px 44px',
                  borderRadius: '14px',
                  border: accessError
                    ? '1.5px solid #ef4444'
                    : accessSuccess
                    ? '1.5px solid #10b981'
                    : '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-controls)',
                  letterSpacing: '1px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
                onFocus={(e) => {
                  if (!accessError && !accessSuccess) {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                  }
                }}
                onBlur={(e) => {
                  if (!accessError && !accessSuccess) {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                  }
                }}
              />
            </div>
          </div>

          {accessError && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '12.5px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeIn 0.2s ease',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{accessError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || accessSuccess || !accessCode.trim()}
            className="btn-primary-pill"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '14.5px',
              backgroundColor: accessSuccess ? '#10b981' : undefined,
              cursor: (isVerifying || !accessCode.trim()) ? 'not-allowed' : 'pointer',
              opacity: !accessCode.trim() ? 0.7 : 1,
            }}
          >
            {isVerifying ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                <span>Verifying Access...</span>
              </>
            ) : accessSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>Verified! Proceeding...</span>
              </>
            ) : (
              <span>Continue to Feedback</span>
            )}
          </button>
        </form>

        {/* Informational / Privacy footer */}
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            lineHeight: 1.5,
            margin: 0,
            fontFamily: 'var(--font-body)',
          }}>
            Don’t have the code? Ask your team lead or HR for the official staff access code.
          </p>
          <p style={{
            fontSize: '11px',
            color: '#94a3b8',
            marginTop: '10px',
            lineHeight: 1.4,
          }}>
            <strong>Zero-Knowledge Protection:</strong> This code is identical for all staff and never links to your personal identity.
          </p>
        </div>
      </div>
    </div>
  );
};
