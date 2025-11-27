'use client';

import '@rainbow-me/rainbowkit/styles.css';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { polygon } from 'wagmi/chains';
import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
  darkTheme,
} from '@rainbow-me/rainbowkit';

const config = getDefaultConfig({
  appName: 'Dehix',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [polygon],
  ssr: true,
});

const queryClient = new QueryClient();

export default function Web3Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme(),
            darkMode: darkTheme(),
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
