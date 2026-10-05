-- D'Creativs OpenLine Database Schema
-- Dedicated tables ensuring separation of anonymous data, reviewer identities, and audit trails

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    is_sensitive BOOLEAN DEFAULT FALSE,
    default_reviewer_ids JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviewers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'general_reviewer', 'sensitive_reviewer', 'action_owner', 'leadership_viewer')),
    department VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    mfa_enabled BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: feedback table intentionally contains NO user_id, IP address, user agent, or session identifier!
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    suggested_improvement TEXT,
    share_in_updates_consent BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'Acknowledged', 'In Review', 'Action Planned', 'Resolved', 'Closed')),
    closure_reason TEXT,
    assigned_reviewer_id VARCHAR(50) REFERENCES reviewers(id),
    is_sensitive BOOLEAN DEFAULT FALSE,
    routing_choice VARCHAR(50),
    excluded_reviewer_ids JSONB DEFAULT '[]'::jsonb,
    retention_expires_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deletion_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keyed / salted hash of the 128+ bit conversation secret
CREATE TABLE IF NOT EXISTS conversation_secrets (
    id SERIAL PRIMARY KEY,
    feedback_id INT UNIQUE REFERENCES feedback(id) ON DELETE CASCADE,
    secret_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation messages: sender_type = 'sender' has author_id = NULL
CREATE TABLE IF NOT EXISTS conversation_messages (
    id SERIAL PRIMARY KEY,
    feedback_id INT REFERENCES feedback(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('sender', 'reviewer')),
    author_id VARCHAR(50) REFERENCES reviewers(id), -- NULL for anonymous sender!
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Internal notes visible only to authorized reviewers
CREATE TABLE IF NOT EXISTS internal_notes (
    id SERIAL PRIMARY KEY,
    feedback_id INT REFERENCES feedback(id) ON DELETE CASCADE,
    author_id VARCHAR(50) REFERENCES reviewers(id),
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviewer assignment log
CREATE TABLE IF NOT EXISTS reviewer_assignments (
    id SERIAL PRIMARY KEY,
    feedback_id INT REFERENCES feedback(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(50) REFERENCES reviewers(id),
    assigned_by_id VARCHAR(50) REFERENCES reviewers(id),
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Redacted improvement actions assigned to action owners (no sender identity or original message body)
CREATE TABLE IF NOT EXISTS improvement_actions (
    id SERIAL PRIMARY KEY,
    feedback_id INT REFERENCES feedback(id) ON DELETE SET NULL,
    action_title VARCHAR(200) NOT NULL,
    redacted_description TEXT NOT NULL,
    action_owner_id VARCHAR(50) REFERENCES reviewers(id),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approved public summaries for "You Said, We Did"
CREATE TABLE IF NOT EXISTS published_updates (
    id SERIAL PRIMARY KEY,
    feedback_id INT REFERENCES feedback(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('IN PROGRESS', 'COMPLETED')),
    staff_perspective TEXT NOT NULL,
    our_response TEXT NOT NULL,
    approved_by_id VARCHAR(50) REFERENCES reviewers(id),
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit events: explicitly logs metadata actions WITHOUT message bodies or secrets
CREATE TABLE IF NOT EXISTS reviewer_audit_events (
    id SERIAL PRIMARY KEY,
    reviewer_id VARCHAR(50) REFERENCES reviewers(id),
    action_type VARCHAR(100) NOT NULL,
    feedback_id INT REFERENCES feedback(id) ON DELETE SET NULL,
    details_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retention & system settings
CREATE TABLE IF NOT EXISTS retention_settings (
    id INT PRIMARY KEY DEFAULT 1,
    general_retention_days INT DEFAULT 180,
    sensitive_retention_days INT DEFAULT 90,
    min_reporting_threshold INT DEFAULT 5,
    staff_access_code_hash VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification jobs queue (payload strictly omits message bodies and secrets)
CREATE TABLE IF NOT EXISTS notification_jobs (
    id SERIAL PRIMARY KEY,
    recipient_email VARCHAR(150) NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    feedback_public_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
