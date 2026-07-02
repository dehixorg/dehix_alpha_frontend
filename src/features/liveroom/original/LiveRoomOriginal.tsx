'use client';

import { useEffect, useRef, type ComponentType, type ReactNode } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

import { installLiveRoomFetchBridge } from './api/runtime';
import { AuthProvider } from './context/AuthContext';
import BusinessDashboard from './pages/BusinessDashboard';
import CreateRoom from './pages/CreateRoom';
import LiveRoom from './pages/LiveRoom';
import TalentDashboard from './pages/TalentDashboard';

function LiveRoomRuntime({ children }: { children: ReactNode }) {
  const restoreFetchBridgeRef = useRef<(() => void) | null>(null);

  if (!restoreFetchBridgeRef.current) {
    restoreFetchBridgeRef.current = installLiveRoomFetchBridge();
  }

  useEffect(
    () => () => {
      restoreFetchBridgeRef.current?.();
      restoreFetchBridgeRef.current = null;
    },
    [],
  );

  return (
    <AuthProvider>
      <div className="liveroom-scope min-w-0">{children}</div>
      <SonnerToaster position="bottom-right" richColors />
    </AuthProvider>
  );
}

function withRuntime(Component: ComponentType) {
  return function WrappedLiveRoomOriginal() {
    return (
      <LiveRoomRuntime>
        <Component />
      </LiveRoomRuntime>
    );
  };
}

export const OriginalBusinessDashboard = withRuntime(BusinessDashboard);
export const OriginalCreateRoom = withRuntime(CreateRoom);
export const OriginalLiveRoom = withRuntime(LiveRoom);
export const OriginalTalentDashboard = withRuntime(TalentDashboard);
