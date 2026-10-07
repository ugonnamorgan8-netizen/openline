import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, UserCheck, LogIn } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onOpenPrivacy: () => void;
  onNavigateHome: () => void;
  onOpenReviewerPortal: () => void;
  reviewerUser?: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPrivacy,
  onNavigateHome,
  onOpenReviewerPortal,
  reviewerUser,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled
          ? 'rgba(248, 250, 252, 0.88)'
          : 'rgba(248, 250, 252, 0.0)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(226, 232, 240, 0.7)' : '1px solid transparent',
        transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      <div
        className="navbar-inner"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px clamp(14px, 4vw, 40px)',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Brand */}
        <BrandLogo variant="dark" onClick={onNavigateHome} />

        {/* Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1.5vw, 10px)' }}>
          <button
            onClick={onOpenPrivacy}
            title="How your privacy is protected"
            style={{
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              padding: '7px 10px',
              borderRadius: '8px',
              transition: 'all 0.15s ease',
              fontFamily: 'var(--font-controls)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(79,70,229,0.06)';
              e.currentTarget.style.color = '#4f46e5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#475569';
            }}
          >
            <Shield size={15} />
            <span className="hide-mobile">Privacy</span>
          </button>

          <button
            onClick={onOpenReviewerPortal}
            style={{
              padding: '7px 14px',
              borderRadius: '9999px',
              border: reviewerUser ? '1px solid rgba(99,102,241,0.3)' : '1px solid #e2e8f0',
              backgroundColor: reviewerUser ? 'rgba(99,102,241,0.08)' : '#ffffff',
              color: reviewerUser ? '#4f46e5' : '#0f172a',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'all 0.18s ease',
              fontFamily: 'var(--font-controls)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {reviewerUser ? (
              <>
                <UserCheck size={14} color="#4f46e5" />
                <span>Portal</span>
              </>
            ) : (
              <>
                <LogIn size={14} color="#64748b" />
                <span>Portal</span>
              </>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
