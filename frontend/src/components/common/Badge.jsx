import React from 'react';

export default function Badge({ type, value, className = '' }) {
  if (!value) return null;

  if (type === 'priority') {
    return (
      <span className={`badge priority-badge priority-${value.toLowerCase()} ${className}`}>
        {value}
      </span>
    );
  }

  if (type === 'category') {
    return (
      <span className={`badge badge-${value.toLowerCase()} ${className}`}>
        {value}
      </span>
    );
  }

  return null;
}
