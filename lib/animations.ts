/**
 * CivicHero Animation System
 * Centralized Framer Motion animation variants for clean, hardware-accelerated fluid UI.
 */

import { Variants } from 'framer-motion';

export const ANIMATIONS = {
  // Page entry transition
  pageTransition: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },

  // Base fade-in variant
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  } as Variants,

  // Slide up with staggered option
  slideUp: {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
  } as Variants,

  // Dialog/Modal scale & slide transition
  modal: {
    hidden: { opacity: 0, scale: 0.95, y: 16 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 350 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 16,
      transition: { duration: 0.2 }
    },
  } as Variants,

  // Backdrop overlay fade
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,

  // Toast notification alert (slide in from top/right)
  toast: {
    hidden: { opacity: 0, y: -24, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', damping: 20, stiffness: 300 }
    },
    exit: { 
      opacity: 0, 
      y: -24, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  } as Variants,

  // Sequential lists staggered container
  staggerContainer: (staggerChildren = 0.05) => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
      }
    }
  }),

  // Interactive Micro-interactions
  hoverLift: {
    rest: { y: 0 },
    hover: { 
      y: -4, 
      transition: { duration: 0.2, ease: 'easeOut' } 
    }
  } as Variants,

  scaleUp: {
    rest: { scale: 1 },
    hover: { 
      scale: 1.02, 
      transition: { duration: 0.2, ease: 'easeOut' } 
    }
  } as Variants,
};
