import React from 'react';

/**
 * Score Gauge circular graph presentation component.
 */
export default function ScoreGauge({ score, feedbackText, feedbackColor }) {
  return (
    <div className="score-card glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      <div className="score-ring-wrapper" style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="60" stroke="rgba(255,255,255,0.04)" strokeWidth="10" fill="transparent" />
          <circle 
            cx="75" 
            cy="75" 
            r="60" 
            stroke="url(#scoreGradient)" 
            strokeWidth="10" 
            fill="transparent" 
            strokeDasharray="377"
            strokeDashoffset={377 - (377 * score) / 100}
            strokeLinecap="round"
            transform="rotate(-90 75 75)"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="score-value-overlay" style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{score}%</span>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Focus Level</span>
        </div>
      </div>
      <h4 style={{ margin: '1rem 0 0.25rem 0', fontSize: '1.1rem', color: 'white', fontWeight: 600 }}>Productivity Rating</h4>
      <p style={{ fontSize: '0.8rem', color: feedbackColor, textAlign: 'center', margin: 0, padding: '0 0.5rem', transition: 'color 0.5s ease' }}>
        {feedbackText}
      </p>
    </div>
  );
}
