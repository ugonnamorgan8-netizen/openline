/**
 * D'Creativs OpenLine — Production Initialization Script
 *
 * Run ONCE on the live Neon database to:
 *  1. Create all tables (schema)
 *  2. Wipe ALL demo/seed data
 *  3. Insert the real board members with temporary passwords
 *  4. Set the real staff access code
 *
 * Usage:
 *   npx tsx src/server/init-production.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from './db.js';
import { hashPassword } from './crypto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURE YOUR REAL BOARD MEMBERS HERE
// Roles: admin | general_reviewer | sensitive_reviewer | action_owner | leadership_viewer
// ─────────────────────────────────────────────────────────────────────────────
const REAL_BOARD_MEMBERS = [
  {
    id: 'rev-akparanta-estella',
    name: 'Akparanta Estella',
    email: 'oluwakayodeella@gmail.com',
    role: 'sensitive_reviewer' as const,
    department: 'People & Culture',
    title: 'CHRO',
    temp_password: 'DCopenline_26',
  },
  {
    id: 'rev-ndukwe-pleasant',
    name: 'Ndukwe Pleasant',
    email: 'xantspace.dev@gmail.com',
    role: 'admin' as const,
    department: 'Executive Leadership',
    title: 'CEO',
    temp_password: 'DCopenline_26',
  },
  {
    id: 'rev-morgan-ugonna',
    name: 'Morgan Ugonna',
    email: 'ugonnamorgan8@gmail.com',
    role: 'admin' as const,
    department: 'Executive Leadership',
    title: 'COO',
    temp_password: 'DCopenline_26',
  },
  {
    id: 'rev-okoji-kingsley',
    name: 'Okoji Kingsley',
    email: 'kingsleyokoji91@gmail.com',
    role: 'general_reviewer' as const,
    department: 'Product & Engineering',
    title: 'CPO',
    temp_password: 'DCopenline_26',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SET YOUR REAL STAFF ACCESS CODE
// This is the code all staff type before submitting anonymous feedback.
// ─────────────────────────────────────────────────────────────────────────────
const STAFF_ACCESS_CODE = 'DCREATIVS2026';

// ─────────────────────────────────────────────────────────────────────────────

async function initProduction() {
  console.log('\n D\'Creativs OpenLine - Production Initialization\n');

  // 1. Run schema (idempotent)
  console.log('Creating database schema...');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await query(schemaSql);
  console.log('  Schema ready');

  // 2. Wipe ALL demo/seed data
  console.log('\nClearing all demo data...');
  await query(`TRUNCATE TABLE
    reviewer_audit_events,
    improvement_actions,
    published_updates,
    internal_notes,
    reviewer_assignments,
    conversation_messages,
    conversation_secrets,
    feedback,
    notification_jobs
    RESTART IDENTITY CASCADE`);
  await query(`DELETE FROM reviewers`);
  console.log('  All demo records removed');

  // 3. Seed categories
  console.log('\nSeeding feedback categories...');
  const categoriesData = [
    { id: 'cat-suggestion',  name: 'Suggestion',               description: 'An idea to improve our workflow or culture.',             icon: 'lightbulb',      is_sensitive: false, sort_order: 1 },
    { id: 'cat-concern',     name: 'Concern',                   description: 'Something that isn\'t working as it should.',              icon: 'alert-triangle', is_sensitive: false, sort_order: 2 },
    { id: 'cat-positive',    name: 'Positive Feedback',         description: 'Recognition for a teammate or a project win.',            icon: 'star',           is_sensitive: false, sort_order: 3 },
    { id: 'cat-sensitive',   name: 'Sensitive Report',          description: 'Policy violations or sensitive personal matters.',        icon: 'shield',         is_sensitive: true,  sort_order: 4 },
    { id: 'cat-workload',    name: 'Workload and delivery',     description: 'Deadlines, staffing balance, project scope, pacing.',     icon: 'clock',          is_sensitive: false, sort_order: 5 },
    { id: 'cat-leadership',  name: 'Leadership and communication', description: 'Transparency, company direction, cross-team comms.',   icon: 'compass',        is_sensitive: false, sort_order: 6 },
    { id: 'cat-wellbeing',   name: 'Team culture and wellbeing', description: 'Work-life balance, psychological safety, connection.',   icon: 'heart',          is_sensitive: false, sort_order: 7 },
    { id: 'cat-tools',       name: 'Tools and working conditions', description: 'Software licenses, hardware, workspace amenities.',    icon: 'tool',           is_sensitive: false, sort_order: 8 },
    { id: 'cat-academy',     name: 'Academy and teaching',      description: 'Curriculum delivery, student support, tutor resources.',  icon: 'book',           is_sensitive: false, sort_order: 9 },
    { id: 'cat-other',       name: 'Other',                     description: 'General thoughts or miscellaneous topics.',               icon: 'message-circle', is_sensitive: false, sort_order: 10 },
  ];

  for (const c of categoriesData) {
    const defaultReviewers = c.is_sensitive
      ? JSON.stringify(['rev-akparanta-estella'])
      : JSON.stringify(['rev-okoji-kingsley']);
    await query(`
      INSERT INTO categories (id, name, description, icon, is_sensitive, default_reviewer_ids, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, true, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, description = EXCLUDED.description,
        icon = EXCLUDED.icon, is_sensitive = EXCLUDED.is_sensitive,
        default_reviewer_ids = EXCLUDED.default_reviewer_ids,
        sort_order = EXCLUDED.sort_order
    `, [c.id, c.name, c.description, c.icon, c.is_sensitive, defaultReviewers, c.sort_order]);
  }
  console.log(`  ${categoriesData.length} categories seeded`);

  // 4. Staff access code
  console.log('\nSetting staff access code...');
  const accessCodeHash = await hashPassword(STAFF_ACCESS_CODE);
  await query(`
    INSERT INTO retention_settings (id, general_retention_days, sensitive_retention_days, min_reporting_threshold, staff_access_code_hash, updated_at)
    VALUES (1, 180, 90, 5, $1, NOW())
    ON CONFLICT (id) DO UPDATE SET
      staff_access_code_hash = EXCLUDED.staff_access_code_hash,
      updated_at = NOW()
  `, [accessCodeHash]);
  console.log(`  Access code set to: "${STAFF_ACCESS_CODE}"`);

  // 5. Insert real board members
  console.log('\nCreating board member accounts...\n');
  console.log('============================================================');
  console.log('     BOARD MEMBER CREDENTIALS - SHARE PRIVATELY');
  console.log('============================================================');

  for (const member of REAL_BOARD_MEMBERS) {
    const hash = await hashPassword(member.temp_password);
    await query(`
      INSERT INTO reviewers (id, name, email, password_hash, role, department, title, mfa_enabled, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        title = EXCLUDED.title,
        is_active = true
    `, [member.id, member.name, member.email, hash, member.role, member.department, member.title]);

    console.log(`\n  Name:     ${member.name}`);
    console.log(`  Email:    ${member.email}`);
    console.log(`  Role:     ${member.role}`);
    console.log(`  Password: ${member.temp_password}  <- ask them to change this`);
  }

  console.log('\n============================================================\n');
  console.log(`  ${REAL_BOARD_MEMBERS.length} board member(s) created`);

  console.log('\nProduction initialization complete!');
  console.log('\nNext steps:');
  console.log('  1. Add DATABASE_URL to Vercel Environment Variables');
  console.log('  2. Share each member\'s email + temp password privately');
  console.log('  3. Ask them to log in and change their password immediately');
  console.log(`  4. Share the staff access code ("${STAFF_ACCESS_CODE}") with all staff\n`);
}

initProduction()
  .then(() => { pool.end(); process.exit(0); })
  .catch((err) => {
    console.error('\nInitialization failed:', err);
    pool.end();
    process.exit(1);
  });
