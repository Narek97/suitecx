import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import '@/assets/styles/base.scss';
import ReactQueryProvider from '@/providers/react-query-provider';
import ThemProvider from '@/providers/them-provider';
import RecoilProvider from '@/providers/recoil-provider';
import SnackbarProvider from '@/providers/snackbar-provider';
import { firaSans } from '@/utils/constants/general';

export const metadata: Metadata = {
  title: 'Suite CX',
  description:
    'Contact SuiteCX to learn how Customer Experience Management (CEM) helps top organizations stay on top of their competitors.',
  keywords: 'Suite CX',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={firaSans.style}>
        <RecoilProvider>
          <ReactQueryProvider>
            <ThemProvider>
              <SnackbarProvider>
                <Suspense>{children}</Suspense>
              </SnackbarProvider>
            </ThemProvider>
          </ReactQueryProvider>
        </RecoilProvider>
      </body>
    </html>
  );
}
