"use client";

import { WifiOff, Wifi, RefreshCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function OfflinePage({ isOnline }: { isOnline: boolean }) {
  const [showReconnecting, setShowReconnecting] = useState(false);

  const handleRetry = () => {
    setShowReconnecting(true);
    setTimeout(() => {
      setShowReconnecting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <Card className={`transition-all duration-500 ${!isOnline && "animate-shake"}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className={`rounded-full p-6 ${isOnline ? "bg-primary/5" : "bg-destructive/5"} transition-colors duration-500`}>
                {isOnline ? (
                  <Wifi className="w-12 h-12 text-primary animate-pulse" />
                ) : (
                  <WifiOff className="w-12 h-12 text-destructive animate-pulse" />
                )}
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{isOnline ? "Connected" : "Connection Lost"}</h1>
                <Badge variant={isOnline ? "default" : "destructive"}>
                  {showReconnecting ? "Checking connection..." : isOnline ? "Online" : "Offline"}
                </Badge>
              </div>

              <p className="text-muted-foreground">
                {isOnline
                  ? "You're back online! All features are now available."
                  : "Oops! You've lost your internet connection. Please check your network settings."}
              </p>

              {!isOnline && (
                <Button onClick={handleRetry} disabled={showReconnecting} variant="destructive" className="w-full">
                  <RefreshCcw className={`w-4 h-4 mr-0.5 ${showReconnecting && "animate-spin"}`} />
                  {showReconnecting ? "Checking..." : "Retry"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
