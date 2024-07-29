'use client';
import React, { FC } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material';
import { theme } from '@/assets/mui/mui-customize';

interface IThemProviderProps {
  children: React.ReactNode;
}

const ThemProvider: FC<IThemProviderProps> = ({ children }) => {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppRouterCacheProvider>
  );
};

export default ThemProvider;
