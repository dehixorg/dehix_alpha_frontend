import React from 'react';
import { MessageSquare } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type FreelancerListItemData = {
  _id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
  perHourPrice?: number;
  domain?: string[];
};

interface FreelancerListItemProps {
  freelancer: FreelancerListItemData;
  className?: string;
  onChatClick: () => void;
}

const FreelancerListItem: React.FC<FreelancerListItemProps> = ({
  freelancer,
  className,
  onChatClick,
}) => {
  const displayName =
    freelancer.firstName && freelancer.lastName
      ? `${freelancer.firstName} ${freelancer.lastName}`
      : freelancer.userName;

  return (
    <Card
      className={cn(
        'group w-full overflow-hidden rounded-xl bg-muted-foreground/20 dark:bg-muted/20 shadow-sm hover:shadow-md transition-all',
        className,
      )}
      role="button"
      tabIndex={0}
      aria-label={`Open chat with ${freelancer.userName}`}
      onClick={onChatClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChatClick();
        }
      }}
    >
      <CardContent className="pt-6 px-4 pb-3">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={freelancer.profilePic}
                alt={freelancer.userName}
              />
              <AvatarFallback>
                {freelancer.firstName?.[0]?.toUpperCase() ||
                  freelancer.userName[0]?.toUpperCase() ||
                  'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="mt-1 text-sm font-semibold truncate max-w-[16rem]">
            {displayName}
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
            {typeof freelancer.perHourPrice === 'number' && (
              <Badge variant="outline" className="text-xs">
                {freelancer.perHourPrice}/hr
              </Badge>
            )}
          </div>
          {freelancer.domain && freelancer.domain.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1 max-w-[18rem]">
              {freelancer.domain.slice(0, 3).map((d) => (
                <Badge key={d} variant="secondary" className="text-[10px]">
                  {d}
                </Badge>
              ))}
              {freelancer.domain.length > 3 && (
                <Badge variant="secondary" className="text-[10px]">
                  +{freelancer.domain.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4">
        <Button
          variant="outline"
          className="w-full group-hover:shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onChatClick();
          }}
          aria-label={`Chat with ${freelancer.userName}`}
        >
          <MessageSquare className="h-4 w-4 mr-2" /> Start chat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FreelancerListItem;
