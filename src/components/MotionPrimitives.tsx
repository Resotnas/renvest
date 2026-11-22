import { Variants } from 'framer-motion';

export const ORGANIC_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const PAGE_VARIANTS: Variants = {
  initial: (direction: number = 1) => ({
    opacity: 0,
    x: direction * 30,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: ORGANIC_EASE },
  },
  exit: (direction: number = 1) => ({
    opacity: 0,
    x: direction * -22,
    transition: { duration: 0.18, ease: 'easeOut' },
  }),
};

export const SCREEN_VARIANTS: Variants = {
  initial: { opacity: 0, scale: 0.985, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: ORGANIC_EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.985,
    y: -8,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

export const SUBTAB_VARIANTS: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: ORGANIC_EASE },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.16, ease: 'easeOut' },
  },
};

export const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.04,
    },
  },
};

export const STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: ORGANIC_EASE },
  },
};

export const SPRING_PILL = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 32,
  mass: 0.85,
};
