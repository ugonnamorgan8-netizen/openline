import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, FileCheck } from 'lucide-react';
import { getActionOwnerTasks, updateActionStatus } from '../api.js';

interface ActionOwnerWorkspaceProps {
  reviewer: any;
  onBack: () => void;
}

export const ActionOwnerWorkspace: React.FC<ActionOwnerWorkspaceProps> = ({ reviewer, onBack }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await getActionOwnerTasks();
      setTasks(res.actions || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatus = async (taskId: number, newStatus: string) => {
    await updateActionStatus(taskId, newStatus);
    loadTasks();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px clamp(16px, 4vw, 40px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
        <button
          onClick={onBack}
          aria-label="Back"
          style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: '#0f172a' }}>
            Action Owner Workspace
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#64748b' }}>
            Assigned to: {reviewer.name} ({reviewer.title}) • Studio Operations
          </p>
        </div>
      </div>

      {/* Role Isolation Card */}
      <div style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fef3c7',
        borderRadius: '14px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '28px',
      }}>
        <FileCheck size={20} color="#b45309" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.4 }}>
          <strong>Redacted Action Privacy Guarantee:</strong> You receive actionable improvement tasks drafted by authorized reviewers. The original anonymous messages, submitter identifiers, and thread details are intentionally withheld.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
        {tasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
            <p style={{ fontWeight: 600, color: '#0f172a' }}>No action tasks assigned</p>
            <p style={{ fontSize: '13px' }}>When reviewers create improvement items, they appear here.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    {task.action_title}
                  </h3>
                  <span className={`badge ${task.status === 'Completed' ? 'badge-completed' : 'badge-in-progress'}`}>
                    {task.status}
                  </span>
                </div>

                {task.target_date && (
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    Target: {new Date(task.target_date).toLocaleDateString()}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                {task.redacted_description}
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                {task.status !== 'In Progress' && (
                  <button
                    onClick={() => handleStatus(task.id, 'In Progress')}
                    className="btn-secondary-pill"
                    style={{ fontSize: '12.5px', padding: '6px 14px' }}
                  >
                    Mark In Progress
                  </button>
                )}
                {task.status !== 'Completed' && (
                  <button
                    onClick={() => handleStatus(task.id, 'Completed')}
                    className="btn-primary-pill"
                    style={{ fontSize: '12.5px', padding: '6px 16px' }}
                  >
                    <CheckCircle2 size={14} />
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
