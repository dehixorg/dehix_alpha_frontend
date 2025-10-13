import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import StoreProvider from './storeProvider';
import { AuthProvider } from './AuthContext';
import { Providers } from './Providers';

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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <StoreProvider>
            {' '}
            <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <TooltipProvider>
                  <NetworkProvider>{children}</NetworkProvider>
                </TooltipProvider>
                <Toaster />
              </ThemeProvider>
            </AuthProvider>
          </StoreProvider>
        </Providers>
      </body>
    </html>
  );
}
