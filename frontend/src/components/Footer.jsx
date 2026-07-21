import React from 'react';

export default function Footer() {
  return (
    <footer 
      style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        color: 'hsl(var(--text-muted))',
        fontSize: '0.8rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'transparent'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <span style={{ fontWeight: 600, letterSpacing: '0.5px' }}>AetherTasks</span>
      </div>
      <p style={{ margin: 0, opacity: 0.6 }}>
        &copy; {new Date().getFullYear()} AetherTasks. Elevate your daily flow.
      </p>
    </footer>
  );
}
