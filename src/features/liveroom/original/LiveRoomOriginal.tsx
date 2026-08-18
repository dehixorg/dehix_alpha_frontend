'use client';

import { useEffect, type ComponentType, type ReactNode } from 'react';

import { installLiveRoomFetchBridge } from './api/runtime';
import { AuthProvider } from './context/AuthContext';
import BusinessDashboard from './pages/BusinessDashboard';
import CreateRoom from './pages/CreateRoom';
import LiveRoom from './pages/LiveRoom';
import TalentDashboard from './pages/TalentDashboard';

function LiveRoomRuntime({ children }: { children: ReactNode }) {
  useEffect(() => {
    installLiveRoomFetchBridge();
  }, []);

  return (
    <AuthProvider>
      <div className="liveroom-scope min-w-0">{children}</div>
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
