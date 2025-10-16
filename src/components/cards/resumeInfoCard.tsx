import React from 'react';
import { format } from 'date-fns';
import { FileText, CalendarDays } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ResumeProps {
  _id: string;
  personalInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  professionalSummary?: string;
  selectedTemplate?: string;
  updatedAt?: string;
  onClick?: () => void;
}

const ResumeInfoCard: React.FC<ResumeProps> = ({
  personalInfo,
  professionalSummary,
  selectedTemplate,
  updatedAt,
  onClick,
}) => {
  return (
    <Card
      className="w-full h-full mx-auto md:max-w-2xl cursor-pointer border shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 group"
      onClick={onClick}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/15">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate">
              {personalInfo?.firstName || 'No'}{' '}
              {personalInfo?.lastName || 'Name'}
            </CardTitle>
            <CardDescription className="truncate">
              {personalInfo?.email || 'No email'}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedTemplate ? (
            <Badge variant="secondary" className="uppercase">
              {selectedTemplate}
            </Badge>
          ) : (
            <Badge variant="outline">No template</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {professionalSummary || 'No professional summary available'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-muted-foreground">
        <span className="flex items-center gap-2 text-xs">
          <CalendarDays className="h-4 w-4" />
          {updatedAt
            ? `Last updated: ${format(new Date(updatedAt), 'MMM d, yyyy')}`
            : 'No update date'}
        </span>
      </CardFooter>
    </Card>
  );
};

export default ResumeInfoCard;
