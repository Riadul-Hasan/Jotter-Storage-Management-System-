import { forwardRef } from 'react';

const Input = forwardRef(({ 
  className, 
  label, 
  error, 
  helperText,
  type = 'text',
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`input-premium ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : ''} ${className || ''}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-white/40">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
