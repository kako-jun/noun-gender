'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
// Simple className utility without external dependencies
function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'selected';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
          variant === 'primary' ? 'bg-solarized-orange hover:bg-solarized-yellow text-white shadow-md hover:shadow-lg focus:ring-solarized-orange' :
          variant === 'secondary' ? 'bg-solarized-base3 dark:bg-solarized-base03 text-solarized-base01 dark:text-solarized-base1 hover:bg-solarized-base1 dark:hover:bg-solarized-base01 hover:text-solarized-base3 dark:hover:text-solarized-base03 border border-solarized-base1 dark:border-solarized-base01' :
          variant === 'ghost' ? 'text-solarized-base01 dark:text-solarized-base1 hover:bg-solarized-base2 dark:hover:bg-solarized-base02' :
          variant === 'selected' ? 'bg-solarized-blue text-white hover:bg-solarized-cyan shadow-md border border-solarized-blue' :
          ''
        } ${
          size === 'sm' ? 'px-3 py-2 text-sm' :
          size === 'md' ? 'px-4 py-2 text-base' :
          size === 'lg' ? 'px-6 py-3 text-lg' :
          ''
        } ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';