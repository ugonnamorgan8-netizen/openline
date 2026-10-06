import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { PrivacyModal } from './components/PrivacyModal.js';
import { CheckResponseModal } from './components/CheckResponseModal.js';
import { LandingPage } from './components/LandingPage.js';
import { FeedbackForm } from './components/FeedbackForm.js';
import { SubmissionConfirmation } from './components/SubmissionConfirmation.js';
import { AnonymousConversation } from './components/AnonymousConversation.js';
import { ReviewerWorkspace } from './components/ReviewerWorkspace.js';
import { ReviewerDetail } from './components/ReviewerDetail.js';
import { YouSaidWeDid } from './components/YouSaidWeDid.js';
import { ReviewerLogin } from './components/ReviewerLogin.js';
import { AdminSettings } from './components/AdminSettings.js';
import { ActionOwnerWorkspace } from './components/ActionOwnerWorkspace.js';
import { LeadershipDashboard } from './components/LeadershipDashboard.js';
import { BrandLogo } from './components/BrandLogo.js';

import {
  verifyStaffAccess,
  checkStaffAccess,
  getCategories,
  submitFeedback,
  accessConversation,
  replyToConversation,
  getPublicUpdates,
  reviewerLogin,
  reviewerLogout,
  getReviewerMe,
  getReviewerList,
  getReviewerFeedback,
  getReviewerFeedbackDetail,
  sendReviewerReply,
  addInternalNote,
  updateFeedbackStatus,
  assignReviewer,
  routeToAlternateReviewer,
  createRedactedAction,
  publishPublicUpdate,
} from './api.js';

export function App() {
  // Navigation View State
  type AppView =
    | 'landing'
    | 'new_feedback'
    | 'confirmation'
    | 'conversation'
    | 'reviewer_workspace'
    | 'reviewer_detail'
    | 'you_said_we_did'
    | 'reviewer_login'
    | 'admin_settings'
    | 'action_owner'
    | 'leadership_dashboard';

  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [viewHistory, setViewHistory] = useState<AppView[]>([]);

  const navigateTo = (nextView: AppView) => {
    if (nextView === currentView) return;
    setViewHistory(prev => [...prev, currentView]);
    setCurrentView(nextView);
  };

  const goBack = () => {
    setViewHistory(prev => {
      if (prev.length === 0) {
        if (activeReviewer) {
          if (activeReviewer.role === 'admin') setCurrentView('admin_settings');
          else if (activeReviewer.role === 'action_owner') setCurrentView('action_owner');
          else if (activeReviewer.role === 'leadership_viewer') setCurrentView('leadership_dashboard');
          else setCurrentView('reviewer_workspace');
        } else {
          setCurrentView('landing');
        }
        return [];
      }
      const newHist = [...prev];
      const target = newHist.pop()!;
      setCurrentView(target);
      return newHist;
    });
  };

  // Modals
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isCheckResponseOpen, setIsCheckResponseOpen] = useState(false);
  const [checkSecretLoading, setCheckSecretLoading] = useState(false);
  const [checkSecretError, setCheckSecretError] = useState<string | null>(null);

  // Staff Access Gate State
  const [isStaffVerified, setIsStaffVerified] = useState(false);

  // Anonymous Flow State
  const [categories, setCategories] = useState<any[]>([]);
  const [latestSubmission, setLatestSubmission] = useState<{ public_id: string; secret: string; category_name: string } | null>(null);
  const [activeSecret, setActiveSecret] = useState<string>('');
  const [conversationData, setConversationData] = useState<any>(null);

  // "You Said, We Did" Updates
  const [publicUpdates, setPublicUpdates] = useState<any[]>([]);

  // Reviewer State
  const [activeReviewer, setActiveReviewer] = useState<any>(null);
  const [allReviewers, setAllReviewers] = useState<any[]>([]);
  const [reviewerTab, setReviewerTab] = useState('unread');
  const [reviewerCategory, setReviewerCategory] = useState('all');
  const [reviewerSearch, setReviewerSearch] = useState('');
  const [reviewerSort, setReviewerSort] = useState('newest');
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [reviewerStats, setReviewerStats] = useState({
    total: 42,
    unread: 12,
    awaiting_response: 8,
    overdue: 3,
    new_this_week: 14,
  });

  // Reviewer Detail View State
  const [selectedPublicId, setSelectedPublicId] = useState<string | null>(null);
  const [feedbackDetail, setFeedbackDetail] = useState<any>(null);
  const [detailMessages, setDetailMessages] = useState<any[]>([]);
  const [detailInternalNotes, setDetailInternalNotes] = useState<any[]>([]);
  const [detailHistory, setDetailHistory] = useState<any[]>([]);

  // Initial Load
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // 1. Check staff access status
      const accessRes = await checkStaffAccess();
      setIsStaffVerified(accessRes.verified);

      // 2. Fetch categories
      const catRes = await getCategories();
      setCategories(catRes.categories || []);

      // 3. Fetch public updates
      const upRes = await getPublicUpdates();
      setPublicUpdates(upRes.updates || []);

      // 4. Check if a reviewer is logged in
      try {
        const revRes = await getReviewerMe();
        if (revRes.reviewer) {
          setActiveReviewer(revRes.reviewer);
          const listRes = await getReviewerList();
          setAllReviewers(listRes.reviewers || []);
        }
      } catch {
        // Not logged in as reviewer - standard anonymous mode
      }
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  // Staff Access Gate Handler
  const handleVerifyAccess = async (code: string) => {
    try {
      const res = await verifyStaffAccess(code);
      if (res.success) {
        setIsStaffVerified(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Feedback Submission Handler
  const handleSubmitFeedback = async (payload: any) => {
    return submitFeedback(payload);
  };

  const handleSubmissionSuccess = (data: { public_id: string; secret: string; category_name: string }) => {
    setLatestSubmission(data);
    setActiveSecret(data.secret);
    navigateTo('confirmation');
  };

  // Check a Response by Secret Code
  const handleOpenConversationBySecret = async (secret: string) => {
    setCheckSecretLoading(true);
    setCheckSecretError(null);
    try {
      const res = await accessConversation(secret);
      if (res.success) {
        setActiveSecret(secret);
        setConversationData(res.conversation);
        setIsCheckResponseOpen(false);
        navigateTo('conversation');
      }
    } catch (err: any) {
      setCheckSecretError(err.message || 'Invalid conversation secret');
    } finally {
      setCheckSecretLoading(false);
    }
  };

  const handleRefreshConversation = async () => {
    if (!activeSecret) return;
    try {
      const res = await accessConversation(activeSecret);
      if (res.success) {
        setConversationData(res.conversation);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  // Load Reviewer Workspace Data
  const loadReviewerData = async () => {
    if (!activeReviewer) return;

    if (activeReviewer.role === 'action_owner') {
      setCurrentView('action_owner');
      return;
    }
    if (activeReviewer.role === 'leadership_viewer') {
      setCurrentView('leadership_dashboard');
      return;
    }

    try {
      const res = await getReviewerFeedback({
        tab: reviewerTab,
        category: reviewerCategory,
        search: reviewerSearch,
        sort: reviewerSort,
      });
      setFeedbackList(res.feedback || []);
      if (res.stats) {
        setReviewerStats(res.stats);
      }
    } catch (err) {
      console.error('Error loading reviewer feedback:', err);
    }
  };

  useEffect(() => {
    if (currentView === 'reviewer_workspace' && activeReviewer) {
      loadReviewerData();
    }
  }, [currentView, reviewerTab, reviewerCategory, reviewerSearch, reviewerSort, activeReviewer]);

  // Load Feedback Detail
  const handleSelectFeedback = async (publicId: string) => {
    setSelectedPublicId(publicId);
    try {
      const detail = await getReviewerFeedbackDetail(publicId);
      setFeedbackDetail(detail.feedback);
      setDetailMessages(detail.messages || []);
      setDetailInternalNotes(detail.internal_notes || []);
      setDetailHistory(detail.history || []);
      navigateTo('reviewer_detail');
    } catch (err: any) {
      alert(err.message || 'Failed to open feedback detail');
    }
  };

  const refreshDetail = async () => {
    if (!selectedPublicId) return;
    try {
      const detail = await getReviewerFeedbackDetail(selectedPublicId);
      setFeedbackDetail(detail.feedback);
      setDetailMessages(detail.messages || []);
      setDetailInternalNotes(detail.internal_notes || []);
      setDetailHistory(detail.history || []);
    } catch (err) {
      console.error('Error refreshing detail:', err);
    }
  };

  // Reviewer Login / Logout
  const handleReviewerLoginSuccess = async (reviewer: any) => {
    setActiveReviewer(reviewer);
    const listRes = await getReviewerList();
    setAllReviewers(listRes.reviewers || []);
    setViewHistory(['landing']);

    if (reviewer.role === 'admin') {
      setCurrentView('admin_settings');
    } else if (reviewer.role === 'action_owner') {
      setCurrentView('action_owner');
    } else if (reviewer.role === 'leadership_viewer') {
      setCurrentView('leadership_dashboard');
    } else {
      setCurrentView('reviewer_workspace');
    }
  };

  const handleReviewerLogout = async () => {
    await reviewerLogout();
    setActiveReviewer(null);
    setViewHistory([]);
    setCurrentView('landing');
  };

  const handleSwitchReviewer = async (reviewerId: string) => {
    const target = allReviewers.find(r => r.id === reviewerId);
    if (!target) return;
    try {
      const res = await reviewerLogin(target.email, 'Password123!');
      if (res.success) {
        handleReviewerLoginSuccess(res.reviewer);
      }
    } catch (err) {
      console.error('Failed to switch reviewer:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Global Modals */}
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <CheckResponseModal
        isOpen={isCheckResponseOpen}
        onClose={() => setIsCheckResponseOpen(false)}
        onSubmitSecret={handleOpenConversationBySecret}
        isLoading={checkSecretLoading}
        error={checkSecretError}
      />

      {/* VIEW ROUTING */}

      {/* 1. Landing Page (PDF Page 1) */}
      {currentView === 'landing' && (
        <>
          <Navbar
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onOpenCheckResponse={() => setIsCheckResponseOpen(true)}
            onNavigateHome={() => navigateTo('landing')}
            onOpenReviewerPortal={() => {
              navigateTo('reviewer_login');
            }}
            reviewerUser={activeReviewer}
          />
          <LandingPage
            onStartFeedback={() => {
              navigateTo('new_feedback');
              if (categories.length === 0) {
                getCategories()
                  .then(catRes => {
                    if (catRes?.categories) setCategories(catRes.categories);
                  })
                  .catch(() => {});
              }
            }}
            onCheckResponse={() => setIsCheckResponseOpen(true)}
            onSeeWhatChanged={() => navigateTo('you_said_we_did')}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onVerifyAccessCode={handleVerifyAccess}
            isStaffVerified={isStaffVerified}
          />
        </>
      )}

      {/* 2. New Feedback Form (PDF Page 2) */}
      {currentView === 'new_feedback' && (
        <FeedbackForm
          categories={categories}
          onCancel={goBack}
          onSubmitSuccess={handleSubmissionSuccess}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}

      {/* 3. Feedback Submitted Confirmation (PDF Page 3) */}
      {currentView === 'confirmation' && latestSubmission && (
        <SubmissionConfirmation
          publicId={latestSubmission.public_id}
          secret={latestSubmission.secret}
          categoryName={latestSubmission.category_name}
          onGoToConversation={(secret) => handleOpenConversationBySecret(secret)}
          onBackToHome={() => navigateTo('landing')}
        />
      )}

      {/* 4. Anonymous Follow-up Conversation (PDF Page 4) */}
      {currentView === 'conversation' && (
        <AnonymousConversation
          secret={activeSecret}
          conversationData={conversationData}
          onClose={goBack}
          onSendReply={async (secret, msg) => {
            const res = await replyToConversation(secret, msg);
            await handleRefreshConversation();
            return res;
          }}
          onRefresh={handleRefreshConversation}
        />
      )}

      {/* 5. Reviewer Workspace (PDF Page 5) */}
      {currentView === 'reviewer_workspace' && activeReviewer && (
        <ReviewerWorkspace
          reviewer={activeReviewer}
          feedbackList={feedbackList}
          stats={reviewerStats}
          categories={categories}
          currentTab={reviewerTab}
          onTabChange={setReviewerTab}
          selectedCategory={reviewerCategory}
          onCategoryChange={setReviewerCategory}
          searchQuery={reviewerSearch}
          onSearchChange={setReviewerSearch}
          sortOrder={reviewerSort}
          onSortChange={setReviewerSort}
          onSelectFeedback={handleSelectFeedback}
          onNavigateUpdatesBoard={() => navigateTo('you_said_we_did')}
          onNavigateSettings={() => navigateTo('admin_settings')}
          onNavigateActions={() => navigateTo('action_owner')}
          onNavigateLeadership={() => navigateTo('leadership_dashboard')}
          onLogout={handleReviewerLogout}
          onSwitchReviewer={handleSwitchReviewer}
          allReviewers={allReviewers}
          onBack={goBack}
        />
      )}

      {/* 6. Reviewer Detail (PDF Page 6) */}
      {currentView === 'reviewer_detail' && activeReviewer && feedbackDetail && (
        <div className="workspace-layout">
          {/* Dark sidebar (matches PDF page 6 image) */}
          <aside className="workspace-sidebar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Brand */}
              <BrandLogo variant="light" style={{ paddingLeft: '8px', marginBottom: '32px' }} />
              {/* Nav */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: 'Inbox', tab: 'unread' },
                  { label: 'Assigned', tab: 'assigned' },
                  { label: 'Resolved', tab: 'resolved' },
                ].map(({ label, tab }) => (
                  <button
                    key={tab}
                    onClick={() => { setReviewerTab(tab); navigateTo('reviewer_workspace'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: '10px',
                      backgroundColor: 'transparent', color: '#94a3b8',
                      fontWeight: 600, fontSize: '14px', fontFamily: 'var(--font-controls)',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>
            {/* Back to workspace */}
            <button
              onClick={goBack}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 14px', borderRadius: '10px',
                backgroundColor: 'transparent', color: '#94a3b8',
                fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-controls)',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          </aside>

          {/* Main content: ReviewerDetail */}
          <ReviewerDetail
            reviewer={activeReviewer}
            feedbackItem={feedbackDetail}
            messages={detailMessages}
            internalNotes={detailInternalNotes}
            history={detailHistory}
            allReviewers={allReviewers}
            onBack={goBack}
            onSendReply={async (msg) => {
              const res = await sendReviewerReply(feedbackDetail.public_id, msg);
              await refreshDetail();
              return res;
            }}
            onAddInternalNote={async (note) => {
              const res = await addInternalNote(feedbackDetail.public_id, note);
              await refreshDetail();
              return res;
            }}
            onUpdateStatus={async (status, reason) => {
              const res = await updateFeedbackStatus(feedbackDetail.public_id, status, reason);
              await refreshDetail();
              return res;
            }}
            onAssignReviewer={async (revId) => {
              const res = await assignReviewer(feedbackDetail.public_id, revId);
              await refreshDetail();
              return res;
            }}
            onRouteAlternate={async (altId, excludeId) => {
              const res = await routeToAlternateReviewer(feedbackDetail.public_id, altId, excludeId);
              await loadReviewerData();
              return res;
            }}
            onCreateAction={async (payload) => {
              const res = await createRedactedAction(feedbackDetail.public_id, payload);
              await refreshDetail();
              return res;
            }}
            onPublishUpdate={async (payload) => {
              const res = await publishPublicUpdate(feedbackDetail.public_id, payload);
              const upRes = await getPublicUpdates();
              setPublicUpdates(upRes.updates || []);
              await refreshDetail();
              return res;
            }}
          />
        </div>
      )}


      {/* 7. You Said, We Did Updates Board (PDF Page 7) */}
      {currentView === 'you_said_we_did' && (
        <YouSaidWeDid
          updates={publicUpdates}
          onBack={goBack}
        />
      )}

      {/* 8. Reviewer Login Portal */}
      {currentView === 'reviewer_login' && (
        <ReviewerLogin
          onBack={goBack}
          onLoginSuccess={handleReviewerLoginSuccess}
          onLogin={reviewerLogin}
        />
      )}

      {/* 9. Admin Settings & Governance */}
      {currentView === 'admin_settings' && activeReviewer && (
        <AdminSettings
          reviewer={activeReviewer}
          onBack={goBack}
          onLogout={handleReviewerLogout}
          onNavigateLeadership={() => navigateTo('leadership_dashboard')}
          onNavigateWorkspace={() => navigateTo('reviewer_workspace')}
        />
      )}

      {/* 10. Action Owner Workspace */}
      {currentView === 'action_owner' && activeReviewer && (
        <ActionOwnerWorkspace
          reviewer={activeReviewer}
          onBack={goBack}
        />
      )}

      {/* 11. Leadership Insights */}
      {currentView === 'leadership_dashboard' && activeReviewer && (
        <LeadershipDashboard
          reviewer={activeReviewer}
          onBack={goBack}
          onNavigateUpdatesBoard={() => navigateTo('you_said_we_did')}
        />
      )}
    </div>
  );
}
