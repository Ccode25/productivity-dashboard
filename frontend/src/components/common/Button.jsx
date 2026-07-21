import React, { memo } from 'react';

const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'success', 'danger', 'icon', 'tab'
  type = 'button',
  onClick,
  className = '',
  style = {},
  title,
  disabled = false,
  active = false
}) => {
  let baseClass = 'btn';
  let inlineStyles = { ...style };

  switch (variant) {
    case 'primary':
      baseClass = 'btn btn-primary';
      break;
    case 'secondary':
      baseClass = 'btn btn-secondary';
      break;
    case 'success':
      baseClass = 'btn btn-success';
      break;
    case 'danger':
      baseClass = 'btn btn-danger'; // Requires CSS for btn-danger, or inline
      break;
    case 'icon':
      baseClass = 'btn-icon';
      break;
    case 'action':
      baseClass = 'action-btn';
      break;
    case 'tab':
      baseClass = `tab-btn ${active ? 'active' : ''}`;
      break;
    default:
      baseClass = 'btn';
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClass} ${className}`}
      style={inlineStyles}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default memo(Button);
