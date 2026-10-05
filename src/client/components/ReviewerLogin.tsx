import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail, Key, UserCheck, Shield } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface ReviewerLoginProps {
  onBack: () => void;
  onLoginSuccess: (reviewer: any) => void;
  onLogin: (email: string, pass: string) => Promise<any>;
}

export const ReviewerLogin: React.FC<ReviewerLoginProps> = ({ onBack, onLoginSuccess, onLogin }) => {
  const [email, setEmail] = useState('elena.vance@dcreativs.internal');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await onLogin(email.trim(), password);
      if (res.success) {
        onLoginSuccess(res.reviewer);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (rEmail: string) => {
    setEmail(rEmail);
    setPassword('Password123!');
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
    }}>
      <div style={{ width: '100%', maxWidth: '460px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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

      <div style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        padding: 'clamp(24px, 5vw, 36px)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#eef2ff',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <Lock size={22} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
            Reviewer Portal
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Restricted to authorized D’Creativs reviewers & administrators.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', fontFamily: 'var(--font-controls)' }}>
              Staff Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12.5px',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary-pill"
            style={{ width: '100%', padding: '12px', fontSize: '14.5px' }}
          >
            {isLoading ? 'Verifying...' : 'Sign in to Workspace'}
          </button>
        </form>

        {/* Quick Persona Demo Switcher */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
            Quick Demo Sign-in (Pre-configured roles):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickSelect('elena.vance@dcreativs.internal')}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '8px',
                border: email === 'elena.vance@dcreativs.internal' ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span><strong>Elena Vance</strong> (HR Lead)</span>
              <span style={{ color: '#4f46e5' }}>Sensitive Reviewer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('marcus.thorne@dcreativs.internal')}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '8px',
                border: email === 'marcus.thorne@dcreativs.internal' ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span><strong>Marcus Thorne</strong> (Design Lead)</span>
              <span style={{ color: '#4f46e5' }}>Sensitive Reviewer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('admin@dcreativs.internal')}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '8px',
                border: email === 'admin@dcreativs.internal' ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span><strong>Amina Yusuf</strong> (Operations)</span>
              <span style={{ color: '#059669' }}>System Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('david.chen@dcreativs.internal')}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '8px',
                border: email === 'david.chen@dcreativs.internal' ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span><strong>David Chen</strong> (Studio Ops)</span>
              <span style={{ color: '#d97706' }}>Action Owner</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('sarah.miller@dcreativs.internal')}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '8px',
                border: email === 'sarah.miller@dcreativs.internal' ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span><strong>Sarah Miller</strong> (Board)</span>
              <span style={{ color: '#7c3aed' }}>Leadership Viewer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
