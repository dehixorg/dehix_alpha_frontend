'use client';

import { useAccount } from 'wagmi';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, LogOut } from 'lucide-react';
import { useState } from 'react';
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
    const { connectWallet, disconnectWallet, isLoading, address } = useWalletConnection();
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
                    <ConnectButton />
                ) : (
                    <>
                        <Button
                            onClick={handleConnectClick}
                            disabled={isLoading}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Wallet size={18} />
                            {isLoading ? 'Connecting...' : 'Authenticate with Wallet'}
                        </Button>
                        <Button
                            onClick={handleDisconnectClick}
                            disabled={isLoading}
                            variant="outline"
                            className="gap-2"
                        >
                            <LogOut size={18} />
                            Disconnect
                        </Button>
                    </>
                )}
            </div>

            <Dialog open={showConfirmDisconnect} onOpenChange={setShowConfirmDisconnect}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Disconnect Wallet</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to disconnect your wallet? You will be logged out.
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
