import React, { useState } from 'react';
import { Check, Copy, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface SubmissionConfirmationProps {
  publicId: string;
  secret: string;
  categoryName: string;
  onGoToConversation: (secret: string) => void;
  onBackToHome: () => void;
}

export const SubmissionConfirmation: React.FC<SubmissionConfirmationProps> = ({
  publicId,
  secret,
  categoryName,
  onGoToConversation,
  onBackToHome,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `D'Creativs OpenLine - Private Conversation Secret
------------------------------------------------
Topic/Category: ${categoryName}
Public Tracking Reference: ${publicId}
Your Private Conversation Secret: ${secret}

Date: ${new Date().toLocaleDateString()}

KEEP THIS SECRET PRIVATE.
Anyone with this secret code can view and reply to this conversation.
OpenLine does not store your name or account, and this secret CANNOT be recovered if lost.

To check responses:
Visit OpenLine -> Click "Check a response" -> Enter your secret code.
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `openline-secret-${secret.replace(/[^a-zA-Z0-9]/g, '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
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
      maxWidth: '680px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Brand Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '24px' }}>
        <BrandLogo variant="dark" onClick={onBackToHome} />
      </div>

      {/* Success Green Check Circle */}
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#10b981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        marginBottom: '20px',
        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
      }}>
        <Check size={26} strokeWidth={3} />
      </div>

      {/* Title & Subtitle */}
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(24px, 5vw, 32px)',
        fontWeight: 800,
        color: '#0f172a',
        letterSpacing: '-0.8px',
        marginBottom: '10px',
      }}>
        Feedback Submitted
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '15px',
        color: '#64748b',
        maxWidth: '520px',
        lineHeight: 1.5,
        marginBottom: '32px',
      }}>
        Your message has been sent to the reviewers. To read their response, you will need the secret code below.
      </p>

      {/* Dark Secret Card matching Page 3 */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#0a0f1d',
        borderRadius: '24px',
        padding: 'clamp(24px, 5vw, 36px) clamp(16px, 4vw, 28px)',
        color: '#ffffff',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px',
      }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '1.2px',
          color: '#94a3b8',
          textTransform: 'uppercase',
          marginBottom: '16px',
          fontFamily: 'var(--font-heading)',
        }}>
          PRIVATE CONVERSATION SECRET
        </p>

        <div style={{
          fontSize: 'clamp(24px, 6vw, 40px)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          letterSpacing: '2px',
          color: '#ffffff',
          marginBottom: '24px',
          userSelect: 'all',
          wordBreak: 'break-all',
        }}>
          {secret}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopy}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '9px 20px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
          >
            {copied ? <CheckCircle2 size={16} color="#10b981" /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '9px 20px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
          >
            <Download size={16} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Warning Alert Banner matching Page 3 */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textAlign: 'left',
        marginBottom: '32px',
      }}>
        <AlertTriangle size={20} color="#6366f1" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>
          Keep this private. Anyone with this code can access your conversation. We cannot recover it if you lose it.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '380px' }}>
        <button
          onClick={() => onGoToConversation(secret)}
          className="btn-primary-pill"
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          Go to conversation
        </button>

        <button
          onClick={onBackToHome}
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#64748b',
            background: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          Back to home
        </button>
      </div>

      {/* Footer matching Page 3 */}
      <div style={{ marginTop: '60px', fontSize: '12px', color: '#94a3b8' }}>
        © 2026 D’Creativs OpenLine • A product of D’Creativs. Professional. Anonymous. Trustworthy.
      </div>
    </div>
  );
};
