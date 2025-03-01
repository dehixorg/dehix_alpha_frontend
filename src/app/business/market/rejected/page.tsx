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
  User, 
  MapPin, 
  Calendar, 
  ExternalLink,
  XCircle,
  RefreshCw
} from "lucide-react";

// Sample data for rejected talents
const rejectedTalents = [
  {
    id: 1,
    name: "Ryan Thompson",
    avatar: "/avatars/ryan.jpg",
    role: "DevOps Engineer",
    experience: "4 years",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    location: "Chicago, IL",
    reason: "Position filled",
    rejectedDate: "Feb 15, 2025"
  },
  {
    id: 2,
    name: "Sophia Lee",
    avatar: "/avatars/sophia.jpg",
    role: "Mobile Developer",
    experience: "3 years",
    skills: ["React Native", "Swift", "Kotlin", "Firebase"],
    location: "Miami, FL",
    reason: "Skill mismatch",
    rejectedDate: "Feb 18, 2025"
  },
  {
    id: 3,
    name: "Lucas Martinez",
    avatar: "/avatars/lucas.jpg",
    role: "QA Engineer",
    experience: "5 years",
    skills: ["Selenium", "Jest", "Cypress", "Manual Testing"],
    location: "Denver, CO",
    reason: "Salary expectations",
    rejectedDate: "Feb 20, 2025"
  },
  {
    id: 4,
    name: "Emily Davis",
    avatar: "/avatars/emily.jpg",
    role: "Project Manager",
    experience: "7 years",
    skills: ["Agile", "Scrum", "JIRA", "Stakeholder Management"],
    location: "Portland, OR",
    reason: "Timeline conflict",
    rejectedDate: "Feb 17, 2025"
  }
];

const RejectedTalentsPage = () => {
  return (
    <TalentLayout activeTab="rejected">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Rejected Talents</h2>
        <span className="text-muted-foreground">
          Showing {rejectedTalents.length} results
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rejectedTalents.map((talent) => (
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
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Rejected
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
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span>Reason: {talent.reason}</span>
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
                Rejected on {talent.rejectedDate}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Reconsider
                </Button>
                <Button size="sm" variant="ghost" className="flex items-center gap-1">
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

export default RejectedTalentsPage;