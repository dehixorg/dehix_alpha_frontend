import React from 'react';
import { GraduationCap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DateHistory } from '@/components/shared/DateHistory';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import DeleteIconButton from '@/components/shared/DeleteIconButton';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface EducationProps {
  _id?: string;
  degree?: string;
  universityName?: string;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date | 'current';
  grade?: string;
  className?: string;
  onDelete?: () => Promise<void> | void;
}

const EducationInfoCard: React.FC<EducationProps> = ({
  degree,
  universityName,
  fieldOfStudy,
  startDate,
  endDate,
  grade,
  className,
  onDelete,
}) => {
  const mappedEndDate = endDate === 'current' ? null : endDate;
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Card
      className={cn(
        'w-full h-full mx-auto md:max-w-2xl overflow-hidden rounded-xl border bg-card/60 shadow-sm transition-all duration-200 group hover:shadow-md hover:-translate-y-0.5 border-border/50 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
        className,
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {universityName || 'University Name'}
              </CardTitle>
              <CardDescription className="mt-0.5">
                {degree || 'Degree'}
                {fieldOfStudy ? ` · ${fieldOfStudy}` : ' · Field of Study'}
              </CardDescription>
            </div>
          </div>

          {onDelete && (
            <>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <DeleteIconButton
                    label={isDeleting ? 'Deleting' : 'Delete'}
                    onDelete={async () => {
                      setOpen(true);
                    }}
                    disabled={isDeleting}
                  />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete education entry?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently remove
                      this education record from your profile.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      disabled={isDeleting}
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <DeleteIconButton
                      iconOnly={false}
                      label={isDeleting ? 'Deleting' : 'Delete'}
                      onDelete={async () => {
                        await handleDelete();
                        setOpen(false);
                      }}
                      disabled={isDeleting}
                    />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardHeader>

      <Separator className="group-hover:bg-primary/30 transition-colors" />

      <CardContent className="pt-6 pb-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Grade</span>
            <Badge variant="secondary" className="text-xs">
              {grade || 'N/A'}
            </Badge>
          </div>

          {startDate && (
            <DateHistory startDate={startDate} endDate={mappedEndDate} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationInfoCard;
