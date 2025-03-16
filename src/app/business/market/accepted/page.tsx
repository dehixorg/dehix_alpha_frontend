import React from 'react';
import {
  User,
  MapPin,
  Phone,
  Calendar,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

import TalentLayout from '@/components/marketComponents/TalentLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Sample data for accepted talents
const acceptedTalents = [
  {
    id: 1,
    name: 'James Wilson',
    avatar: '/avatars/james.jpg',
    role: 'Senior Frontend Developer',
    experience: '8 years',
    skills: ['React', 'Vue', 'Angular', 'TypeScript'],
    location: 'Austin, TX',
    phone: '+1 (555) 123-4567',
    availableFrom: 'March 15, 2025',
    acceptedDate: 'Feb 20, 2025',
  },
  {
    id: 2,
    name: 'Olivia Parker',
    avatar: '/avatars/olivia.jpg',
    role: 'Lead UI Designer',
    experience: '6 years',
    skills: ['UI/UX', 'Design Systems', 'Figma', 'User Research'],
    location: 'Toronto, Canada',
    phone: '+1 (555) 987-6543',
    availableFrom: 'March 1, 2025',
    acceptedDate: 'Feb 22, 2025',
  },
  {
    id: 3,
    name: 'Daniel Kim',
    avatar: '/avatars/daniel.jpg',
    role: 'Backend Developer',
    experience: '5 years',
    skills: ['Node.js', 'Python', 'AWS', 'Microservices'],
    location: 'Seattle, WA',
    phone: '+1 (555) 765-4321',
    availableFrom: 'March 10, 2025',
    acceptedDate: 'Feb 21, 2025',
  },
];

const AcceptedTalentsPage = () => {
  return (
    <TalentLayout activeTab="accepted">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Accepted Talents</h2>
        <span className="text-muted-foreground">
          Showing {acceptedTalents.length} results
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {acceptedTalents.map((talent) => (
          <Card key={talent.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={talent.avatar} alt={talent.name} />
                    <AvatarFallback>
                      {talent.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{talent.name}</CardTitle>
                    <CardDescription>{talent.role}</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Accepted
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{talent.experience} experience</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{talent.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{talent.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Available from {talent.availableFrom}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {talent.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Accepted on {talent.acceptedDate}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Send Message
                </Button>
                <Button size="sm" className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Contact
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </TalentLayout>
  );
};

export default AcceptedTalentsPage;
