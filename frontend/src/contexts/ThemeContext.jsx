import { createContext, useState, useEffect, useContext } from 'react';

// Create the theme context
export const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Check if user has a saved theme preference or use system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Check if user prefers dark mode
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Apply theme when it changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Also store the theme in localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Get theme-specific styles for inline usage
  const getThemeStyles = () => {
    const styles = {
      light: {
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        primaryColor: '#3b82f6',
        secondaryColor: '#6b7280',
        accentColor: '#f59e0b',
        borderColor: '#e5e7eb',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        // Enhanced light mode styles
        cardBackground: '#ffffff',
        inputBackground: '#ffffff',
        navBackground: '#ffffff',
        sidebarBackground: '#f9fafb',
        tableHeaderBackground: '#f9fafb',
        tableRowHoverBackground: '#f3f4f6',
        buttonPrimaryBackground: '#3b82f6',
        buttonPrimaryText: '#ffffff',
        buttonSecondaryBackground: '#f3f4f6',
        buttonSecondaryText: '#4b5563',
        navLinkColor: '#4b5563',
        navLinkActiveColor: '#3b82f6',
        footerBackground: '#f9fafb',
        footerText: '#6b7280',
        modalBackground: '#ffffff',
        codeBackground: '#f3f4f6',
        tooltipBackground: '#374151',
        tooltipText: '#ffffff',
        chartColors: ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#6366f1', '#64748b'],
        gradientFrom: '#f9fafb',
        gradientTo: '#f3f4f6',
        dangerColor: '#ef4444',
        successColor: '#10b981',
        warningColor: '#f59e0b',
        infoColor: '#3b82f6'
      },
      dark: {
        backgroundColor: '#1f2937',
        textColor: '#f3f4f6',
        primaryColor: '#3b82f6',
        secondaryColor: '#9ca3af',
        accentColor: '#f59e0b',
        borderColor: '#374151',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        // Enhanced dark mode styles
        cardBackground: '#1f2937',
        inputBackground: '#374151',
        navBackground: '#111827',
        sidebarBackground: '#111827',
        tableHeaderBackground: '#374151',
        tableRowHoverBackground: '#374151',
        buttonPrimaryBackground: '#3b82f6',
        buttonPrimaryText: '#ffffff',
        buttonSecondaryBackground: '#374151',
        buttonSecondaryText: '#f3f4f6',
        navLinkColor: '#9ca3af',
        navLinkActiveColor: '#60a5fa',
        footerBackground: '#111827',
        footerText: '#9ca3af',
        modalBackground: '#1f2937',
        codeBackground: '#374151',
        tooltipBackground: '#1f2937',
        tooltipText: '#f3f4f6',
        chartColors: ['#60a5fa', '#fbbf24', '#f87171', '#34d399', '#a78bfa', '#f472b6', '#818cf8', '#94a3b8'],
        gradientFrom: '#111827',
        gradientTo: '#1f2937',
        dangerColor: '#f87171',
        successColor: '#34d399',
        warningColor: '#fbbf24',
        infoColor: '#60a5fa'
      }
    };
    
    return styles[theme];
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, getThemeStyles }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 