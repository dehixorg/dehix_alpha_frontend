"use client";

import { useEffect } from "react";
import { useNetwork } from "@/hooks/useNetwork";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { WifiOff } from "lucide-react";

export default function NetworkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOnline = useNetwork();
  const { toast, dismiss } = useToast();

  useEffect(() => {
    if (!isOnline) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <WifiOff className="w-6 h-6 text-white animate-pulse" />
            <span>Internet Disconnected</span>
          </div>
        ) as any,
        description: "Please check your connection.",
        variant: "destructive",
        duration: Infinity,
      });

      document.body.style.pointerEvents = "none";
    } else {
      dismiss(); 
      document.body.style.pointerEvents = "auto";
    }
  }, [isOnline]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
