"use client";

import OfflinePage from "@/components/shared/OfflinePage";
import { useNetwork } from "@/hooks/useNetwork";

export default function NetworkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
    const isOnline = useNetwork();

    if (!isOnline) {
      return <OfflinePage isOnline={isOnline} />;
    }
  
    return <>{children}</>;
}
