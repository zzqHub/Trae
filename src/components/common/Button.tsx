import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-dark-700 text-dark-100 hover:bg-dark-600 border border-dark-600',
  primary: 'bg-industrial-600 text-white hover:bg-industrial-500 border border-industrial-500',
  secondary: 'bg-dark-800 text-dark-200 hover:bg-dark-700 border border-dark-700',
  outline: 'bg-transparent text-dark-300 border border-dark-600 hover:bg-dark-800 hover:border-dark-500',
  ghost: 'bg-transparent text-dark-300 hover:bg-dark-800 border border-transparent',
  danger: 'bg-danger-600 text-white hover:bg-danger-500 border border-danger-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-6 text-base',
  icon: 'h-9 w-9 p-0',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-industrial-500/50 disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
