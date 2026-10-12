import React from 'react';

export default function AccessibleButton({
  children,
  onClick,
  variant = 'secondary',
  ariaLabel,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...rest}
    >
      {Icon && <Icon size={20} aria-hidden="true" />}
      {children}
    </button>
  );
}
