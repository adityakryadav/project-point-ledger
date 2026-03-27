import React from 'react';

export default function Button({
  type = 'button',
  onClick,
  disabled,
  children,
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold',
        'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2',
        'bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 disabled:hover:scale-100',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

