import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'subtle' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  className = '',
  onClick,
  whileTap,
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

  const tapEffect = whileTap ?? (interactive || onClick ? { scale: 0.97 } : undefined);

  return (
    <motion.div
      onClick={onClick}
      whileTap={tapEffect}
      className={`${variantClasses[variant]} ${paddingClasses[padding]} rounded-3xl transition-colors duration-300 ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
