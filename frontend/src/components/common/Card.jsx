import React from 'react';

export default function Card({ children, className = '', style = {}, noPadding = false }) {
  const basePadding = noPadding ? '0' : '2rem';
  return (
    <div
      className={`glass-panel animate-fade-in ${className}`}
      style={{
        padding: basePadding,
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        ...style
      }}
    >
      {children}
    </div>
  );
}
