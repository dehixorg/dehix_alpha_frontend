import { useState } from 'react';
import Link from 'next/link';
import { Plus, User, Users } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const ProjectTypeCard = ({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) => (
  <Link href={href} className="block h-full">
    <Card className="h-full transition-all hover:border-primary hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="min-h-[40px]">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  </Link>
);

interface ProjectTypeDialogProps {
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function ProjectTypeDialog({
  trigger,
  onOpenChange,
}: ProjectTypeDialogProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange?.(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="h-9 gap-2 px-4">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Project</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="grid md:grid-cols-1">
          <div className="hidden md:block bg-primary/5 p-8">
            <div className="h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-2">Start a New Project</h3>
              <p className="text-muted-foreground mb-8">
                Choose the type of project that best fits your needs. You can
                always change this later.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <span>Select project type</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    2
                  </div>
                  <span>Fill in project details</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl">Create New Project</DialogTitle>
              <DialogDescription>
                Select the type of project you want to create
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-2">
              <ProjectTypeCard
                title="Single Profile"
                description="Hire one professional for your project"
                icon={User}
                href="/business/add-project?mode=single"
              />
              <ProjectTypeCard
                title="Multiple Profiles"
                description="Hire a team of professionals"
                icon={Users}
                href="/business/add-project?mode=multiple"
              />
            </div>

            <Separator className="my-6" />

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Not sure which to choose? {'\t'}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-primary hover:underline inline-flex items-center gap-1">
                      Learn more
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 space-y-4" align="center">
                    <h4 className="font-medium leading-none">Project Types</h4>
                    <div className="space-y-3">
                      <div className="border-l-2 border-primary pl-3">
                        <h5 className="font-medium text-sm">Single Profile</h5>
                        <p className="text-xs text-muted-foreground">
                          Choose this option if you need to hire one
                          professional for a specific role or skill set. Best
                          for focused, individual contributions.
                        </p>
                      </div>
                      <div className="border-l-2 border-primary pl-3">
                        <h5 className="font-medium text-sm">
                          Multiple Profiles
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          Select this when you need to build a team with
                          multiple roles. Ideal for larger projects requiring
                          diverse skills and collaboration.
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>{' '}
                about each project type.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
