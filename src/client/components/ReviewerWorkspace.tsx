import React, { useState } from 'react';
import {
  Inbox,
  UserCheck,
  CheckCircle,
  Megaphone,
  Settings,
  Search,
  Bell,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ClipboardList,
  BarChart3,
  Menu,
  X,
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { changeReviewerPassword } from '../api.js';
import chroAvatar from '../assets/chro-avatar.png';
import cooAvatar from '../assets/coo-avatar.png';

const getAvatarUrl = (avatarUrl?: string, revId?: string, title?: string, name?: string) => {
  if (avatarUrl && avatarUrl.trim() !== '') return avatarUrl;
  const isChro = revId === 'rev-akparanta-estella' || title?.toUpperCase().includes('CHRO') || name?.toLowerCase().includes('estella');
  if (isChro) return chroAvatar;
  const isCoo = revId === 'rev-morgan-ugonna' || title?.toUpperCase().includes('COO') || name?.toLowerCase().includes('morgan');
  if (isCoo) return cooAvatar;
  return chroAvatar;
};

interface ReviewerWorkspaceProps {
  reviewer: any;
  feedbackList: any[];
  stats: any;
  categories: any[];
  currentTab: string;
  onTabChange: (tab: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOrder: string;
  onSortChange: (sort: string) => void;
  onSelectFeedback: (publicId: string) => void;
  onNavigateUpdatesBoard: () => void;
  onNavigateSettings: () => void;
  onNavigateActions: () => void;
  onNavigateLeadership: () => void;
  onLogout: () => void;
  onSwitchReviewer: (reviewerId: string) => void;
  allReviewers: any[];
  onBack?: () => void;
}

export const ReviewerWorkspace: React.FC<ReviewerWorkspaceProps> = ({
  reviewer,
  feedbackList,
  stats,
  categories,
  currentTab,
  onTabChange,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
  onSelectFeedback,
  onNavigateUpdatesBoard,
  onNavigateSettings,
  onNavigateActions,
  onNavigateLeadership,
  onLogout,
  onSwitchReviewer,
  allReviewers,
  onBack,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemsPerPage = 6;

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccess(null);
    setPwdError(null);
    if (!currentPassword) {
      setPwdError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirmation do not match.');
      return;
    }
    setPwdLoading(true);
    try {
      await changeReviewerPassword(currentPassword, newPassword);
      setPwdSuccess('Password successfully updated! Keep your new password safe for your next login.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  // Pagination slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = feedbackList.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(feedbackList.length / itemsPerPage) || 1;

  const getCategoryBadgeClass = (categoryName: string) => {
    const lower = (categoryName || '').toLowerCase();
    if (lower.includes('concern')) return 'badge-concern';
    if (lower.includes('suggestion')) return 'badge-suggestion';
    if (lower.includes('positive') || lower.includes('praise')) return 'badge-positive';
    return 'badge-suggestion';
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = Date.now();
      const past = new Date(dateStr).getTime();
      const diffHrs = Math.floor((now - past) / (1000 * 60 * 60));
      if (diffHrs < 1) return 'JUST NOW';
      if (diffHrs < 24) return `${diffHrs}H AGO`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays === 1) return 'YESTERDAY';
      return `${diffDays}D AGO`;
    } catch {
      return 'RECENT';
    }
  };

  return (
    <div className="workspace-layout">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`sidebar-backdrop ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Top Header Bar */}
      <header className="workspace-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back"
              style={{
                color: '#ffffff',
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12.5px',
                fontWeight: 600,
                fontFamily: 'var(--font-controls)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          )}
          <BrandLogo variant="light" onClick={() => { onTabChange('unread'); setMobileMenuOpen(false); }} />
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            fontWeight: 600,
            fontFamily: 'var(--font-controls)',
          }}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          <span>Menu</span>
        </button>
      </header>

      {/* Dark Sidebar matching Page 5 */}
      <aside className={`workspace-sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        {/* Top brand & nav */}
        <div>
          <BrandLogo variant="light" style={{ paddingLeft: '8px', marginBottom: '20px' }} />

          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 12px',
                marginBottom: '18px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-controls)',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                width: '100%',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              <ArrowLeft size={15} />
              <span>← Back</span>
            </button>
          )}

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Inbox */}
            <button
              onClick={() => onTabChange('unread')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: currentTab === 'unread' ? '#1e293b' : 'transparent',
                color: currentTab === 'unread' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '14px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Inbox size={18} />
                <span>Inbox</span>
              </div>
              {stats.unread > 0 && (
                <span style={{
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                }}>
                  {stats.unread}
                </span>
              )}
            </button>

            {/* Assigned */}
            <button
              onClick={() => onTabChange('assigned')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: currentTab === 'assigned' ? '#1e293b' : 'transparent',
                color: currentTab === 'assigned' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              <UserCheck size={18} />
              <span>Assigned</span>
            </button>

            {/* Resolved */}
            <button
              onClick={() => onTabChange('resolved')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: currentTab === 'resolved' ? '#1e293b' : 'transparent',
                color: currentTab === 'resolved' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              <CheckCircle size={18} />
              <span>Resolved</span>
            </button>

            {/* Updates Board */}
            <button
              onClick={onNavigateUpdatesBoard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                color: '#94a3b8',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              <Megaphone size={18} />
              <span>Updates Board</span>
            </button>

            {/* Action Owner Tasks (David Chen role) */}
            <button
              onClick={onNavigateActions}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                color: '#94a3b8',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              <ClipboardList size={18} />
              <span>Action Tasks</span>
            </button>

            {/* Leadership Metrics (Sarah Miller role) */}
            <button
              onClick={onNavigateLeadership}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                color: '#94a3b8',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              <BarChart3 size={18} />
              <span>Leadership Metrics</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                onTabChange('settings');
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: currentTab === 'settings' ? '#1e293b' : 'transparent',
                color: currentTab === 'settings' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                fontFamily: 'var(--font-controls)',
              }}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Profile & Role Switcher */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <img
              src={getAvatarUrl(reviewer.avatar_url, reviewer.id, reviewer.title, reviewer.name)}
              alt={reviewer.name}
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {reviewer.name}
              </p>
              <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {reviewer.title}
              </p>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              style={{ color: '#64748b', padding: '4px', borderRadius: '6px' }}
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Quick role switcher for pair-programming and testing */}
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Switch Active Role:</div>
          <select
            value={reviewer.id}
            onChange={(e) => onSwitchReviewer(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '6px 8px',
              fontSize: '11.5px',
            }}
          >
            {allReviewers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.role})
              </option>
            ))}
          </select>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="workspace-main">
        {currentTab === 'settings' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: '#0f172a' }}>
                  Account & Security Settings
                </h1>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#64748b' }}>
                  Manage your credentials and security preferences as a designated board reviewer.
                </p>
              </div>

              {reviewer.role === 'admin' && (
                <button
                  onClick={onNavigateSettings}
                  className="btn-secondary-pill"
                  style={{ fontFamily: 'var(--font-controls)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Settings size={16} />
                  <span>Open System Admin Portal</span>
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '24px', alignItems: 'flex-start' }}>
              {/* Change Password Card */}
              <div className="card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                    <Key size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Change Password</h3>
                    <p style={{ fontSize: '12.5px', color: '#64748b' }}>
                      Minimum 8 characters. Enter current password to verify.
                    </p>
                  </div>
                </div>

                {pwdSuccess && (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} />
                    <span>{pwdSuccess}</span>
                  </div>
                )}

                {pwdError && (
                  <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{pwdError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Current Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPwd ? 'text' : 'password'}
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 38px 10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                        style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      New Password (min 8 characters)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPwd ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 38px 10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 38px 10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                        style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ paddingTop: '6px' }}>
                    <button
                      type="submit"
                      disabled={pwdLoading}
                      className="btn-primary-pill"
                      style={{ padding: '10px 24px', fontSize: '13.5px', width: '100%' }}
                    >
                      {pwdLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Profile Details Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card" style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
                    Reviewer Profile
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <img
                      src={getAvatarUrl(reviewer.avatar_url, reviewer.id, reviewer.title, reviewer.name)}
                      alt={reviewer.name}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{reviewer.name}</p>
                      <p style={{ fontSize: '12.5px', color: '#64748b' }}>{reviewer.title}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Email:</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{reviewer.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Department:</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{reviewer.department || 'Executive'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Security Role:</span>
                      <span style={{ fontWeight: 700, color: '#4f46e5' }}>{reviewer.role?.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '2px' }}>
                      <span style={{ color: '#64748b' }}>Status:</span>
                      <span style={{ fontWeight: 600, color: '#15803d' }}>Active Authorized Reviewer</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#eef2ff',
                  border: '1px solid #c7d2fe',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  display: 'flex',
                  gap: '12px',
                }}>
                  <ShieldCheck size={20} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#3730a3', marginBottom: '4px' }}>
                      D'Creativs Confidentiality Protocol
                    </p>
                    <p style={{ fontSize: '12.5px', color: '#4338ca', lineHeight: 1.45 }}>
                      All submissions are cryptographically isolated. Reviewers should change their default password to maintain internal privacy standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Top bar with search and workspace title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: '#0f172a' }}>
                Reviewer Workspace
              </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 240px', maxWidth: '380px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 38px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  fontSize: '13.5px',
                  fontFamily: 'var(--font-controls)',
                  color: '#0f172a',
                }}
              />
            </div>
            <button
              aria-label="Notifications"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                flexShrink: 0,
              }}
            >
              <Bell size={18} />
            </button>
          </div>
        </div>

        {/* 3 Metric Cards matching Page 5 */}
        <div className="stats-grid-responsive" style={{ marginBottom: '32px' }}>
          {/* Awaiting Response */}
          <div className="card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>
                IN REVIEW
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
                {String(stats.awaiting_response).padStart(2, '0')}
              </h2>
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#ede9fe',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <RotateCcw size={18} />
            </div>
          </div>

          {/* Overdue Follow-up */}
          <div className="card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>
                OVERDUE FOLLOW-UP
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: '#dc2626' }}>
                {String(stats.overdue).padStart(2, '0')}
              </h2>
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertCircle size={18} />
            </div>
          </div>

          {/* New This Week */}
          <div className="card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>
                NEW THIS WEEK
              </p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>
                {String(stats.new_this_week).padStart(2, '0')}
              </h2>
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <HelpCircle size={18} />
            </div>
          </div>
        </div>

        {/* Tabs & Filter Bar matching Page 5 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              onClick={() => onTabChange('unread')}
              style={{
                fontSize: '14.5px',
                fontWeight: currentTab === 'unread' ? 700 : 600,
                color: currentTab === 'unread' ? '#0f172a' : '#64748b',
                position: 'relative',
                paddingBottom: '12px',
                marginBottom: '-13px',
                borderBottom: currentTab === 'unread' ? '2.5px solid #0f172a' : 'none',
                fontFamily: 'var(--font-controls)',
              }}
            >
              Unread ({stats.unread})
            </button>

            <button
              onClick={() => onTabChange('all')}
              style={{
                fontSize: '14.5px',
                fontWeight: currentTab === 'all' ? 700 : 600,
                color: currentTab === 'all' ? '#0f172a' : '#64748b',
                position: 'relative',
                paddingBottom: '12px',
                marginBottom: '-13px',
                borderBottom: currentTab === 'all' ? '2.5px solid #0f172a' : 'none',
                fontFamily: 'var(--font-controls)',
              }}
            >
              All ({stats.total})
            </button>
          </div>

          {/* Dropdown Filters */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                color: '#334155',
                fontWeight: 500,
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => onSortChange(e.target.value)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                color: '#334155',
                fontWeight: 500,
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Feedback List matching Page 5 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
          {paginatedItems.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              padding: '60px 20px',
              textAlign: 'center',
              color: '#64748b',
            }}>
              <Inbox size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>No feedback found</p>
              <p style={{ fontSize: '13px' }}>Try switching tabs or adjusting search criteria.</p>
            </div>
          ) : (
            paginatedItems.map((item) => (
              <div
                key={item.public_id}
                onClick={() => onSelectFeedback(item.public_id)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: 'clamp(14px, 3vw, 20px) clamp(16px, 3vw, 24px)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                }}
              >
                <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                  {/* Category & Status Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span className={`badge ${getCategoryBadgeClass(item.category_name)}`}>
                      {item.category_name}
                    </span>
                    {item.is_overdue && (
                      <span className="badge badge-overdue">
                        OVERDUE
                      </span>
                    )}
                    {item.is_sensitive && (
                      <span className="badge" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                        SENSITIVE
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    {item.subject || `${item.category_name} Feedback`}
                  </h3>

                  {/* Message Preview */}
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.snippet}
                  </p>
                </div>

                {/* Right side: Time & Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-controls)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', color: '#94a3b8' }}>
                    {formatTimeAgo(item.created_at)}
                  </span>
                  <img
                    src={getAvatarUrl(item.assigned_reviewer_avatar, item.assigned_reviewer_id, undefined, item.assigned_reviewer_name)}
                    alt={item.assigned_reviewer_name || 'Reviewer'}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination matching Page 5 (< 1 2 3 >) */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentPage === 1 ? '#cbd5e1' : '#475569',
                backgroundColor: '#ffffff',
                fontFamily: 'var(--font-controls)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: currentPage === pg ? '#4f46e5' : '#ffffff',
                  color: currentPage === pg ? '#ffffff' : '#475569',
                  border: currentPage === pg ? 'none' : '1px solid #e2e8f0',
                  fontFamily: 'var(--font-controls)',
                  cursor: 'pointer',
                }}
              >
                {pg}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentPage === totalPages ? '#cbd5e1' : '#475569',
                backgroundColor: '#ffffff',
                fontFamily: 'var(--font-controls)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        </>
      )}
      </main>
    </div>
  );
};
