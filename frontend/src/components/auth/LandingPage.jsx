import React from 'react';
import Card from '../common/Card';
import AuthForms from './AuthForms';

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0) 50%), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0) 50%)',
        padding: '2rem 1.5rem',
        color: 'white',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: '3rem',
          alignItems: 'center'
        }}
        className="landing-grid-responsive"
      >
        {/* Left Side: Pitch and Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.75rem', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--primary))' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Introducing AetherTasks v1.0</span>
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, lineHeight: 1.1, background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Elevate Your Daily Flow
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'hsl(var(--text-muted))', marginTop: '0.75rem', lineHeight: '1.6' }}>
              A premium, lightweight task organization ecosystem designed with crystal-clear analytics, historical activity logs, and a glassmorphic dashboard interface.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'hsl(var(--primary))', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" /></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Intelligent Task Board</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Plan submittals, QA steps, or personal tasks with categorized tags and due dates.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'hsl(var(--accent))', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Real-time Analytics</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>View productivity stats, progress charts, and category distributions instantly.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', color: 'hsl(var(--text-secondary))', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Activity History Audits</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Track every single action, update, or deletion in a chronological audit log.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Glass Panel */}
        <Card>
          <AuthForms />
        </Card>
      </div>
    </div>
  );
}
