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
    labelClassName || 'mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300';

  return (
    <div className={['w-full', className].join(' ')}>
      <label htmlFor={id} className={resolvedLabelClassName}>
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={[
          'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2 text-sm text-gray-900 dark:text-white',
          'transition-all duration-300',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50',
          'disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500',
          inputClassName,
        ].join(' ')}
      />
    </div>
  );
}

