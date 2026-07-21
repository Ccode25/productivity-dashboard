import React from 'react';
import UserMenu from './auth/UserMenu';

export default function Header() {
  return (
    <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '2rem' }}>
      <div>
        <h1 className="app-logo" style={{ margin: 0 }}>AetherTasks</h1>
        <p className="app-subtitle" style={{ margin: '0.25rem 0 0 0' }}>Elevate your daily flow with clarity and focus</p>
      </div>

      <UserMenu />
    </header>
  );
}
