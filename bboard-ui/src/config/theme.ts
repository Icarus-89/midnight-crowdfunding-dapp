import { createTheme, alpha } from '@mui/material/styles';

export const getBerryTheme = (mode: 'light' | 'dark' = 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#6366F1',
        light: '#818CF8',
        dark: '#4338CA',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0EA5E9',
        light: '#38BDF8',
        dark: '#0284C7',
        contrastText: '#ffffff',
      },
      success: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
      },
      warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
      },
      background: {
        default: isDark ? '#090D16' : '#F8FAFC',
        paper: isDark ? '#111827' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F9FAFB' : '#0F172A',
        secondary: isDark ? '#9CA3AF' : '#64748B',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.08)',
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      h1: { fontWeight: 800, letterSpacing: '-0.03em' },
      h2: { fontWeight: 800, letterSpacing: '-0.025em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.015em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 700, textTransform: 'none' },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundImage: 'none',
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.65)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            boxShadow: isDark
              ? '0px 12px 32px rgba(0, 0, 0, 0.4), inset 0px 1px 0px rgba(255, 255, 255, 0.05)'
              : '0px 12px 32px rgba(15, 23, 42, 0.05), inset 0px 1px 0px rgba(255, 255, 255, 0.8)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(15, 23, 42, 0.08)',
            transition: 'all 0.25s ease-in-out',
            '&:hover': {
              borderColor: isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.25)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 20,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 22px',
            boxShadow: 'none',
            fontWeight: 700,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0px 6px 20px rgba(99, 102, 241, 0.3)',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            borderRadius: 10,
          },
        },
      },
    },
  });
};

export const theme = getBerryTheme('dark');
