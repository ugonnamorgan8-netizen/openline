import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Key,
  ShieldAlert,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Users,
  Eye,
  FileText
} from 'lucide-react';
import {
  getAdminSettings,
  rotateStaffAccessCode,
  updateRetentionSettings,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  getAdminReviewers,
  purgeExpiredRetention,
  getAdminAuditLogs
} from '../api.js';

interface AdminSettingsProps {
  reviewer: any;
  onBack: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ reviewer, onBack }) => {
  const [activeTab, setActiveTab] = useState<'access' | 'categories' | 'retention' | 'audit'>('access');
  const [newAccessCode, setNewAccessCode] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New category form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catSensitive, setCatSensitive] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'access' || activeTab === 'retention') {
        const sRes = await getAdminSettings();
        setSettings(sRes.settings);
      }
      if (activeTab === 'categories') {
        const cRes = await getAdminCategories();
        setCategories(cRes.categories);
      }
      if (activeTab === 'audit') {
        const aRes = await getAdminAuditLogs();
        setAuditLogs(aRes.audit_logs);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load configuration');
    }
  };

  const handleRotateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccessCode.trim()) return;
    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
      await rotateStaffAccessCode(newAccessCode.trim());
      setMessage('Shared staff access code successfully rotated!');
      setNewAccessCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to rotate access code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRetention = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
      await updateRetentionSettings({
        general_retention_days: settings.general_retention_days,
        sensitive_retention_days: settings.sensitive_retention_days,
        min_reporting_threshold: settings.min_reporting_threshold,
      });
      setMessage('Retention and privacy threshold configuration saved!');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurge = async () => {
    if (!window.confirm('Execute retention purge for expired records? This will purge expired messages and secret hashes.')) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await purgeExpiredRetention();
      setMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Purge failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catDesc.trim()) return;
    try {
      const id = 'cat-' + catName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await createAdminCategory({
        id,
        name: catName.trim(),
        description: catDesc.trim(),
        icon: 'message-square',
        is_sensitive: catSensitive,
        default_reviewer_ids: ['rev-elena']
      });
      setCatName('');
      setCatDesc('');
      setCatSensitive(false);
      setMessage(`Category "${catName}" added!`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px clamp(16px, 4vw, 40px)', overflowX: 'hidden', boxSizing: 'border-box', width: '100%', maxWidth: '100vw' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            aria-label="Back"
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: '#0f172a' }}>
              System Administration & Governance
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#64748b' }}>
              Logged in as: {reviewer.name} ({reviewer.title}) • Role: System Administrator
            </p>
          </div>
        </div>
      </div>

      {/* Role Notice */}
      <div style={{
        backgroundColor: '#eef2ff',
        border: '1px solid #c7d2fe',
        borderRadius: '14px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '28px',
      }}>
        <ShieldAlert size={20} color="#4f46e5" style={{ flexShrink: 0 }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#3730a3', lineHeight: 1.45 }}>
          <strong>Role Separation Enforced:</strong> As System Administrator, you manage accounts, access codes, categories, and retention policies. Per product security architecture, this role does not have application-level permission to view feedback message bodies.
        </p>
      </div>

      {message && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-body)' }}>
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-body)' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Admin Tabs */}
      <div style={{
        display: 'flex',
        gap: '20px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '28px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '2px',
      }}>
        <button
          onClick={() => setActiveTab('access')}
          style={{
            paddingBottom: '12px',
            fontSize: '13.5px',
            fontWeight: activeTab === 'access' ? 700 : 600,
            color: activeTab === 'access' ? '#0f172a' : '#64748b',
            borderBottom: activeTab === 'access' ? '2px solid #4f46e5' : 'none',
            fontFamily: 'var(--font-controls)',
            whiteSpace: 'nowrap',
          }}
        >
          Staff Access Gate
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          style={{
            paddingBottom: '12px',
            fontSize: '13.5px',
            fontWeight: activeTab === 'categories' ? 700 : 600,
            color: activeTab === 'categories' ? '#0f172a' : '#64748b',
            borderBottom: activeTab === 'categories' ? '2px solid #4f46e5' : 'none',
            fontFamily: 'var(--font-controls)',
            whiteSpace: 'nowrap',
          }}
        >
          Category Management
        </button>

        <button
          onClick={() => setActiveTab('retention')}
          style={{
            paddingBottom: '12px',
            fontSize: '14px',
            fontWeight: activeTab === 'retention' ? 700 : 500,
            color: activeTab === 'retention' ? '#0f172a' : '#64748b',
            borderBottom: activeTab === 'retention' ? '2px solid #4f46e5' : 'none',
          }}
        >
          Retention & Governance
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            paddingBottom: '12px',
            fontSize: '14px',
            fontWeight: activeTab === 'audit' ? 700 : 500,
            color: activeTab === 'audit' ? '#0f172a' : '#64748b',
            borderBottom: activeTab === 'audit' ? '2px solid #4f46e5' : 'none',
          }}
        >
          Reviewer Audit Logs
        </button>
      </div>

      {/* TAB 1: Staff Access Gate */}
      {activeTab === 'access' && (
        <div style={{ maxWidth: '600px' }}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Rotate Shared Staff Access Code</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              The access code is a shared gate distributed to all team members and tutors.
              Rotating it updates the gate immediately.
            </p>

            <form onSubmit={handleRotateCode}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  New Staff Access Code (minimum 6 characters)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DCREATIVS-SPRING-2025"
                  value={newAccessCode}
                  onChange={(e) => setNewAccessCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !newAccessCode.trim()}
                className="btn-primary-pill"
                style={{ padding: '10px 24px', fontSize: '14px' }}
              >
                Rotate Access Code
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Category Management */}
      {activeTab === 'categories' && (
        <div>
          <div className="card" style={{ marginBottom: '28px', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Add New Topic Category</h3>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Academy Equipment & Software"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Description</label>
                <input
                  type="text"
                  placeholder="Short description guiding contributors..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="cat-sensitive-toggle"
                  checked={catSensitive}
                  onChange={(e) => setCatSensitive(e.target.checked)}
                />
                <label htmlFor="cat-sensitive-toggle" style={{ fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  Mark as Sensitive Concern (enforces designated reviewer routing & shorter retention)
                </label>
              </div>
              <button
                type="submit"
                disabled={!catName.trim() || !catDesc.trim()}
                className="btn-primary-pill"
                style={{ width: 'fit-content', padding: '8px 20px', fontSize: '13px' }}
              >
                Create Category
              </button>
            </form>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
            {categories.map((c) => (
              <div key={c.id} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{c.name}</h4>
                  {c.is_sensitive && (
                    <span className="badge" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Sensitive</span>
                  )}
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748b' }}>{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Retention & Governance */}
      {activeTab === 'retention' && settings && (
        <div style={{ maxWidth: '640px' }}>
          <div className="card" style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Data Retention Periods & Minimum Thresholds</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Configure automatic lifecycle policies and privacy thresholds to prevent identification.
            </p>

            <form onSubmit={handleSaveRetention} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  General Feedback Retention (Days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="730"
                  value={settings.general_retention_days}
                  onChange={(e) => setSettings({ ...settings, general_retention_days: parseInt(e.target.value) || 180 })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Sensitive Concern Retention (Days)
                </label>
                <input
                  type="number"
                  min="14"
                  max="365"
                  value={settings.sensitive_retention_days}
                  onChange={(e) => setSettings({ ...settings, sensitive_retention_days: parseInt(e.target.value) || 90 })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Minimum Reporting Count Threshold (Privacy Suppression)
                </label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={settings.min_reporting_threshold}
                  onChange={(e) => setSettings({ ...settings, min_reporting_threshold: parseInt(e.target.value) || 5 })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Aggregated counts below this threshold are suppressed in leadership reporting to prevent deductive deanonymization.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary-pill"
                style={{ width: 'fit-content', padding: '10px 24px', fontSize: '14px' }}
              >
                Save Policies
              </button>
            </form>
          </div>

          {/* Purge execution card */}
          <div className="card" style={{ borderColor: '#fca5a5', backgroundColor: '#fff5f5' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
              Execute Data Retention Purge
            </h3>
            <p style={{ fontSize: '13px', color: '#7f1d1d', marginBottom: '16px' }}>
              Run the documented deletion process. Any feedback exceeding its retention period is permanently purged, and conversation secret hashes are deleted.
            </p>
            <button
              onClick={handlePurge}
              disabled={isLoading}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '9px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Trash2 size={16} />
              <span>Purge Expired Records Now</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Reviewer Audit Logs */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Reviewer Action Audit Trail</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#64748b' }}>
              Logs privileged reviewer activities. Confirmed: Message bodies and conversation secrets are strictly excluded from logs.
            </p>
          </div>

          {/* Dual-axis scrollable table for mobile */}
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '480px', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'var(--font-controls)' }}>
                  <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Reviewer</th>
                  <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Action Type</th>
                  <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Details Sanitized</th>
                  <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-body)', fontSize: '13px' }}>
                      No audit log entries found.
                    </td>
                  </tr>
                ) : auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>{log.reviewer_name || 'System'}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span className="badge badge-suggestion" style={{ fontSize: '10px', fontFamily: 'var(--font-controls)' }}>{log.action_type}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#475569', maxWidth: '260px', overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                      {JSON.stringify(log.details_json)}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
