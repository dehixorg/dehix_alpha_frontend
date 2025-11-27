import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import StoreProvider from './storeProvider';
import { AuthProvider } from './AuthContext';
import Web3Providers from './Web3Providers';

import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import NetworkProvider from '@/utils/NetworkProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dehix',
  description: 'Freelancer platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <html lang="en">
        <body className={inter.className}>
          {' '}
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                <Web3Providers>
                  <NetworkProvider>{children}</NetworkProvider>
                </Web3Providers>
              </TooltipProvider>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </body>
      </html>
    </StoreProvider>
  );
}
