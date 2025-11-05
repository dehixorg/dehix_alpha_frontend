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
    <Card className="h-full transition-all hover:border-primary hover:shadow-md flex flex-col">
      <CardHeader className="flex-1">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4 mx-auto">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg text-center">{title}</CardTitle>
        <CardDescription className="text-center min-h-[40px] mt-2">
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
      <DialogContent className="w-[95vw] max-w-5xl p-0 overflow-hidden flex flex-col h-[90vh] max-h-[800px] sm:max-h-[90vh] m-0 sm:m-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-[350px,1fr] flex-1 overflow-hidden">
          <div className="hidden md:flex flex-col bg-primary/5 p-6 overflow-y-auto">
            <div className="h-full flex flex-col justify-center space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Start a New Project
                </h3>
                <p className="text-muted-foreground text-sm">
                  Choose the type of project that best fits your needs. You can
                  always change this later.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    1
                  </div>
                  <span className="text-sm font-medium">
                    Select project type
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    2
                  </div>
                  <span className="text-sm">Fill in project details</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto">
            <DialogHeader className="mb-6 sm:mb-8">
              <DialogTitle className="text-xl sm:text-2xl">
                Create New Project
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Select the type of project you want to create
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
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
                  <PopoverContent
                    className="w-[280px] sm:w-80 p-4 space-y-4"
                    align="center"
                    sideOffset={8}
                  >
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
