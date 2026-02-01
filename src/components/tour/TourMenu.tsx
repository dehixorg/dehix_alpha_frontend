'use client';

import { Compass, Play, ArrowRight, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type Props = {
  onThisPageTour: () => void;
  onFullPlatformTour: () => void;
};

export default function PlatformTourMenu({
  onThisPageTour,
  onFullPlatformTour,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 dark:bg-gray-900 dark:border-gray-800"
        sideOffset={8}
      >
        <Card className="border-0 shadow-none dark:bg-gray-900">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Compass className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Interactive Tours
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground dark:text-gray-400">
              Discover platform features with guided tours
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Platform Tour */}
            <div
              className="group cursor-pointer rounded-lg border border-border/50 dark:border-gray-700 p-4 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-all duration-200"
              onClick={onFullPlatformTour}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm dark:text-gray-100">
                      Platform Tour
                    </h4>
                    <Badge
                      variant="secondary"
                      className="text-xs dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800"
                    >
                      Comprehensive
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 leading-relaxed">
                    Complete overview of all platform features, navigation, and
                    key areas. Perfect for new users.
                  </p>
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <span className="font-medium">15+ steps</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 dark:hover:bg-blue-900/50"
                >
                  <Play className="h-4 w-4 dark:text-blue-400" />
                </Button>
              </div>
            </div>

            <Separator className="my-2 dark:bg-gray-700" />

            {/* Page Tour */}
            <div
              className="group cursor-pointer rounded-lg border border-border/50 dark:border-gray-700 p-4 hover:border-green-200 dark:hover:border-green-800 hover:bg-green-50/50 dark:hover:bg-green-950/50 transition-all duration-200"
              onClick={onThisPageTour}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm dark:text-gray-100">
                      Page Tour
                    </h4>
                    <Badge
                      variant="outline"
                      className="text-xs border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                    >
                      Quick
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 leading-relaxed">
                    Quick tour of current page features and functionality. Get
                    familiar with what&apos;s available here.
                  </p>
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <span className="font-medium">3-5 steps</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 dark:hover:bg-green-900/50"
                >
                  <Play className="h-4 w-4 dark:text-green-400" />
                </Button>
              </div>
            </div>

            <div className="pt-2 text-center">
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Press{' '}
                <kbd className="px-1 py-0.5 bg-muted dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 rounded text-xs border">
                  Esc
                </kbd>{' '}
                to exit any tour
              </p>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
