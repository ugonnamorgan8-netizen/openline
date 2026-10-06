import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from './db.js';
import { hashPassword, hashConversationSecret } from './crypto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedDatabase() {
  console.log('Seeding D’Creativs OpenLine database...');

  // 0. Ensure schema exists
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await query(schemaSql);

  // 1. Settings & Access Code
  const accessCodeHash = await hashPassword('DCREATIVS2026');
  await query(`
    INSERT INTO retention_settings (id, general_retention_days, sensitive_retention_days, min_reporting_threshold, staff_access_code_hash, updated_at)
    VALUES (1, 180, 90, 5, $1, NOW())
    ON CONFLICT (id) DO UPDATE SET
      staff_access_code_hash = EXCLUDED.staff_access_code_hash,
      general_retention_days = EXCLUDED.general_retention_days,
      sensitive_retention_days = EXCLUDED.sensitive_retention_days,
      min_reporting_threshold = EXCLUDED.min_reporting_threshold;
  `, [accessCodeHash]);

  // 2. Reviewers
  const defaultPasswordHash = await hashPassword('Password123!');
  const reviewersData = [
    {
      id: 'rev-elena',
      name: 'Elena Vance',
      email: 'elena.vance@dcreativs.internal',
      role: 'sensitive_reviewer',
      department: 'People & Culture',
      title: 'HR Lead',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'rev-marcus',
      name: 'Marcus Thorne',
      email: 'marcus.thorne@dcreativs.internal',
      role: 'sensitive_reviewer',
      department: 'Creative & Product',
      title: 'Design Lead',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'rev-amina',
      name: 'Amina Yusuf',
      email: 'admin@dcreativs.internal',
      role: 'admin',
      department: 'Operations & IT',
      title: 'System Administrator',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'rev-david',
      name: 'David Chen',
      email: 'david.chen@dcreativs.internal',
      role: 'action_owner',
      department: 'Studio Operations',
      title: 'Operations Lead',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'rev-sarah',
      name: 'Sarah Miller',
      email: 'sarah.miller@dcreativs.internal',
      role: 'leadership_viewer',
      department: 'Executive Board',
      title: 'Board Director',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    }
  ];

  for (const r of reviewersData) {
    await query(`
      INSERT INTO reviewers (id, name, email, password_hash, role, department, title, avatar_url, mfa_enabled, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        title = EXCLUDED.title,
        avatar_url = EXCLUDED.avatar_url,
        password_hash = EXCLUDED.password_hash;
    `, [r.id, r.name, r.email, defaultPasswordHash, r.role, r.department, r.title, r.avatar_url]);
  }

  // 3. Categories (including the 4 primary cards from page 2 + the prompt's required categories)
  const categoriesData = [
    {
      id: 'cat-suggestion',
      name: 'Suggestion',
      description: 'An idea to improve our workflow or culture.',
      icon: 'lightbulb',
      is_sensitive: false,
      default_reviewer_ids: JSON.stringify(['rev-elena', 'rev-marcus']),
      sort_order: 1,
    },
    {
      id: 'cat-concern',
      name: 'Concern',
      description: 'Something that isn\'t working as it should.',
      icon: 'alert-triangle',
      is_sensitive: false,
      default_reviewer_ids: JSON.stringify(['rev-elena']),
      sort_order: 2,
    },
    {
      id: 'cat-positive',
      name: 'Positive Feedback',
      description: 'Recognition for a teammate or a project win.',
      icon: 'star',
      is_sensitive: false,
      default_reviewer_ids: JSON.stringify(['rev-elena', 'rev-marcus']),
      sort_order: 3,
    },
    {
      id: 'cat-sensitive',
      name: 'Sensitive Report',
      description: 'Policy violations or sensitive personal matters.',
      icon: 'shield',
      is_sensitive: true,
      default_reviewer_ids: JSON.stringify(['rev-elena', 'rev-marcus']),
      sort_order: 4,
    },
    {
      id: 'cat-workload',
      name: 'Workload and delivery',
      description: 'Deadlines, staffing balance, project scope, sprint pacing.',
      icon: 'clock',
      is_sensitive: false,
      default_reviewer_ids: JSON.stringify(['rev-marcus']),
      sort_order: 5,
    },
    {
      id: 'cat-leadership',
      name: 'Leadership and communication',
      description: 'Transparency, company direction, cross-team communication.',
      icon: 'compass',
      is_sensitive: false,
      default_reviewer_ids: JSON.stringify(['rev-elena']),
      sort_order: 6,
    },
    {
      id: 'cat-wellbeing',
      name: 'Team culture and wellbeing',
      description: 'Work-life balance, psychological safety, team connection.',
      icon: 'heart',
      is_sensitive: false,
      default_reviewer_ids: JSON.stringify(['rev-elena']),
      sort_order: 7,
    },
    {
      id: 'cat-tools',
      name: 'Tools and working conditions',
      description: 'Software licenses, hardware, workspace amenities.',
      icon: 'tool',
      is_sensitive: false,
      default_reviewer_ids: JSON.stringify(['rev-marcus']),
      sort_order: 8,
    },
    {
      id: 'cat-academy',
      name: 'Academy and teaching',
      description: 'Curriculum delivery, student support, tutor resources.',
      icon: 'book',
      is_sensitive: false,
      default_reviewer_ids: JSON.stringify(['rev-marcus', 'rev-elena']),
      sort_order: 9,
    },
    {
      id: 'cat-other',
      name: 'Other',
      description: 'General thoughts or miscellaneous topics not covered above.',
      icon: 'message-circle',
      is_sensitive: false,
      default_reviewer_ids: JSON.stringify(['rev-elena']),
      sort_order: 10,
    }
  ];

  for (const c of categoriesData) {
    await query(`
      INSERT INTO categories (id, name, description, icon, is_sensitive, default_reviewer_ids, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, true, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        is_sensitive = EXCLUDED.is_sensitive,
        default_reviewer_ids = EXCLUDED.default_reviewer_ids,
        sort_order = EXCLUDED.sort_order;
    `, [c.id, c.name, c.description, c.icon, c.is_sensitive, c.default_reviewer_ids, c.sort_order]);
  }

  // 4. "You Said, We Did" Updates matching Page 7
  const updatesData = [
    {
      status: 'COMPLETED',
      staff_perspective: 'The current Q3 project deadlines feel unmanageable and are leading to team burnout.',
      our_response: 'We re-evaluated the Q3 roadmap with the design leads. Two secondary features have been moved to Q4, and we\'ve approved the hire of a freelance motion designer to assist with the current workload.',
      published_at: '2024-10-20',
      approved_by_id: 'rev-elena',
    },
    {
      status: 'IN PROGRESS',
      staff_perspective: 'It would be great to have a clearer career progression framework for the junior designers.',
      our_response: 'The Design Leadership team is currently drafting a new competency matrix. We expect to share the first draft for company-wide feedback by the end of November.',
      published_at: '2024-10-15',
      approved_by_id: 'rev-marcus',
    },
    {
      status: 'COMPLETED',
      staff_perspective: 'The office breakout area needs better lighting and some plants to make it more welcoming.',
      our_response: 'New warm lighting fixtures and 12 indoor plants have been installed. We\'ve also added three comfortable bean bags for better relaxation during breaks.',
      published_at: '2024-10-02',
      approved_by_id: 'rev-elena',
    }
  ];

  await query(`DELETE FROM published_updates`);
  for (const u of updatesData) {
    await query(`
      INSERT INTO published_updates (status, staff_perspective, our_response, approved_by_id, published_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [u.status, u.staff_perspective, u.our_response, u.approved_by_id, u.published_at]);
  }

  // 5. Seed feedback items matching screenshots
  // Clean existing feedback
  await query(`DELETE FROM feedback`);

  // Item 1: FB-7829 (Page 4, 5, 6 hero item)
  const res1 = await query(`
    INSERT INTO feedback (public_id, category_id, subject, message, suggested_improvement, share_in_updates_consent, status, assigned_reviewer_id, is_sensitive, created_at, updated_at)
    VALUES (
      'FB-7829',
      'cat-concern',
      'Project Workload Concern',
      'I feel like our current workload for the Q3 project is becoming unmanageable. Can we look at the deadlines or resource allocation? I''m worried about team burnout.',
      'Re-allocate secondary feature deadlines or bring temporary motion design support.',
      true,
      'In Review',
      'rev-elena',
      false,
      NOW() - INTERVAL '3 hours',
      NOW() - INTERVAL '2 hours'
    ) RETURNING id;
  `);
  const fb1Id = res1.rows[0].id;

  // Secret for FB-7829 is exactly 7K2-XM9-P4L as shown in screenshots
  const secret1 = '7K2-XM9-P4L';
  const secretHash1 = hashConversationSecret(secret1);
  await query(`
    INSERT INTO conversation_secrets (feedback_id, secret_hash)
    VALUES ($1, $2)
  `, [fb1Id, secretHash1]);

  // Messages for FB-7829
  await query(`
    INSERT INTO conversation_messages (feedback_id, sender_type, author_id, body, created_at)
    VALUES
    ($1, 'sender', NULL, 'I feel like our current workload for the Q3 project is becoming unmanageable. Can we look at the deadlines or resource allocation? I''m worried about team burnout.', NOW() - INTERVAL '3 hours'),
    ($1, 'reviewer', 'rev-elena', 'Thank you for sharing this. We take burnout concerns very seriously. We are reviewing the resource allocation with the design leads today. I''ll post a detailed update here by Friday after our internal meeting.', NOW() - INTERVAL '2 hours');
  `, [fb1Id]);

  // Internal Note for FB-7829 (Page 6)
  await query(`
    INSERT INTO internal_notes (feedback_id, author_id, note, created_at)
    VALUES ($1, 'rev-elena', 'Already spoke to Marcus (Design Lead). He agrees we need a Q3 re-scoping session.', NOW() - INTERVAL '2.5 hours')
  `, [fb1Id]);

  // History / Audit events for FB-7829
  await query(`
    INSERT INTO reviewer_audit_events (reviewer_id, action_type, feedback_id, details_json, created_at)
    VALUES
    ('rev-elena', 'STATUS_CHANGE', $1, '{"from": "New", "to": "In Review", "note": "Assigned to HR Lead"}'::jsonb, NOW() - INTERVAL '2 hours'),
    ('rev-elena', 'ASSIGNMENT', $1, '{"assigned_reviewer_id": "rev-elena"}'::jsonb, NOW() - INTERVAL '3 hours');
  `, [fb1Id]);

  // Item 2: FB-8910 (New Coffee Machine Request)
  const res2 = await query(`
    INSERT INTO feedback (public_id, category_id, subject, message, status, assigned_reviewer_id, is_sensitive, created_at, updated_at)
    VALUES (
      'FB-8910',
      'cat-suggestion',
      'New Coffee Machine Request',
      'Would be great to have a better coffee machine in the breakout area for the team.',
      'New',
      'rev-marcus',
      false,
      NOW() - INTERVAL '5 hours',
      NOW() - INTERVAL '5 hours'
    ) RETURNING id;
  `);
  const secret2 = 'COF-82J-M9Q';
  await query(`
    INSERT INTO conversation_secrets (feedback_id, secret_hash)
    VALUES ($1, $2)
  `, [res2.rows[0].id, hashConversationSecret(secret2)]);
  await query(`
    INSERT INTO conversation_messages (feedback_id, sender_type, author_id, body, created_at)
    VALUES ($1, 'sender', NULL, 'Would be great to have a better coffee machine in the breakout area for the team.', NOW() - INTERVAL '5 hours')
  `, [res2.rows[0].id]);

  // Item 3: FB-9122 (Shoutout to the Tech Team)
  const res3 = await query(`
    INSERT INTO feedback (public_id, category_id, subject, message, status, assigned_reviewer_id, is_sensitive, created_at, updated_at)
    VALUES (
      'FB-9122',
      'cat-positive',
      'Shoutout to the Tech Team',
      'The transition to the new server was seamless. Great job guys!',
      'Acknowledged',
      'rev-elena',
      false,
      NOW() - INTERVAL '1 day',
      NOW() - INTERVAL '1 day'
    ) RETURNING id;
  `);
  const secret3 = 'TEC-94A-L1Z';
  await query(`
    INSERT INTO conversation_secrets (feedback_id, secret_hash)
    VALUES ($1, $2)
  `, [res3.rows[0].id, hashConversationSecret(secret3)]);
  await query(`
    INSERT INTO conversation_messages (feedback_id, sender_type, author_id, body, created_at)
    VALUES
    ($1, 'sender', NULL, 'The transition to the new server was seamless. Great job guys!', NOW() - INTERVAL '1 day'),
    ($1, 'reviewer', 'rev-elena', 'Thanks so much for the praise! I''ll make sure the engineering leads see this at tomorrow''s standup.', NOW() - INTERVAL '23 hours');
  `, [res3.rows[0].id]);

  // Additional synthetic items to populate stats (Awaiting response: 8, Overdue follow-up: 3, New this week: 14, Total: 42)
  const additionalItems = [
    { title: 'Tutor Mentorship Pairing', cat: 'cat-academy', msg: 'Could we introduce a buddy system for junior tutors before their first class?', status: 'New', time: '6 hours' },
    { title: 'Figma Library Component Sync', cat: 'cat-tools', msg: 'Design tokens in the mobile library are desynchronized from the web branch.', status: 'New', time: '8 hours' },
    { title: 'Remote Work Stipend Clarification', cat: 'cat-wellbeing', msg: 'Is the annual home equipment allowance rolling over or does it expire in Dec?', status: 'Acknowledged', time: '12 hours' },
    { title: 'Executive All-Hands Q&A Format', cat: 'cat-leadership', msg: 'Can we submit questions before town hall so leadership can address tricky topics directly?', status: 'New', time: '1 day' },
    { title: 'Academy Lab Equipment Upgrades', cat: 'cat-academy', msg: 'Audio monitors in studio B need replacement cables before upcoming masterclass.', status: 'New', time: '2 days' },
    { title: 'Friday Demo Hour Appreciation', cat: 'cat-positive', msg: 'Really loved the cross-team showcase last week. Gives great visibility into student projects.', status: 'Resolved', time: '3 days' },
    { title: 'Design Sprint Timebox Feedback', cat: 'cat-workload', msg: 'We had back to back reviews without buffer for file prep.', status: 'In Review', time: '4 days' },
    { title: 'Confidential: Studio Code of Conduct', cat: 'cat-sensitive', msg: 'Witnessed inappropriate comments regarding grading fairness during tutor evaluation.', status: 'In Review', time: '2 days', is_sensitive: true, assigned: 'rev-marcus' },
  ];

  for (let i = 0; i < additionalItems.length; i++) {
    const item = additionalItems[i];
    const pubId = `FB-${7900 + i}`;
    const res = await query(`
      INSERT INTO feedback (public_id, category_id, subject, message, status, assigned_reviewer_id, is_sensitive, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '${item.time}', NOW() - INTERVAL '${item.time}')
      RETURNING id;
    `, [pubId, item.cat, item.title, item.msg, item.status, item.assigned || 'rev-elena', !!item.is_sensitive]);

    const secret = `SEC-${8000 + i}-XYZ`;
    await query(`
      INSERT INTO conversation_secrets (feedback_id, secret_hash)
      VALUES ($1, $2)
    `, [res.rows[0].id, hashConversationSecret(secret)]);

    await query(`
      INSERT INTO conversation_messages (feedback_id, sender_type, author_id, body, created_at)
      VALUES ($1, 'sender', NULL, $2, NOW() - INTERVAL '${item.time}')
    `, [res.rows[0].id, item.msg]);
  }

  // Populate synthetic historical items to reach 42 items
  for (let i = 1; i <= 31; i++) {
    const pubId = `FB-${6000 + i}`;
    const status = i % 3 === 0 ? 'Resolved' : i % 2 === 0 ? 'Acknowledged' : 'In Review';
    const isSensitive = i === 15;
    const cat = ['cat-suggestion', 'cat-concern', 'cat-positive', 'cat-workload', 'cat-wellbeing'][i % 5];
    const res = await query(`
      INSERT INTO feedback (public_id, category_id, subject, message, status, assigned_reviewer_id, is_sensitive, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '${i * 3} days', NOW() - INTERVAL '${i * 3} days')
      RETURNING id;
    `, [pubId, cat, `Internal Feedback Topic #${i}`, `Archived feedback notes and suggestions for internal tracking #${i}.`, status, i % 2 === 0 ? 'rev-elena' : 'rev-marcus', isSensitive]);

    const sec = `ARC-${1000 + i}-KEY`;
    await query(`
      INSERT INTO conversation_secrets (feedback_id, secret_hash)
      VALUES ($1, $2)
    `, [res.rows[0].id, hashConversationSecret(sec)]);
  }

  // Action Owner Redacted Tasks
  await query(`DELETE FROM improvement_actions`);
  await query(`
    INSERT INTO improvement_actions (feedback_id, action_title, redacted_description, action_owner_id, status, target_date)
    VALUES
    ($1, 'Q3 Workload & Motion Support Re-scoping', 'Consulted design leads regarding roadmap pressure. Approve freelance motion designer hire and shift 2 non-core deliverables to Q4.', 'rev-david', 'In Progress', '2024-11-15'),
    (NULL, 'Breakout Area Warm Lighting & Plants', 'Procure 12 indoor plants, warm light pendants, and 3 beanbags for main rest lounge.', 'rev-david', 'Completed', '2024-10-01');
  `, [fb1Id]);

  console.log('Database seeded successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase().then(() => {
    console.log('Done!');
    process.exit(0);
  }).catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}
