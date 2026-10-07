import React, { useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  Star,
  Shield,
  Clock,
  Compass,
  Heart,
  Wrench,
  BookOpen,
  MessageCircle,
  AlertCircle,
  Send,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import chroAvatar from '../assets/chro-avatar.png';
import cooAvatar from '../assets/coo-avatar.png';


interface FeedbackFormProps {
  categories: any[];
  onCancel: () => void;
  onSubmitSuccess: (data: { public_id: string; secret: string; category_name: string }) => void;
  onOpenPrivacy: () => void;
  onSubmitFeedback: (payload: any) => Promise<any>;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  categories,
  onCancel,
  onSubmitSuccess,
  onOpenPrivacy,
  onSubmitFeedback,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('cat-suggestion');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [suggestedImprovement, setSuggestedImprovement] = useState('');
  const [shareConsent, setShareConsent] = useState(false);
  const [routingChoice, setRoutingChoice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Fallback default categories when API hasn't loaded yet
  const DEFAULT_CATEGORIES = [
    { id: 'cat-suggestion', name: 'Suggestion', description: 'Share an idea or improvement', icon: 'lightbulb', is_sensitive: false },
    { id: 'cat-concern', name: 'Concern', description: 'Raise a workplace concern', icon: 'alert-triangle', is_sensitive: false },
    { id: 'cat-positive', name: 'Positive Feedback', description: 'Share something going well', icon: 'star', is_sensitive: false },
    { id: 'cat-sensitive', name: 'Sensitive Matter', description: 'Confidential sensitive issue', icon: 'shield', is_sensitive: true },
  ];
  const resolvedCategories = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;

  // Four hero categories matching Page 2
  const heroCategories = resolvedCategories.filter(c =>
    ['cat-suggestion', 'cat-concern', 'cat-positive', 'cat-sensitive'].includes(c.id)
  );

  const additionalCategories = resolvedCategories.filter(c =>
    !['cat-suggestion', 'cat-concern', 'cat-positive', 'cat-sensitive'].includes(c.id)
  );

  const selectedCategory = resolvedCategories.find(c => c.id === selectedCategoryId) || resolvedCategories[0];

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'lightbulb': return <Lightbulb size={18} color="#6366f1" />;
      case 'alert-triangle': return <AlertTriangle size={18} color="#d97706" />;
      case 'star': return <Star size={18} color="#4f46e5" fill="#e0e7ff" />;
      case 'shield': return <Shield size={18} color="#0f172a" />;
      case 'clock': return <Clock size={18} color="#6366f1" />;
      case 'compass': return <Compass size={18} color="#6366f1" />;
      case 'heart': return <Heart size={18} color="#ec4899" />;
      case 'tool': return <Wrench size={18} color="#64748b" />;
      case 'book': return <BookOpen size={18} color="#0284c7" />;
      default: return <MessageCircle size={18} color="#64748b" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Please type your feedback message before sending.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await onSubmitFeedback({
        category_id: selectedCategoryId,
        subject: subject.trim() || undefined,
        message: message.trim(),
        suggested_improvement: suggestedImprovement.trim() || undefined,
        share_in_updates_consent: shareConsent,
        routing_choice: routingChoice || undefined,
      });

      if (result.success) {
        onSubmitSuccess({
          public_id: result.public_id,
          secret: result.secret,
          category_name: result.category_name || selectedCategory?.name || 'Feedback'
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 24px) 80px' }}>

      {/* Top Bar with Cancel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <BrandLogo variant="dark" onClick={onCancel} />
        <button
          onClick={onCancel}
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#64748b',
            background: 'none',
            fontFamily: 'var(--font-controls)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          Cancel
        </button>
      </div>

      {/* Heading */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(26px, 5vw, 34px)',
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.8px',
          marginBottom: '8px',
        }}>
          New Feedback
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: '#64748b' }}>
          Select a category and share your thoughts. Your perspective can help us improve.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: SELECT CATEGORY */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            fontSize: '11.5px',
            fontWeight: 700,
            letterSpacing: '0.8px',
            color: '#64748b',
            textTransform: 'uppercase',
            marginBottom: '14px',
            fontFamily: 'var(--font-heading)',
          }}>
            1. SELECT CATEGORY
          </label>

          {/* 4 Primary Hero Cards matching screenshot */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '14px',
            marginBottom: '14px'
          }}>
            {heroCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: isSelected ? '2px solid #4f46e5' : '1.5px solid #e2e8f0',
                    padding: '20px 22px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 0 1px #4f46e5, 0 4px 12px rgba(79, 70, 229, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                      {cat.name}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#64748b', lineHeight: 1.45, paddingLeft: '28px' }}>
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Additional Categories Toggle */}
          {additionalCategories.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowAllCategories(!showAllCategories)}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#4f46e5',
                  background: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 0',
                }}
              >
                <span>{showAllCategories ? 'Show fewer categories' : 'View more specific topics (Workload, Leadership, Academy...)'}</span>
                <ChevronDown size={14} style={{ transform: showAllCategories ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {showAllCategories && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '10px',
                  marginTop: '12px'
                }}>
                  {additionalCategories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                          padding: '14px 16px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          {getCategoryIcon(cat.icon)}
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{cat.name}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>{cat.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: YOUR MESSAGE */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.8px',
            color: '#64748b',
            textTransform: 'uppercase',
            marginBottom: '14px',
          }}>
            2. YOUR MESSAGE
          </label>

          {/* Optional Subject */}
          <div style={{ marginBottom: '14px' }}>
            <input
              type="text"
              placeholder="Subject or topic title (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '14px',
                border: '1.5px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '14.5px',
                color: '#0f172a',
              }}
            />
          </div>

          {/* Message Textarea */}
          <div style={{ marginBottom: '14px' }}>
            <textarea
              rows={6}
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '15px',
                color: '#0f172a',
                lineHeight: 1.6,
                resize: 'vertical',
              }}
            />
          </div>

          {/* Suggested Improvement (Optional) */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Optional: Suggested improvement or idea for resolution"
              value={suggestedImprovement}
              onChange={(e) => setSuggestedImprovement(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '13.5px',
                color: '#0f172a',
              }}
            />
          </div>

          {/* Privacy Reminder Card matching Page 2 */}
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 240px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
                flexShrink: 0
              }}>
                !
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#92400e', lineHeight: 1.45 }}>
                <strong>Privacy Reminder:</strong> Your name is not attached, but details inside your message
                (specific projects, dates, or rare events) could identify you.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenPrivacy}
              style={{
                fontSize: '13px',
                color: '#4f46e5',
                fontWeight: 600,
                background: 'none',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-controls)',
              }}
            >
              How privacy works
            </button>
          </div>

          {/* Sensitive Concern Routing Option */}
          {selectedCategory.is_sensitive && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '20px'
            }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Alternate Reviewer Routing (Conflict of Interest Protection):
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: '#64748b', marginBottom: '12px' }}>
                If this concern involves one of the default reviewers, choose the alternate route. The excluded reviewer will never see this report.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  <input
                    type="radio"
                    name="routing_choice"
                    value=""
                    checked={routingChoice === ''}
                    onChange={() => setRoutingChoice('')}
                  />
                  Default: Confidential HR Review (Akparanta Estella — CHRO)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  <input
                    type="radio"
                    name="routing_choice"
                    value="rev-akparanta-estella"
                    checked={routingChoice === 'rev-akparanta-estella'}
                    onChange={() => setRoutingChoice('rev-akparanta-estella')}
                  />
                  Akparanta Estella Only (CHRO — People & Culture)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  <input
                    type="radio"
                    name="routing_choice"
                    value="rev-morgan-ugonna"
                    checked={routingChoice === 'rev-morgan-ugonna'}
                    onChange={() => setRoutingChoice('rev-morgan-ugonna')}
                  />
                  Executive Board Route Only (Morgan Ugonna — COO)
                </label>
              </div>
            </div>
          )}

          {/* Consent Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '28px' }}>
            <input
              type="checkbox"
              id="share-consent"
              checked={shareConsent}
              onChange={(e) => setShareConsent(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <label htmlFor="share-consent" style={{ fontSize: '13px', color: '#475569', cursor: 'pointer', lineHeight: 1.4 }}>
              Permission to use an independently written, anonymized summary in "You said, we did" company updates (off by default).
            </label>
          </div>
        </div>

        {/* REVIEWERS FOR THIS CATEGORY Card matching Page 2 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.8px',
            color: '#64748b',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            REVIEWERS FOR THIS CATEGORY
          </label>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {selectedCategory.assigned_reviewers?.length > 0 ? (
              selectedCategory.assigned_reviewers.map((rev: any) => (
                <div key={rev.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={rev.avatar_url || (rev.id === 'rev-morgan-ugonna' || rev.title?.toLowerCase().includes('coo') ? cooAvatar : chroAvatar)}
                    alt={rev.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{rev.name}</h4>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>{rev.title}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <UserCheck size={28} color="#4f46e5" />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Elena Vance</h4>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>HR Lead</p>
                </div>
              </div>
            )}
          </div>

          <p style={{
            fontSize: '10.5px',
            fontWeight: 700,
            letterSpacing: '0.8px',
            color: '#94a3b8',
            textTransform: 'uppercase',
          }}>
            THESE PEOPLE WILL RECEIVE YOUR MESSAGE IN THEIR PRIVATE INBOX.
          </p>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {errorMessage}
          </div>
        )}

        {/* Legal Disclaimer */}
        <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '24px' }}>
          OpenLine is not continuously monitored and is not an emergency channel.
          Your name and staff account are not attached to this message. Authorized reviewers can read its contents.
          Details you include may identify you, and hosting providers may process connection information.
          This service does not guarantee complete untraceability.
        </p>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="btn-primary-pill"
            style={{
              padding: '14px 40px',
              fontSize: '15px',
              opacity: isSubmitting || !message.trim() ? 0.6 : 1,
            }}
          >
            <Send size={16} />
            <span>{isSubmitting ? 'Sending securely...' : 'Send feedback'}</span>
          </button>
        </div>
      </form>

      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
        © 2026 D’Creativs OpenLine • A product of D’Creativs. Professional. Anonymous. Trustworthy.
      </div>
    </div>
  );
};
