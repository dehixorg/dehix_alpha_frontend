'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, LogOut } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function WalletConnectButton() {
  const { isConnected } = useAccount();
  const { connectWallet, disconnectWallet, isLoading, address } =
    useWalletConnection();
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);

  const handleConnectClick = async () => {
    if (isConnected && address) {
      await connectWallet();
    }
  };

  const handleDisconnectClick = () => {
    setShowConfirmDisconnect(true);
  };

  const confirmDisconnect = async () => {
    await disconnectWallet();
    setShowConfirmDisconnect(false);
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal, mounted }) => {
              const ready = mounted;
              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  <Button
                    onClick={openConnectModal}
                    type="button"
                    size="sm"
                    className="h-9 gap-2 rounded-full hover:scale-105 transition-transform px-3"
                  >
                    <Wallet className="h-3.5 w-3.5" strokeWidth={2.2} />
                    Connect Wallet
                  </Button>
                </div>
              );
            }}
          </ConnectButton.Custom>
        ) : (
          <>
            <Button
              onClick={handleConnectClick}
              disabled={isLoading}
              variant="outline"
              className="gap-2 rounded-full hover:scale-105 transition-transform hover:bg-accent"
            >
              <Wallet size={18} />
              {isLoading ? 'Connecting...' : 'Authenticate with Wallet'}
            </Button>
            <Button
              onClick={handleDisconnectClick}
              disabled={isLoading}
              variant="outline"
              size="icon"
              className="gap-2 rounded-full hover:scale-105 transition-transform"
              title="Disconnect wallet"
            >
              <LogOut size={18} />
            </Button>
          </>
        )}
      </div>

      <Dialog
        open={showConfirmDisconnect}
        onOpenChange={setShowConfirmDisconnect}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Wallet</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect your wallet? You will be
              logged out.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDisconnect(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDisconnect}
              disabled={isLoading}
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
