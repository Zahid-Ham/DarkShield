import React from 'react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  disabled = false,
  onClick,
  style = {},
  ...props
}) {
  let bg = 'var(--accent-orange)';
  let color = '#FFFFFF';
  let border = '1px solid var(--accent-orange)';

  if (variant === 'secondary') {
    bg = 'var(--bg-subtle)';
    color = 'var(--text-primary)';
    border = '1px solid var(--border-medium)';
  } else if (variant === 'outline') {
    bg = 'var(--bg-surface)';
    color = 'var(--text-primary)';
    border = '1px solid var(--border-medium)';
  } else if (variant === 'danger') {
    bg = 'var(--status-critical-text)';
    color = '#FFFFFF';
    border = '1px solid var(--status-critical-text)';
  }

  const paddingMap = {
    sm: '5px 10px',
    md: '7px 14px',
    lg: '10px 18px'
  };

  const fontSizeMap = {
    sm: '11px',
    md: '12px',
    lg: '13px'
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: paddingMap[size] || paddingMap.md,
        fontSize: fontSizeMap[size] || fontSizeMap.md,
        fontWeight: '600',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: bg,
        color: color,
        border: border,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        boxShadow: variant === 'primary' ? '0 1px 2px rgba(234, 88, 12, 0.2)' : 'var(--shadow-subtle)',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        ...style
      }}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  );
}
