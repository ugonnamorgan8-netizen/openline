import React, { useState } from 'react';
import { Check, Copy, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo.js';

interface SubmissionConfirmationProps {
  publicId: string;
  secret?: string;
  categoryName: string;
  onGoToConversation?: (secret: string) => void;
  onBackToHome: () => void;
}

export const SubmissionConfirmation: React.FC<SubmissionConfirmationProps> = ({
  publicId,
  categoryName,
  onBackToHome,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '24px clamp(16px, 4vw, 24px) 60px',
      textAlign: 'center',
      maxWidth: '640px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Brand Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '24px' }}>
        <BrandLogo variant="dark" onClick={onBackToHome} />
      </div>

      {/* Success Green Check Circle */}
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#10b981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        marginBottom: '20px',
        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.28)',
      }}>
        <Check size={30} strokeWidth={3} />
      </div>

      {/* Title & Subtitle */}
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(24px, 5vw, 34px)',
        fontWeight: 800,
        color: '#0f172a',
        letterSpacing: '-0.8px',
        marginBottom: '12px',
      }}>
        Feedback Submitted
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '15px',
        color: '#64748b',
        maxWidth: '520px',
        lineHeight: 1.6,
        marginBottom: '32px',
      }}>
        Your anonymous message has been securely submitted to executive leadership (CHRO &amp; COO) for confidential review. Thank you for sharing your perspective.
      </p>

      {/* Reference ID Card */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid #e2e8f0',
        padding: '24px 28px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '1px',
          color: '#64748b',
          textTransform: 'uppercase',
          marginBottom: '8px',
          fontFamily: 'var(--font-heading)',
        }}>
          SUBMISSION REFERENCE ID • {categoryName?.toUpperCase()}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '6px',
          marginBottom: '8px',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '2px',
            color: '#0f172a',
          }}>
            {publicId}
          </span>
          <button
            onClick={handleCopy}
            title="Copy Reference ID"
            aria-label="Copy Reference ID"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: copied ? '#10b981' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
          </button>
        </div>

        <p style={{
          fontSize: '12px',
          color: '#94a3b8',
          margin: 0,
          fontFamily: 'var(--font-body)',
        }}>
          {copied ? 'Copied to clipboard!' : 'Keep this reference code for your personal records.'}
        </p>
      </div>

      {/* Privacy Guarantee Notice */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        textAlign: 'left',
        marginBottom: '32px',
      }}>
        <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12.5px',
          color: '#166534',
          lineHeight: 1.5,
          margin: 0,
        }}>
          <strong>Zero Response Policy:</strong> To protect your identity completely, no response channels or reply threads are opened. Your voice has been heard, without compromising your privacy.
        </p>
      </div>

      {/* Back to Home Button */}
      <button
        onClick={onBackToHome}
        className="btn-primary-pill"
        style={{
          fontFamily: 'var(--font-controls)',
          fontSize: '15px',
          padding: '13px 40px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
      >
        <span>Return to Home</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
