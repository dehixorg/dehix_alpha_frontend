import React, { useState } from 'react';
import { format } from 'date-fns';
import { FileText, CalendarDays, Trash2, MoreHorizontal } from 'lucide-react';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  onDelete?: (id: string) => void;
}

const ResumeInfoCard: React.FC<ResumeProps> = ({
  personalInfo,
  professionalSummary,
  selectedTemplate,
  updatedAt,
  onClick,
  onDelete,
  _id,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(_id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on menu
    if ((e.target as HTMLElement).closest('.dropdown-menu')) {
      return;
    }
    onClick?.();
  };
  return (
    <>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resume? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card
        className="w-full h-full mx-auto md:max-w-2xl cursor-pointer border shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/30 group"
        onClick={handleCardClick}
      >
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="dropdown-menu">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-100 transition-opacity hover:bg-accent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Resume
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
    </>
  );
};

export default ResumeInfoCard;
