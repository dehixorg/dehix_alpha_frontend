import React from "react";
import TalentLayout from "@/components/marketComponents/TalentLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Clock, 
  User, 
  MapPin, 
  ExternalLink 
} from "lucide-react";

// Sample data for invited talents
const invitedTalents = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/avatars/alex.jpg",
    role: "Frontend Developer",
    experience: "5 years",
    skills: ["React", "TypeScript", "NextJS"],
    location: "New York, USA",
    invitedDate: "Feb 25, 2025",
    email: "alex.j@example.com"
  },
  {
    id: 2,
    name: "Sarah Williams",
    avatar: "/avatars/sarah.jpg",
    role: "UI/UX Designer",
    experience: "3 years",
    skills: ["Figma", "Adobe XD", "User Research"],
    location: "London, UK",
    invitedDate: "Feb 26, 2025",
    email: "sarah.w@example.com"
  },
  {
    id: 3,
    name: "Michael Chen",
    avatar: "/avatars/michael.jpg",
    role: "Full Stack Developer",
    experience: "7 years",
    skills: ["React", "Node.js", "MongoDB"],
    location: "San Francisco, USA",
    invitedDate: "Feb 24, 2025",
    email: "michael.c@example.com"
  },
  {
    id: 4,
    name: "Emma Rodriguez",
    avatar: "/avatars/emma.jpg",
    role: "Product Designer",
    experience: "4 years",
    skills: ["UI/UX", "Wireframing", "Prototyping"],
    location: "Berlin, Germany",
    invitedDate: "Feb 23, 2025",
    email: "emma.r@example.com"
  }
];

const InvitedTalentsPage = () => {
  return (
    <TalentLayout activeTab="invited">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Invited Talents</h2>
        <span className="text-muted-foreground">
          Showing {invitedTalents.length} results
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {invitedTalents.map((talent) => (
          <Card key={talent.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={talent.avatar} alt={talent.name} />
                    <AvatarFallback>{talent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{talent.name}</CardTitle>
                    <CardDescription>{talent.role}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Invited
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
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{talent.email}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {talent.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Invited on {talent.invitedDate}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">Cancel</Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  View Profile
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </TalentLayout>
  );
};

export default InvitedTalentsPage;