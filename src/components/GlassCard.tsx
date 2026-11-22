import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...rest
}) => {
  const variantClasses = {
    default: 'glass-card',
    elevated: 'glass-card-elevated',
    subtle: 'glass-card-subtle',
    accent: 'glass-accent-card',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3.5',
    md: 'p-4',
    lg: 'p-5',
  };

  return (
    <div
      className={`${variantClasses[variant]} ${paddingClasses[padding]} rounded-3xl transition-all duration-200 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
