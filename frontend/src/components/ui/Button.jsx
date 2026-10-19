import { forwardRef } from 'react';
import { ArrowRight, Plus, Download, Trash2, Star, Share2, Edit3, Lock, User, Mail, Phone } from 'lucide-react';

const Button = forwardRef(({ 
  className, 
  variant = 'premium', 
  size = 'md', 
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  ...props 
}, ref) => {
  const variants = {
    premium: 'btn-premium',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };

  const sizes = {
    sm: 'px-6 py-2.5 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg',
  };

  const iconMap = {
    ArrowRight, Plus, Download, Trash2, Star, Share2, Edit3, Lock, User, Mail, Phone,
  };

  const Icon = leftIcon ? iconMap[leftIcon] : null;
  const RightIcon = rightIcon ? iconMap[rightIcon] : null;

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {Icon && !loading && <Icon className={`w-4 h-4 mr-2 ${rightIcon ? 'ml-2 mr-0' : ''}`} />}
      {children}
      {RightIcon && !loading && <RightIcon className="w-4 h-4 ml-2" />}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
