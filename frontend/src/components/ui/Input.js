import React from 'react';

export default function Input({
  label,
  id,
  className = '',
  labelClassName = '',
  inputClassName = '',
  ...props
}) {
  const resolvedLabelClassName =
    labelClassName || 'mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300';

  return (
    <div className={['w-full', className].join(' ')}>
      <label htmlFor={id} className={resolvedLabelClassName}>
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={[
          'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white',
          'transition-all duration-200',
          'placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50',
          'disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500',
          inputClassName,
        ].join(' ')}
      />
    </div>
  );
}

