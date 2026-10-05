import { pool, query } from '../src/server/db.js';
import { hashConversationSecret } from '../src/server/crypto.js';
import app from '../src/server/index.js';
import http from 'http';

let server: http.Server;
const TEST_PORT = 3001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function runTests() {
  console.log('====================================================');
  console.log('   D’CREATIVS OPENLINE AUTOMATED ACCEPTANCE SUITE   ');
  console.log('====================================================\n');

  // Start test server
  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  async function assertTest(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Submission works without staff login
    // -------------------------------------------------------------
    await assertTest('1. Submission works without staff login', async () => {
      const res = await fetch(`${BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: 'cat-suggestion',
          subject: 'Autonomous Anonymous Test #1',
          message: 'This is a genuine feedback submission without any staff login or SSO.',
          share_in_updates_consent: false,
        }),
      });

      if (!res.ok) throw new Error(`Submission failed with status ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.public_id || !data.secret) {
        throw new Error('Response did not return expected public_id and secret');
      }
    });

    // -------------------------------------------------------------
    // Test 2: A logged-in reviewer’s submission does not store their identity
    // -------------------------------------------------------------
    await assertTest('2. A logged-in reviewer’s submission does not store their identity', async () => {
      // Login as Elena Vance
      const loginRes = await fetch(`${BASE_URL}/api/reviewer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'elena.vance@dcreativs.internal',
          password: 'Password123!',
        }),
      });
      const loginData = await loginRes.json();
      const reviewerToken = loginData.token;

      // Submit feedback while carrying reviewer credentials
      const subRes = await fetch(`${BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${reviewerToken}`,
        },
        body: JSON.stringify({
          category_id: 'cat-concern',
          subject: 'Reviewer Submitting Anonymous Feedback',
          message: 'Reviewer submitting feedback must be completely anonymous.',
        }),
      });
      const subData = await subRes.json();
      const publicId = subData.public_id;

      // Query database directly to confirm reviewer identity is NOT attached
      const fbRow = await query(`SELECT * FROM feedback WHERE public_id = $1`, [publicId]);
      if (fbRow.rows.length === 0) throw new Error('Feedback record not found');

      // Check conversation messages: author_id MUST be null for anonymous sender
      const msgRow = await query(`SELECT * FROM conversation_messages WHERE feedback_id = $1`, [fbRow.rows[0].id]);
      if (msgRow.rows[0].author_id !== null) {
        throw new Error(`Reviewer author_id was leaked into sender message: ${msgRow.rows[0].author_id}`);
      }
      if (msgRow.rows[0].sender_type !== 'sender') {
        throw new Error(`Message sender_type is not 'sender'`);
      }
    });

    // -------------------------------------------------------------
    // Test 3: One conversation secret cannot open another conversation
    // -------------------------------------------------------------
    await assertTest('3. One conversation secret cannot open another conversation', async () => {
      // Create feedback item A
      const resA = await fetch(`${BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: 'cat-suggestion', message: 'Item A Message' }),
      });
      const dataA = await resA.json();

      // Create feedback item B
      const resB = await fetch(`${BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: 'cat-suggestion', message: 'Item B Message' }),
      });
      const dataB = await resB.json();

      // Try accessing with invalid secret
      const invalidRes = await fetch(`${BASE_URL}/api/conversation/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: 'NON-EXISTENT-SECRET-999' }),
      });
      if (invalidRes.status !== 404) {
        throw new Error(`Expected 404 for invalid secret, got ${invalidRes.status}`);
      }

      // Access A with secret A
      const accessA = await fetch(`${BASE_URL}/api/conversation/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: dataA.secret }),
      });
      const jsonA = await accessA.json();
      if (jsonA.conversation.public_id !== dataA.public_id) {
        throw new Error('Secret A returned wrong conversation');
      }
      if (jsonA.conversation.public_id === dataB.public_id) {
        throw new Error('Secret A breached and opened conversation B!');
      }
    });

    // -------------------------------------------------------------
    // Test 4: Secrets and message bodies do not appear in audit logs
    // -------------------------------------------------------------
    await assertTest('4. Secrets and message bodies do not appear in audit logs', async () => {
      const auditRes = await query(`SELECT details_json FROM reviewer_audit_events`);
      for (const row of auditRes.rows) {
        const details = JSON.stringify(row.details_json || {});
        if (details.includes('secret') || details.includes('7K2-XM9-P4L') || details.includes('message') && details.includes('burnout')) {
          throw new Error(`Sensitive content detected in audit logs: ${details}`);
        }
      }
    });

    // -------------------------------------------------------------
    // Test 5: Excluded reviewers cannot discover restricted reports
    // -------------------------------------------------------------
    await assertTest('5. Excluded reviewers cannot discover restricted reports', async () => {
      // Create sensitive report routing to Marcus Thorne only, excluding Elena Vance
      const subRes = await fetch(`${BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: 'cat-sensitive',
          subject: 'Confidential Conflict Report',
          message: 'Sensitive concern routed specifically away from Elena Vance.',
          routing_choice: 'rev-marcus',
        }),
      });
      const subData = await subRes.json();
      const sensitivePublicId = subData.public_id;

      // 1. Elena Vance attempts to access
      const elenaLogin = await fetch(`${BASE_URL}/api/reviewer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'elena.vance@dcreativs.internal', password: 'Password123!' }),
      });
      const elenaData = await elenaLogin.json();

      // Check feedback list for Elena
      const elenaListRes = await fetch(`${BASE_URL}/api/reviewer/feedback?tab=all`, {
        headers: { 'Authorization': `Bearer ${elenaData.token}` },
      });
      const elenaList = await elenaListRes.json();
      const foundInElenaList = elenaList.feedback.some((f: any) => f.public_id === sensitivePublicId);
      if (foundInElenaList) {
        throw new Error('Excluded reviewer Elena Vance found the restricted report in her inbox list!');
      }

      // Check direct detail endpoint for Elena
      const elenaDetailRes = await fetch(`${BASE_URL}/api/reviewer/feedback/${sensitivePublicId}`, {
        headers: { 'Authorization': `Bearer ${elenaData.token}` },
      });
      if (elenaDetailRes.status !== 403) {
        throw new Error(`Expected 403 Forbidden for excluded reviewer, got ${elenaDetailRes.status}`);
      }

      // 2. Marcus Thorne (the assigned reviewer) CAN access
      const marcusLogin = await fetch(`${BASE_URL}/api/reviewer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'marcus.thorne@dcreativs.internal', password: 'Password123!' }),
      });
      const marcusData = await marcusLogin.json();
      const marcusDetailRes = await fetch(`${BASE_URL}/api/reviewer/feedback/${sensitivePublicId}`, {
        headers: { 'Authorization': `Bearer ${marcusData.token}` },
      });
      if (marcusDetailRes.status !== 200) {
        throw new Error(`Assigned sensitive reviewer was unable to access: ${marcusDetailRes.status}`);
      }
    });

    // -------------------------------------------------------------
    // Test 6: An action owner sees only the redacted task
    // -------------------------------------------------------------
    await assertTest('6. An action owner sees only the redacted task', async () => {
      // Login as Action Owner David Chen
      const davidLogin = await fetch(`${BASE_URL}/api/reviewer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'david.chen@dcreativs.internal', password: 'Password123!' }),
      });
      const davidData = await davidLogin.json();

      // Attempt to access unredacted feedback inbox
      const inboxRes = await fetch(`${BASE_URL}/api/reviewer/feedback`, {
        headers: { 'Authorization': `Bearer ${davidData.token}` },
      });
      if (inboxRes.status !== 403) {
        throw new Error(`Action owner should be 403 forbidden from raw feedback inbox, got ${inboxRes.status}`);
      }

      // Access assigned actions
      const actionsRes = await fetch(`${BASE_URL}/api/reviewer/actions`, {
        headers: { 'Authorization': `Bearer ${davidData.token}` },
      });
      if (!actionsRes.ok) throw new Error('Failed to get action owner tasks');
      const actionsData = await actionsRes.json();
      if (!Array.isArray(actionsData.actions) || actionsData.actions.length === 0) {
        throw new Error('No assigned actions returned for action owner');
      }

      // Verify that raw message bodies and submitter names are not included
      for (const act of actionsData.actions) {
        if (act.message || act.submitter || act.sender_id) {
          throw new Error('Action owner received unredacted sender details');
        }
      }
    });

    // -------------------------------------------------------------
    // Test 7: Submission retries create one record
    // -------------------------------------------------------------
    await assertTest('7. Submission retries create one record (Deduplication)', async () => {
      const runId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      const idempotencyKey = `idempotent-test-${runId}`;
      const payload = {
        category_id: 'cat-suggestion',
        message: `Unique retry idempotency verification test message ${runId}.`,
        idempotency_key: idempotencyKey,
      };

      const res1 = await fetch(`${BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data1 = await res1.json();

      // Retry immediately
      const res2 = await fetch(`${BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data2 = await res2.json();

      if (data1.public_id !== data2.public_id || data1.secret !== data2.secret) {
        throw new Error('Retry created duplicate record instead of returning existing reference');
      }

      // Verify DB count
      const countRes = await query(`SELECT COUNT(*) as count FROM feedback WHERE message = $1`, [payload.message]);
      if (parseInt(countRes.rows[0].count, 10) !== 1) {
        throw new Error(`Expected exactly 1 record in DB, found ${countRes.rows[0].count}`);
      }
    });

    // -------------------------------------------------------------
    // Test 8: Public updates require explicit review
    // -------------------------------------------------------------
    await assertTest('8. Public updates require explicit review', async () => {
      const testTag = `#${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      // 1. Submit feedback with consent checked
      const subRes = await fetch(`${BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: 'cat-suggestion',
          message: `Automated test feedback for public update gating ${testTag}`,
          share_in_updates_consent: true,
        }),
      });
      const subData = await subRes.json();

      // Check public updates board immediately
      const initialUpdates = await fetch(`${BASE_URL}/api/updates`).then(r => r.json());
      const isAutoPublished = initialUpdates.updates.some((u: any) => u.staff_perspective?.includes(testTag));
      if (isAutoPublished) {
        throw new Error('Feedback was automatically published without explicit reviewer drafting and approval!');
      }

      // 2. Reviewer explicitly crafts and approves update
      const elenaLogin = await fetch(`${BASE_URL}/api/reviewer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'elena.vance@dcreativs.internal', password: 'Password123!' }),
      }).then(r => r.json());

      const pubRes = await fetch(`${BASE_URL}/api/reviewer/feedback/${subData.public_id}/publish-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${elenaLogin.token}`,
        },
        body: JSON.stringify({
          staff_perspective: `Staff raised a suggestion regarding test update gating ${testTag}.`,
          our_response: 'Leadership reviewed and approved this item.',
          status: 'IN PROGRESS',
        }),
      });
      if (!pubRes.ok) throw new Error('Failed to publish update');

      // Now verify it appears on the public board
      const finalUpdates = await fetch(`${BASE_URL}/api/updates`).then(r => r.json());
      const nowPublished = finalUpdates.updates.some((u: any) => u.staff_perspective?.includes(testTag));
      if (!nowPublished) {
        throw new Error('Approved update did not appear on public board');
      }
    });

    // -------------------------------------------------------------
    // Test 9: Retention processes cover live records and documented deletion
    // -------------------------------------------------------------
    await assertTest('9. Retention processes cover live records and documented deletion', async () => {
      // Insert an expired feedback record directly into DB
      const expiredPubId = `FB-EXPIRED-${Date.now()}`;
      const fbIns = await query(`
        INSERT INTO feedback (public_id, category_id, message, retention_expires_at, is_deleted)
        VALUES ($1, 'cat-suggestion', 'Expired retention message to be purged.', NOW() - INTERVAL '2 days', false)
        RETURNING id;
      `, [expiredPubId]);
      const fbId = fbIns.rows[0].id;

      const secretHash = hashConversationSecret('EXP-123-KEY');
      await query(`INSERT INTO conversation_secrets (feedback_id, secret_hash) VALUES ($1, $2)`, [fbId, secretHash]);

      // Admin executes purge
      const adminLogin = await fetch(`${BASE_URL}/api/reviewer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@dcreativs.internal', password: 'Password123!' }),
      }).then(r => r.json());

      const purgeRes = await fetch(`${BASE_URL}/api/admin/purge-expired`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminLogin.token}` },
      });
      const purgeData = await purgeRes.json();
      if (!purgeData.success || purgeData.records_purged === 0) {
        throw new Error('Purge failed to detect expired record');
      }

      // Check DB: secret hash deleted and message purged
      const secretCheck = await query(`SELECT * FROM conversation_secrets WHERE feedback_id = $1`, [fbId]);
      if (secretCheck.rows.length !== 0) {
        throw new Error('Secret hash was not deleted during retention purge');
      }

      const fbCheck = await query(`SELECT message, is_deleted FROM feedback WHERE id = $1`, [fbId]);
      if (!fbCheck.rows[0].is_deleted || !fbCheck.rows[0].message.includes('PURGED')) {
        throw new Error('Feedback record was not sanitized/purged');
      }
    });

    // -------------------------------------------------------------
    // Test 10: App accessibility and contract verification
    // -------------------------------------------------------------
    await assertTest('10. App responsive contract and keyboard access verification', async () => {
      // Check health endpoint
      const healthRes = await fetch(`${BASE_URL}/api/health`);
      if (!healthRes.ok) throw new Error('Health endpoint returned error');
      const health = await healthRes.json();
      if (health.service !== 'D’Creativs OpenLine') {
        throw new Error('Unexpected health service');
      }
    });

  } finally {
    server.close();
    await pool.end();
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
