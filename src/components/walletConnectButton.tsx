'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/smartContract';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
}

export function WalletConnectButton() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // ✅ Replace with your deployed contract address & ABI
  const contractAddress = CONTRACT_ADDRESS;
  const contractAbi = CONTRACT_ABI;

  // Check if wallet is already connected on component mount
  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      setWallet({
        isConnected: false,
        address: null,
        balance: null,
        chainId: null,
      });
    } else {
      connectWallet();
    }
  }, []);

  const handleChainChanged = useCallback(() => {
    window.location.reload();
  }, []);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);

      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it to continue.');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      setWallet({
        isConnected: true,
        address,
        balance: ethers.formatEther(balance),
        chainId: Number(network.chainId),
      });

      // ✅ After wallet connects, check if user is already registered
      await checkAndReward(provider, signer, address);

    } catch (error: any) {
      console.error('Error connecting wallet:', error);

      if (error.code === 4001) {
        alert('Please connect to MetaMask to continue.');
      } else {
        alert('An error occurred while connecting to the wallet.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
    });
  };

  const checkAndReward = async (
    provider: ethers.BrowserProvider,
    signer: ethers.Signer,
    address: string
  ) => {
    try {
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);

      const isRegistered = await contract.isAddressRegistered(address);

      if (!isRegistered) {
        console.log("User not registered. Rewarding...");
        const tx = await contract.reward(address);
        await tx.wait();
        console.log("Reward transaction confirmed:", tx.hash);
        alert("🎉 Welcome! You just received your reward.");
      } else {
        console.log("User already registered.");
      }
    } catch (err) {
      console.error("Error checking/rewarding user:", err);
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string): string => {
    return parseFloat(balance).toFixed(4);
  };

  if (wallet.isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-accent/50 rounded-md text-sm">
          <span className="text-muted-foreground">
            {formatBalance(wallet.balance || '0')} ETH
          </span>
          <span className="text-muted-foreground/50">|</span>
          <span className="font-mono text-foreground">
            {formatAddress(wallet.address || '')}
          </span>
        </div>

        <button
          onClick={disconnectWallet}
          className="inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
