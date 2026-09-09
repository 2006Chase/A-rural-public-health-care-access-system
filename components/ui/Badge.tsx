import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emergency' | 'urgent' | 'routine' | 'govt' | 'private' | 'sync' | 'neutral' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'neutral', ...props }) => {
  const baseStyles = 'inline-flex items-center font-medium px-2.5 py-0.5 rounded-full text-xs tracking-wide';

  const variantStyles = {
    emergency: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
    urgent: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    routine: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    govt: 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold',
    private: 'bg-purple-50 text-purple-700 border border-purple-200',
    sync: 'bg-blue-50 text-blue-700 border border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variantStyles[variant], className))} {...props}>
      {children}
    </span>
  );
};
