// Client API module for D'Creativs OpenLine

const BASE_URL = '/api';

export async function fetchJson(url: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

// 1. Staff Access Gate
export async function verifyStaffAccess(code: string) {
  return fetchJson('/access/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function checkStaffAccess() {
  return fetchJson('/access/status');
}

// 2. Anonymous Feedback & Categories
export async function getCategories() {
  return fetchJson('/feedback/categories');
}

export async function submitFeedback(payload: {
  category_id: string;
  subject?: string;
  message: string;
  suggested_improvement?: string;
  share_in_updates_consent?: boolean;
  routing_choice?: string;
  idempotency_key?: string;
}) {
  return fetchJson('/feedback/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// 3. Anonymous Conversation
export async function accessConversation(secret: string) {
  return fetchJson('/conversation/access', {
    method: 'POST',
    body: JSON.stringify({ secret }),
  });
}

export async function replyToConversation(secret: string, message: string) {
  return fetchJson('/conversation/reply', {
    method: 'POST',
    body: JSON.stringify({ secret, message }),
  });
}

// 4. Public "You Said, We Did" Updates
export async function getPublicUpdates() {
  return fetchJson('/updates');
}

// 5. Reviewer Workspace
export async function reviewerLogin(email: string, password: string) {
  return fetchJson('/reviewer/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function reviewerLogout() {
  return fetchJson('/reviewer/logout', { method: 'POST' });
}

export async function getReviewerMe() {
  return fetchJson('/reviewer/me');
}

export async function getReviewerList() {
  return fetchJson('/reviewer/list');
}

export async function getReviewerFeedback(params: {
  tab?: string;
  category?: string;
  search?: string;
  sort?: string;
}) {
  const q = new URLSearchParams();
  if (params.tab) q.set('tab', params.tab);
  if (params.category) q.set('category', params.category);
  if (params.search) q.set('search', params.search);
  if (params.sort) q.set('sort', params.sort);
  return fetchJson(`/reviewer/feedback?${q.toString()}`);
}

export async function getReviewerFeedbackDetail(publicId: string) {
  return fetchJson(`/reviewer/feedback/${publicId}`);
}

export async function sendReviewerReply(publicId: string, message: string) {
  return fetchJson(`/reviewer/feedback/${publicId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function addInternalNote(publicId: string, note: string) {
  return fetchJson(`/reviewer/feedback/${publicId}/internal-note`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

export async function updateFeedbackStatus(publicId: string, status: string, reason?: string) {
  return fetchJson(`/reviewer/feedback/${publicId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status, reason }),
  });
}

export async function assignReviewer(publicId: string, reviewer_id: string) {
  return fetchJson(`/reviewer/feedback/${publicId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ reviewer_id }),
  });
}

export async function routeToAlternateReviewer(publicId: string, alternate_reviewer_id: string, exclude_reviewer_id?: string) {
  return fetchJson(`/reviewer/feedback/${publicId}/route-alternate`, {
    method: 'POST',
    body: JSON.stringify({ alternate_reviewer_id, exclude_reviewer_id }),
  });
}

export async function createRedactedAction(publicId: string, payload: {
  action_title: string;
  redacted_description: string;
  action_owner_id?: string;
  target_date?: string;
}) {
  return fetchJson(`/reviewer/feedback/${publicId}/create-action`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function publishPublicUpdate(publicId: string, payload: {
  staff_perspective: string;
  our_response: string;
  status?: string;
}) {
  return fetchJson(`/reviewer/feedback/${publicId}/publish-update`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getActionOwnerTasks() {
  return fetchJson('/reviewer/actions');
}

export async function updateActionStatus(id: number, status: string) {
  return fetchJson(`/reviewer/actions/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export async function getLeadershipMetrics() {
  return fetchJson('/reviewer/metrics');
}

// 6. Admin APIs
export async function getAdminSettings() {
  return fetchJson('/admin/settings');
}

export async function rotateStaffAccessCode(new_access_code: string) {
  return fetchJson('/admin/rotate-access-code', {
    method: 'POST',
    body: JSON.stringify({ new_access_code }),
  });
}

export async function updateRetentionSettings(payload: {
  general_retention_days: number;
  sensitive_retention_days: number;
  min_reporting_threshold: number;
}) {
  return fetchJson('/admin/retention-settings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAdminCategories() {
  return fetchJson('/admin/categories');
}

export async function createAdminCategory(payload: any) {
  return fetchJson('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCategory(id: string, payload: any) {
  return fetchJson(`/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function getAdminReviewers() {
  return fetchJson('/admin/reviewers');
}

export async function purgeExpiredRetention() {
  return fetchJson('/admin/purge-expired', {
    method: 'POST',
  });
}

export async function getAdminAuditLogs() {
  return fetchJson('/admin/audit-logs');
}
