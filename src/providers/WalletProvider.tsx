'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import {
  arbitrumSepolia,
  baseSepolia,
  mainnet,
  polygon,
  sepolia,
  polygonAmoy,
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http } from 'wagmi';
import React, { ReactNode } from 'react';

const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'test_project';

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
  appName: 'Dehix',
  projectId: projectId,
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http('https://rpc-amoy.polygon.technology'),
  },
  wallets: [...wallets],
  ssr: true,
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
