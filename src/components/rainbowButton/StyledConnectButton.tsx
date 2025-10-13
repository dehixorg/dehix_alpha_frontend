import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const StyledConnectButton: React.FC = () => {
  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <Button
            variant="default" // you can use any variant: default, ghost, outline, etc.
            size="sm"
            onClick={connected ? openAccountModal : openConnectModal}
          >
            {connected ? account.displayName : 'Connect Wallet'}
          </Button>
        );
      }}
    </RainbowConnectButton.Custom>
  );
};

export default StyledConnectButton;
