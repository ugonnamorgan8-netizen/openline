import React, { useState } from 'react';
import { X, KeyRound, ArrowRight, AlertCircle } from 'lucide-react';

interface CheckResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSecret: (secret: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const CheckResponseModal: React.FC<CheckResponseModalProps> = ({
  isOpen,
  onClose,
  onSubmitSecret,
  isLoading,
  error,
}) => {
  const [secretInput, setSecretInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretInput.trim()) {
      onSubmitSecret(secretInput.trim());
    }
  };

  const handleUseDemo = (demoSecret: string) => {
    setSecretInput(demoSecret);
    onSubmitSecret(demoSecret);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f46e5'
            }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Check a Response
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: '#64748b' }}>
                Enter your private conversation secret
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '6px',
              fontFamily: 'var(--font-controls)',
            }}>
              Secret Code
            </label>
            <input
              type="text"
              placeholder="e.g. 7K2-XM9-P4L"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: error ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                fontSize: '15px',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '1px',
                color: '#0f172a',
                textTransform: 'uppercase',
              }}
              autoFocus
            />
            {error && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)' }}>
                <AlertCircle size={14} />
                {error}
              </p>
            )}
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
              Your secret was generated when you sent your message. If lost, it cannot be recovered.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              onClick={() => handleUseDemo('7K2-XM9-P4L')}
              style={{
                fontSize: '12.5px',
                color: '#4f46e5',
                textDecoration: 'underline',
                background: 'none',
                fontWeight: 600,
                fontFamily: 'var(--font-controls)',
              }}
            >
              Fill demo code (7K2-XM9-P4L)
            </button>

            <button
              type="submit"
              disabled={isLoading || !secretInput.trim()}
              className="btn-primary-pill"
              style={{
                padding: '10px 22px',
                fontSize: '14px',
                fontFamily: 'var(--font-controls)',
                opacity: isLoading || !secretInput.trim() ? 0.6 : 1,
              }}
            >
              <span>{isLoading ? 'Checking...' : 'Open conversation'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
