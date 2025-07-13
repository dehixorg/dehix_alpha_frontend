'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  CheckCircle,
  Clock,
  Code,
  Building,
  Mail,
  Users,
  DollarSign,
  Briefcase,
} from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface ProjectDrawerProps {
  project: any;
  text: string;
  icon: any;
  isSizeSmall: boolean;
}

export default function ProjectDrawer({
  project,
  text,
  icon,
  isSizeSmall,
}: ProjectDrawerProps) {
  const [open, setOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size={isSizeSmall ? 'sm' : undefined}
          className={isSizeSmall ? '' : 'w-full'}
        >
          {icon}
          {text}
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-full sm:max-w-md md:max-w-lg overflow-y-auto no-scrollbar"
        side="left"
      >
        <SheetHeader className="pb-4">
          <div className="flex justify-between mt-2 items-center">
            <SheetTitle className="text-2xl font-bold">
              {project.projectName}
            </SheetTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
          </div>
          <SheetDescription className="mt-2 text-base">
            {project.description}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Company Information */}
        <Card className="mb-4 border-0 shadow-none">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Company:</span>
              <span>{project.companyName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{project.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card className="mb-4 border-0 shadow-none">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Created: {formatDate(project.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Updated: {formatDate(project.updatedAt)}
                </span>
              </div>
            </div>

            {project.skillsRequired.length > 0 && (
              <div className="mb-3">
                <div className="font-medium mb-1 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Skills Required:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.skillsRequired.map((skill: any, index: any) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="font-normal"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profiles Carousel */}
        {project.profiles.length > 0 && (
          <Card className="mb-4 border-0 shadow-none">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Profile Requirements ({project.profiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Carousel className="w-full mt-2">
                <CarouselContent>
                  {project.profiles.map((profile: any, index: any) => (
                    <CarouselItem key={index} className="md:basis-full">
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{profile.domain}</h4>
                          <Badge variant="outline" className="font-normal">
                            {profile.freelancersRequired} freelancers
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{profile.experience}+ years exp.</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>${profile.rate}/hr</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {profile.description}
                        </p>

                        <div className="flex items-center gap-1 text-sm">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          <span>{profile.totalBid.length} bids received</span>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex items-center justify-end mt-6">
                  <CarouselPrevious className="relative right-0 translate-x-0 mr-2" />
                  <CarouselNext className="relative right-0 translate-x-0" />
                </div>
              </Carousel>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
