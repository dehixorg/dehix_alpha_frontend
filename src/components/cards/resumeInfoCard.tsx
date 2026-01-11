import React, { useState } from 'react';
import { format } from 'date-fns';
import { FileText, CalendarDays, Trash2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DeleteConfirmationDialog from '@/components/shared/DeleteConfirmationDialog';

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
  onDelete?: (id: string) => Promise<void>;
}

const ResumeInfoCard: React.FC<ResumeProps> = ({
  _id,
  personalInfo,
  professionalSummary,
  selectedTemplate,
  updatedAt,
  onClick,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(_id);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on delete button
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    onClick?.();
  };
  return (
    <>
      <Card
        className="w-full h-full mx-auto md:max-w-2xl cursor-pointer border shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 group relative"
        onClick={handleCardClick}
      >
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete resume</span>
          </Button>
        </div>
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
      
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Resume"
        description="Are you sure you want to delete this resume? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        confirmLoading={isDeleting}
      />
    </>
  );
};

export default ResumeInfoCard;
