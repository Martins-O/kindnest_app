import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Heart } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95';
    
    const variants = {
      primary: 'bg-gradient-to-r from-kindnest-500 to-kindnest-teal-600 hover:from-kindnest-600 hover:to-kindnest-teal-700 text-white focus:ring-kindnest-500 shadow-lg hover:shadow-xl warm-glow',
      secondary: 'bg-gradient-to-r from-kindnest-100 to-kindnest-200 hover:from-kindnest-200 hover:to-kindnest-300 text-kindnest-800 focus:ring-kindnest-500 shadow-md hover:shadow-lg',
      outline: 'border-2 border-kindnest-400/30 bg-kindnest-500/10 hover:bg-kindnest-500/20 text-white focus:ring-kindnest-400/50 backdrop-blur-sm',
      danger: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 bg-kindnest-300 rounded-full animate-pulse">
            <Heart className="h-4 w-4 text-white animate-bounce" />
          </div>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };