import React, { useState, useEffect, useRef } from 'react';
import { X, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface AnonymousConversationProps {
  secret: string;
  conversationData: any;
  onClose: () => void;
  onSendReply: (secret: string, message: string) => Promise<any>;
  onRefresh: () => void;
}

export const AnonymousConversation: React.FC<AnonymousConversationProps> = ({
  secret,
  conversationData,
  onClose,
  onSendReply,
  onRefresh,
}) => {
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationData?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSending(true);
    setSendError(null);
    try {
      await onSendReply(secret, replyText.trim());
      setReplyText('');
      onRefresh();
    } catch (err: any) {
      setSendError(err.message || 'Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status || 'New';
    return (
      <span className="badge badge-in-review" style={{ fontSize: '11px', padding: '4px 12px' }}>
        {s.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fcfdfd' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px clamp(16px, 4vw, 40px)',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
      }}>
        <BrandLogo variant="dark" onClick={onClose} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {getStatusBadge(conversationData?.status)}
          <button
            onClick={onClose}
            aria-label="Close conversation"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              background: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Conversation Container */}
      <div style={{
        flex: 1,
        maxWidth: '720px',
        width: '100%',
        margin: '0 auto',
        padding: '10px clamp(14px, 3vw, 20px) 140px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Conversation Header matching Page 4 */}
        <div style={{ textAlign: 'center', marginBottom: '36px', marginTop: '10px' }}>
          <p style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            letterSpacing: '1px',
            color: '#94a3b8',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            CONVERSATION SECRET: {secret}
          </p>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(22px, 5vw, 28px)',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.5px',
            marginBottom: '6px',
          }}>
            {conversationData?.subject || 'Feedback Conversation'}
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#64748b' }}>
            Category: {conversationData?.category_name || 'General'} • Started {formatDate(conversationData?.created_at)}
          </p>
        </div>

        {/* Message Thread */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flex: 1 }}>
          {conversationData?.messages?.map((msg: any) => {
            const isSender = msg.sender_type === 'sender';

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isSender ? 'flex-start' : 'flex-end',
                  width: '100%',
                }}
              >
                {/* Sender Bubble */}
                {isSender ? (
                  <div style={{ maxWidth: '85%', width: '100%' }}>
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '22px 24px',
                      color: '#0f172a',
                      fontSize: '15px',
                      lineHeight: 1.6,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      marginBottom: '8px',
                    }}>
                      {msg.body}
                    </div>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      letterSpacing: '0.8px',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      marginLeft: '6px',
                    }}>
                      YOU • SENT
                    </span>
                  </div>
                ) : (
                  /* Reviewer Bubble matching Page 4 dark navy bubble */
                  <div style={{ maxWidth: '85%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{
                      backgroundColor: '#0f172a',
                      borderRadius: '20px',
                      padding: '22px 24px',
                      color: '#ffffff',
                      fontSize: '15px',
                      lineHeight: 1.6,
                      boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
                      marginBottom: '8px',
                    }}>
                      {msg.body}
                    </div>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      letterSpacing: '0.8px',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      marginRight: '6px',
                    }}>
                      {msg.reviewer_label || 'REVIEWER • SENT'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Bottom Input Bar matching Page 4 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 20px 24px',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.03)',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <p style={{
            textAlign: 'center',
            fontSize: '10.5px',
            fontWeight: 700,
            letterSpacing: '0.8px',
            color: '#94a3b8',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}>
            THIS MESSAGE WILL REMAIN ANONYMOUS
          </p>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Reply to conversation..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                fontSize: '14.5px',
                color: '#0f172a',
                backgroundColor: '#f8fafc',
              }}
            />
            <button
              type="submit"
              disabled={isSending || !replyText.trim()}
              className="btn-primary-pill"
              style={{
                padding: '14px 28px',
                fontSize: '14.5px',
                opacity: isSending || !replyText.trim() ? 0.6 : 1,
              }}
            >
              <span>Send</span>
            </button>
          </form>

          {sendError && (
            <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', textAlign: 'center' }}>
              {sendError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
