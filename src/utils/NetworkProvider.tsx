'use client';

import { useNetwork } from '@/hooks/useNetwork';
import OfflinePage from '@/components/shared/OfflinePage';

export default function NetworkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOnline = useNetwork();
  return <>{isOnline ? children : <OfflinePage />}</>;
}
