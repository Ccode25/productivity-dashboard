import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useAuth from '../../hooks/useAuth';

export default function UserMenu() {
  const { user, demoUsers, loginAsDemo, logout, setShowLoginModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (!(event.target instanceof Node)) return;
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(event.target))
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update dropdown position
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const dropdownWidth = 260;
      const margin = 16;
      let calculatedRight = window.innerWidth - rect.right;

      // Prevent clipping on the left
      if (window.innerWidth - calculatedRight - dropdownWidth < margin) {
        calculatedRight = window.innerWidth - dropdownWidth - margin;
      }

      // Prevent clipping on the right
      if (calculatedRight < margin) {
        calculatedRight = margin;
      }

      setDropdownPos({
        top: rect.bottom + 8,
        right: calculatedRight
      });
    }
  }, [isOpen]);

  // Close on scroll or resize to prevent detached dropdown
  useEffect(() => {
    const handleScrollResize = (e) => {
      // Don't close if scrolling inside the dropdown itself
      if (e.target instanceof Node && dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      if (isOpen) setIsOpen(false);
    };
    window.addEventListener('scroll', handleScrollResize, true);
    window.addEventListener('resize', handleScrollResize);
    return () => {
      window.removeEventListener('scroll', handleScrollResize, true);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [isOpen]);

  if (!user) {
    return (
      <button 
        className="btn btn-primary"
        style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        onClick={() => setShowLoginModal(true)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        Sign In
      </button>
    );
  }

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '30px',
          padding: '0.35rem 0.75rem 0.35rem 0.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        title={`Signed in as ${user.name}`}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {initials}
          </div>
        )}

        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', lineHeight: 1.1 }}>
            {user.name}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', marginTop: '0.1rem' }}>
            {user.role || user.email}
          </div>
        </div>

        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && dropdownPos && createPortal(
        <div
          ref={dropdownRef}
          className="glass-panel"
          style={{
            position: 'fixed',
            right: dropdownPos.right,
            top: dropdownPos.top,
            width: '260px',
            padding: '0.75rem',
            zIndex: 9999,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* User Info Card */}
          <div style={{ padding: '0.5rem', marginBottom: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{user.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--primary))', fontWeight: 600, margin: '0.1rem 0' }}>{user.role || 'Member'}</div>
            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', wordBreak: 'break-all' }}>{user.email}</div>
          </div>


          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '6px',
                padding: '0.4rem',
                color: 'hsl(var(--danger))',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out Session
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
