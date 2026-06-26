/**
 * CivicHero Design Tokens
 * Reusable design language tokens for consistent styling and layouts.
 */

export const DESIGN_TOKENS = {
  // Border Radius Constants
  radius: {
    xs: 'rounded-md',      // 6px
    sm: 'rounded-xl',      // 12px
    md: 'rounded-2xl',     // 16px
    lg: 'rounded-[24px]',  // 24px
    xl: 'rounded-[28px]',  // 28px
    xxl: 'rounded-[32px]', // 32px
    full: 'rounded-full',
  },

  // Shadow Constants
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    xxl: 'shadow-2xl',
  },

  // Color Mapping Helpers (Status & Priority Styles)
  colors: {
    brand: {
      primary: 'text-brand-primary',
      primaryBg: 'bg-brand-primary',
      secondary: 'text-brand-secondary',
      secondaryBg: 'bg-brand-secondary',
      accent: 'text-brand-accent',
      accentBg: 'bg-brand-accent',
      muted: 'text-brand-muted',
      bg: 'bg-brand-bg',
    },
    status: {
      Live: {
        bg: 'bg-red-500/10 text-red-600 border-red-500/20',
        dot: 'bg-red-500',
        text: 'text-red-600',
        badge: 'bg-red-500 text-white',
      },
      Reported: {
        bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        dot: 'bg-blue-500',
        text: 'text-blue-600',
        badge: 'bg-blue-500 text-white',
      },
      'In Progress': {
        bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        dot: 'bg-amber-500',
        text: 'text-amber-600',
        badge: 'bg-amber-500 text-white',
      },
      Resolved: {
        bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        dot: 'bg-emerald-500',
        text: 'text-emerald-600',
        badge: 'bg-emerald-500 text-white',
      },
    },
    priority: {
      Critical: 'bg-red-50 text-red-700 border-red-100',
      High: 'bg-orange-50 text-orange-700 border-orange-100',
      Medium: 'bg-blue-50 text-blue-700 border-blue-100',
      Low: 'bg-slate-50 text-slate-700 border-slate-100',
    },
  },

  // Typography Constants
  typography: {
    heading: 'font-sans font-extrabold tracking-tight',
    subheading: 'font-sans font-bold tracking-tight',
    body: 'font-body text-brand-muted',
    technical: 'font-mono uppercase tracking-wider',
  },

  // Standard Spacings (Tailwind Classes)
  spacing: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10',
    grid: 'grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12',
  },

  // Transitions
  transitions: {
    default: 'transition-all duration-300 ease-in-out',
    fast: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-500 ease-in-out',
  },
};
