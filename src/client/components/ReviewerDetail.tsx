import React, { useState } from 'react';
import {
  ArrowLeft,
  UserCheck,
  XCircle,
  Send,
  Lock,
  Plus,
  ArrowRightLeft,
  Megaphone,
  Clock,
  CheckCircle2,
  Paperclip,
  Smile,
  AlertCircle,
  Shield
} from 'lucide-react';

interface ReviewerDetailProps {
  reviewer: any;
  feedbackItem: any;
  messages: any[];
  internalNotes: any[];
  history: any[];
  allReviewers: any[];
  onBack: () => void;
  onSendReply?: (message: string) => Promise<any>;
  onAddInternalNote: (note: string) => Promise<any>;
  onUpdateStatus: (status: string, reason?: string) => Promise<any>;
  onAssignReviewer: (reviewerId: string) => Promise<any>;
  onRouteAlternate: (altId: string, excludeId?: string) => Promise<any>;
  onCreateAction: (payload: any) => Promise<any>;
  onPublishUpdate: (payload: any) => Promise<any>;
}

export const ReviewerDetail: React.FC<ReviewerDetailProps> = ({
  reviewer,
  feedbackItem,
  messages,
  internalNotes,
  history,
  allReviewers,
  onBack,
  onSendReply,
  onAddInternalNote,
  onUpdateStatus,
  onAssignReviewer,
  onRouteAlternate,
  onCreateAction,
  onPublishUpdate,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Form states
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [closureReason, setClosureReason] = useState('');
  const [actionTitle, setActionTitle] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [actionOwnerId, setActionOwnerId] = useState('rev-david');
  const [actionDate, setActionDate] = useState('');
  const [altReviewerId, setAltReviewerId] = useState('');
  const [pubPerspective, setPubPerspective] = useState('');
  const [pubResponse, setPubResponse] = useState('');
  const [pubStatus, setPubStatus] = useState('IN PROGRESS');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsSubmitting(true);
    setActionError(null);
    try {
      await onAddInternalNote(inputText.trim());
      setInputText('');
    } catch (err: any) {
      setActionError(err.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string, reason?: string) => {
    try {
      await onUpdateStatus(newStatus, reason);
      setShowCloseModal(false);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update status');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const formatRelative = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (hrs < 1) return 'Just now';
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="workspace-main" style={{ padding: 'clamp(16px, 3.5vw, 40px)' }}>
      {/* Top Header matching Page 6 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '24px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={onBack}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontFamily: 'var(--font-controls)',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {feedbackItem.subject || `${feedbackItem.category_name} Feedback`}
              </h1>
              <span className="badge badge-in-review" style={{ fontFamily: 'var(--font-controls)' }}>
                {feedbackItem.status.toUpperCase()}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-controls)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', color: '#94a3b8', textTransform: 'uppercase', marginTop: '4px' }}>
              ID: {feedbackItem.public_id} • {feedbackItem.category_name?.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAssignModal(true)}
            className="btn-secondary-pill"
            style={{ fontSize: '13px', padding: '9px 18px', fontFamily: 'var(--font-controls)', cursor: 'pointer' }}
          >
            <UserCheck size={16} />
            <span>Assign Reviewer</span>
          </button>

          <button
            onClick={() => setShowCloseModal(true)}
            className="btn-dark"
            style={{ fontSize: '13px', padding: '9px 18px', borderRadius: '9999px', fontFamily: 'var(--font-controls)', cursor: 'pointer' }}
          >
            <XCircle size={16} />
            <span>Close Feedback</span>
          </button>
        </div>
      </div>

      {actionError && (
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
          gap: '8px',
          fontFamily: 'var(--font-body)',
        }}>
          <AlertCircle size={16} />
          {actionError}
        </div>
      )}

      {/* Two-Column Responsive Layout */}
      <div className="detail-grid-layout" style={{ gap: 'clamp(20px, 3vw, 36px)' }}>
        {/* Left Column: Feedback Submission & Internal Note Composer */}
        <div>
          {/* Feedback Submission Content */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: 'clamp(20px, 4vw, 28px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', color: '#64748b', textTransform: 'uppercase', fontFamily: 'var(--font-controls)' }}>
                ANONYMOUS SUBMISSION • {feedbackItem.created_at ? formatDate(feedbackItem.created_at).toUpperCase() : ''}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}>
                IDENTITY PROTECTED
              </span>
            </div>

            <div style={{
              fontSize: '15px',
              color: '#0f172a',
              lineHeight: 1.65,
              fontFamily: 'var(--font-body)',
              wordBreak: 'break-word',
            }}>
              {feedbackItem.message}
            </div>

            {feedbackItem.suggested_improvement && (
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginTop: '18px',
              }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-controls)' }}>
                  SUGGESTED IMPROVEMENT:
                </p>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5, margin: 0, fontFamily: 'var(--font-body)' }}>
                  {feedbackItem.suggested_improvement}
                </p>
              </div>
            )}
          </div>

          {/* Zero Response Policy Safeguard Notice */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
            fontSize: '12.5px',
            color: '#64748b',
            fontFamily: 'var(--font-body)',
          }}>
            <Shield size={16} color="#6366f1" style={{ flexShrink: 0 }} />
            <span>Direct replies to submitters are completely disabled by system policy to guarantee 100% submitter anonymity.</span>
          </div>

          {/* Internal Note Composer */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: 'clamp(16px, 3vw, 24px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#4f46e5', fontFamily: 'var(--font-controls)' }}>
                ADD INTERNAL NOTE (REVIEWERS ONLY)
              </span>
            </div>

            <form onSubmit={handleSend}>
              <textarea
                rows={4}
                placeholder="Add an internal note visible only to reviewers..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  fontSize: '14px',
                  color: '#0f172a',
                  lineHeight: 1.5,
                  resize: 'none',
                  marginBottom: '16px',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  type="submit"
                  disabled={isSubmitting || !inputText.trim()}
                  className="btn-primary-pill"
                  style={{
                    padding: '9px 22px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-controls)',
                    opacity: isSubmitting || !inputText.trim() ? 0.6 : 1,
                    cursor: isSubmitting || !inputText.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Send size={14} />
                  <span>Add Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Quick Actions, Internal Notes, History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* QUICK ACTIONS matching Page 6 */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.8px',
              color: '#64748b',
              textTransform: 'uppercase',
              marginBottom: '12px',
              fontFamily: 'var(--font-controls)',
            }}>
              QUICK ACTIONS
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => setShowActionModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  fontFamily: 'var(--font-controls)',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} color="#4f46e5" />
                <span>Create Redacted Action</span>
              </button>

              <button
                onClick={() => setShowRouteModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  fontFamily: 'var(--font-controls)',
                  cursor: 'pointer',
                }}
              >
                <ArrowRightLeft size={16} color="#6366f1" />
                <span>Route to Alternate Reviewer</span>
              </button>

              <button
                onClick={() => {
                  setPubPerspective(feedbackItem.message ? `"${feedbackItem.message.slice(0, 100)}..."` : '');
                  setShowPublishModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  fontFamily: 'var(--font-controls)',
                  cursor: 'pointer',
                }}
              >
                <Megaphone size={16} color="#059669" />
                <span>Publish Public Update</span>
              </button>
            </div>
          </div>

          {/* INTERNAL NOTES matching Page 6 */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.8px',
              color: '#64748b',
              textTransform: 'uppercase',
              marginBottom: '12px',
              fontFamily: 'var(--font-controls)',
            }}>
              INTERNAL NOTES
            </label>

            {internalNotes.length === 0 ? (
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '18px',
                fontSize: '13px',
                color: '#94a3b8',
                textAlign: 'center',
                fontFamily: 'var(--font-body)',
              }}>
                No internal notes yet. Use the tab above to add one.
              </div>
            ) : (
              internalNotes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px 18px',
                    marginBottom: '10px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <p style={{
                    fontSize: '13.5px',
                    color: '#334155',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    marginBottom: '10px',
                    fontFamily: 'var(--font-body)',
                  }}>
                    "{note.note}"
                  </p>
                  <p style={{ fontFamily: 'var(--font-controls)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', color: '#94a3b8', textTransform: 'uppercase' }}>
                    {note.author_name?.split(' ')[0].toUpperCase()} • {formatDate(note.created_at).toUpperCase()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* HISTORY Timeline matching Page 6 */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.8px',
              color: '#64748b',
              textTransform: 'uppercase',
              marginBottom: '12px',
              fontFamily: 'var(--font-controls)',
            }}>
              HISTORY
            </label>

            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {history.length > 0 ? (
                history.map((evt) => (
                  <div key={evt.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#4f46e5',
                      marginTop: '6px',
                      flexShrink: 0
                    }} />
                    <div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {evt.action_type === 'STATUS_CHANGE'
                          ? `Status changed to ${evt.details_json?.to || 'In Review'}`
                          : evt.action_type === 'ASSIGNMENT'
                          ? `Assigned to ${evt.reviewer_name || 'Elena Vance'}`
                          : evt.action_type === 'REDACTED_ACTION_CREATED'
                          ? 'Created Redacted Improvement Task'
                          : evt.action_type === 'UPDATE_PUBLISHED'
                          ? 'Published Public Summary'
                          : evt.action_type}
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: '#64748b' }}>
                        {evt.reviewer_name || 'System'} • {formatRelative(evt.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4f46e5', marginTop: '6px' }} />
                  <div>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Feedback Received</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', color: '#64748b' }}>System • {formatRelative(feedbackItem.created_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Assign Reviewer */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '92%' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Assign Reviewer</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px', fontFamily: 'var(--font-controls)' }}>
                Select Reviewer:
              </label>
              <select
                value={selectedReviewerId}
                onChange={(e) => setSelectedReviewerId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontFamily: 'var(--font-controls)',
                }}
              >
                <option value="">Choose reviewer...</option>
                {allReviewers.filter(r => ['general_reviewer', 'sensitive_reviewer'].includes(r.role)).map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.title})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowAssignModal(false)} className="btn-secondary-pill" style={{ fontFamily: 'var(--font-controls)', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={async () => {
                  if (selectedReviewerId) {
                    await onAssignReviewer(selectedReviewerId);
                    setShowAssignModal(false);
                  }
                }}
                disabled={!selectedReviewerId}
                className="btn-primary-pill"
                style={{ padding: '8px 20px', fontSize: '13px', fontFamily: 'var(--font-controls)', cursor: 'pointer' }}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Close Conversation */}
      {showCloseModal && (
        <div className="modal-overlay" onClick={() => setShowCloseModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', width: '92%' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Close Feedback</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px', fontFamily: 'var(--font-body)' }}>
              Closing marks this feedback item as resolved. Provide a concise explanation for internal audit history.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px', fontFamily: 'var(--font-controls)' }}>
                Closure Explanation / Resolution Summary:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Action completed, freelance motion designer hired, or duplicate topic resolved."
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  fontFamily: 'var(--font-body)',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowCloseModal(false)} className="btn-secondary-pill" style={{ fontFamily: 'var(--font-controls)', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => handleStatusChange('Closed', closureReason)}
                className="btn-dark"
                style={{ padding: '8px 20px', fontSize: '13px', fontFamily: 'var(--font-controls)', cursor: 'pointer' }}
              >
                Close with explanation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Create Redacted Action */}
      {showActionModal && (
        <div className="modal-overlay" onClick={() => setShowActionModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Create Redacted Action</h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '18px', fontFamily: 'var(--font-body)' }}>
              Action owners see ONLY this task. Original message bodies and anonymous sender references are strictly withheld.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-controls)' }}>Action Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Roadmap Review & Freelance Support"
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', fontFamily: 'var(--font-controls)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-controls)' }}>Redacted Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the concrete organizational task without names or contextual identifiers..."
                  value={actionDescription}
                  onChange={(e) => setActionDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px', fontFamily: 'var(--font-body)' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-controls)' }}>Action Owner</label>
                  <select
                    value={actionOwnerId}
                    onChange={(e) => setActionOwnerId(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'var(--font-controls)' }}
                  >
                    {allReviewers.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.title})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-controls)' }}>Target Date</label>
                  <input
                    type="date"
                    value={actionDate}
                    onChange={(e) => setActionDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'var(--font-controls)' }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowActionModal(false)} className="btn-secondary-pill" style={{ fontFamily: 'var(--font-controls)', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={async () => {
                  if (actionTitle && actionDescription) {
                    await onCreateAction({
                      action_title: actionTitle,
                      redacted_description: actionDescription,
                      action_owner_id: actionOwnerId,
                      target_date: actionDate || undefined,
                    });
                    setShowActionModal(false);
                  }
                }}
                disabled={!actionTitle || !actionDescription}
                className="btn-primary-pill"
                style={{ padding: '8px 20px', fontSize: '13px', fontFamily: 'var(--font-controls)', cursor: 'pointer' }}
              >
                Create Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Route to Alternate Reviewer */}
      {showRouteModal && (
        <div className="modal-overlay" onClick={() => setShowRouteModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', width: '92%' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Route to Alternate Reviewer</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px', fontFamily: 'var(--font-body)' }}>
              Transfer ownership of this report to an alternate designated reviewer. You will be excluded from viewing this item.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px', fontFamily: 'var(--font-controls)' }}>
                Alternate Sensitive Reviewer:
              </label>
              <select
                value={altReviewerId}
                onChange={(e) => setAltReviewerId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontFamily: 'var(--font-controls)',
                }}
              >
                <option value="">Choose alternate reviewer...</option>
                {allReviewers.filter(r => r.id !== reviewer.id && ['general_reviewer', 'sensitive_reviewer'].includes(r.role)).map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.title})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowRouteModal(false)} className="btn-secondary-pill" style={{ fontFamily: 'var(--font-controls)', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={async () => {
                  if (altReviewerId) {
                    await onRouteAlternate(altReviewerId, reviewer.id);
                    setShowRouteModal(false);
                    onBack();
                  }
                }}
                disabled={!altReviewerId}
                className="btn-primary-pill"
                style={{ padding: '8px 20px', fontSize: '13px', fontFamily: 'var(--font-controls)', cursor: 'pointer' }}
              >
                Re-route and Exclude Self
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Publish Public Update */}
      {showPublishModal && (
        <div className="modal-overlay" onClick={() => setShowPublishModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Publish to "You Said, We Did"</h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '18px', fontFamily: 'var(--font-body)' }}>
              Create an approved public card. Redact all identifying and contextual clues.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-controls)' }}>Status</label>
                <select
                  value={pubStatus}
                  onChange={(e) => setPubStatus(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'var(--font-controls)' }}
                >
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-controls)' }}>Staff Perspective (Redacted summary / quote)</label>
                <textarea
                  rows={2}
                  placeholder='e.g. "The current Q3 project deadlines feel unmanageable and are leading to team burnout."'
                  value={pubPerspective}
                  onChange={(e) => setPubPerspective(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px', fontFamily: 'var(--font-body)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-controls)' }}>Our Response (Concrete actions taken)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. We re-evaluated the Q3 roadmap with the design leads. Two secondary features have been moved to Q4..."
                  value={pubResponse}
                  onChange={(e) => setPubResponse(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13.5px', fontFamily: 'var(--font-body)' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowPublishModal(false)} className="btn-secondary-pill" style={{ fontFamily: 'var(--font-controls)', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={async () => {
                  if (pubPerspective && pubResponse) {
                    await onPublishUpdate({
                      staff_perspective: pubPerspective,
                      our_response: pubResponse,
                      status: pubStatus
                    });
                    setShowPublishModal(false);
                  }
                }}
                disabled={!pubPerspective || !pubResponse}
                className="btn-primary-pill"
                style={{ padding: '8px 20px', fontSize: '13px', fontFamily: 'var(--font-controls)', cursor: 'pointer' }}
              >
                Publish Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
