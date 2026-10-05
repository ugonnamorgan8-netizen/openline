import React from 'react';
import { X, ShieldCheck, Key, Lock, EyeOff, Server, AlertCircle } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
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
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                How Privacy & Anonymity Works
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: '#64748b' }}>
                D’Creativs OpenLine Security & Privacy Architecture
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
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
          {/* Important Transparency Notice */}
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <AlertCircle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 600, color: '#92400e', marginBottom: '3px' }}>Honest Anonymity Disclosure</p>
              <p style={{ color: '#78350f', fontSize: '12.5px' }}>
                Your name and staff account are not attached to this message. Authorized reviewers can read its contents.
                Details you include may identify you, and hosting providers may process connection information.
                This service does not guarantee complete untraceability.
              </p>
            </div>
          </div>

          {/* Key Principles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Key size={18} color="#4f46e5" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong style={{ color: '#0f172a' }}>Shared Staff Access Code:</strong>
                <p style={{ color: '#64748b', fontSize: '13px' }}>
                  All staff, tutors, and contributors use the exact same rotatable access code. No individual tokens or personalized links are ever created.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Lock size={18} color="#4f46e5" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong style={{ color: '#0f172a' }}>128-Bit Private Conversation Secret:</strong>
                <p style={{ color: '#64748b', fontSize: '13px' }}>
                  After submitting, you receive a cryptographically generated 128-bit secret (e.g. <code>7K2-XM9-P4L</code>). Only its secure hash is stored on our server. Keep this code safe; there is no identity-based recovery.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <EyeOff size={18} color="#4f46e5" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong style={{ color: '#0f172a' }}>Strict Reviewer Authentication Separation:</strong>
                <p style={{ color: '#64748b', fontSize: '13px' }}>
                  Even if an authorized reviewer or founder submits feedback, the anonymous submission endpoint ignores reviewer sessions and never links submissions to any account or ID.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Server size={18} color="#4f46e5" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong style={{ color: '#0f172a' }}>No Request Body Logging & Strict Data Retention:</strong>
                <p style={{ color: '#64748b', fontSize: '13px' }}>
                  Request bodies, conversation secrets, and feedback text are strictly omitted from web logs and audit events. Sensitive reports expire and are purged according to defined retention policies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn-dark"
            style={{ padding: '8px 20px', fontSize: '13.5px' }}
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
};
