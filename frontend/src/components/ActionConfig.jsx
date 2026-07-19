import React from 'react';

export const ACTION_CONFIG = {
  created: {
    icon: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    ),
    strokeWidth: 2.5,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    label: 'Registered'
  },
  completed: {
    icon: <polyline points="20 6 9 17 4 12" />,
    strokeWidth: 2.5,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    label: 'Approved'
  },
  reopened: {
    icon: <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />,
    strokeWidth: 2.5,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    label: 'Reopened'
  },
  updated: {
    icon: <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />,
    strokeWidth: 2.5,
    color: 'hsl(var(--primary))',
    bg: 'rgba(139, 92, 246, 0.12)',
    label: 'Revision'
  },
  deleted: {
    icon: (
      <>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </>
    ),
    strokeWidth: 2.5,
    color: 'hsl(var(--danger))',
    bg: 'rgba(239, 68, 68, 0.15)',
    label: 'Archived'
  }
};

export const DEFAULT_ACTION_STYLE = {
  icon: <circle cx="12" cy="12" r="10" />,
  strokeWidth: 2,
  color: 'hsl(var(--text-secondary))',
  bg: 'rgba(255, 255, 255, 0.05)',
  label: 'Action'
};
