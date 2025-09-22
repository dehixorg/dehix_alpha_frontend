import React, { useState } from 'react';
import Link from 'next/link';
import { Github, Linkedin, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
interface FreelancerCardProps {
  name: string;
  skills: string[];
  domains: string[];
  experience: string;
  profile: string;
  userName: string;
  monthlyPay: string;
  githubUrl: string;
  linkedInUrl: string;
}

// Social link component
const SocialLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon: React.ElementType }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
  >
    <Icon className="h-4 w-4" />
    <span className="truncate">{children}</span>
  </a>
);

// Skill progress component
const SkillProgress = ({ name, level }: { name: string; level: number }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs text-muted-foreground">{level}%</span>
    </div>
    <Progress value={level} className="h-2" />
  </div>
);

const FreelancerCard: React.FC<FreelancerCardProps> = ({
  name,
  skills = [],
  domains = [],
  experience,
  profile,
  userName,
  monthlyPay,
  githubUrl,
  linkedInUrl,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // const handleAddSkill = () => {
  //   if (tmpSkill && !currSkills.some((skill) => skill.name === tmpSkill)) {
  //     setCurrSkills([...currSkills, { name: tmpSkill }]);
  //   }
  // };

  // const handleDeleteSkill = (skillName: string) => {
  //   setCurrSkills(currSkills.filter((skill) => skill.name !== skillName));
  // };

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="md:flex">
          {/* Left Side - Profile */}
          <div className="p-6 md:p-8 flex flex-col items-center md:border-r md:border-border">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24 border-4 border-primary/10">
                <AvatarImage src={profile} alt={name} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-md">
                <div className="h-5 w-5 rounded-full bg-green-500" />
              </div>
            </div>
            
            <CardHeader className="p-0 text-center">
              <CardTitle className="text-xl font-bold">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">@{userName || 'username'}</p>
            </CardHeader>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{experience}</span> years experience
              </p>
              {monthlyPay && (
                <p className="text-sm mt-1">
                  <span className="text-muted-foreground">Rate: </span>
                  <span className="font-medium">${monthlyPay}/hr</span>
                </p>
              )}
            </div>

            {/* Social Links */}
            <div className="mt-4 flex gap-4">
              {githubUrl && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a 
                        href={githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-accent transition-colors"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>GitHub Profile</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {linkedInUrl && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a 
                        href={linkedInUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-accent transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>LinkedIn Profile</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="flex-1 p-6 md:p-8">
            {/* Skills Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">SKILLS</h3>
              <div className="flex flex-wrap gap-2">
                {skills?.slice(0, 6).map((skill: any, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="font-normal px-3 py-1 rounded-md"
                  >
                    {skill.name}
                  </Badge>
                ))}
                {skills?.length > 6 && !isExpanded && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground h-auto p-1"
                    onClick={() => setIsExpanded(true)}
                  >
                    +{skills.length - 6} more
                  </Button>
                )}
              </div>
              
              {isExpanded && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {skills?.slice(6).map((skill: any, index: number) => (
                      <Badge 
                        key={index + 6} 
                        variant="outline" 
                        className="font-normal px-3 py-1 rounded-md"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground h-auto p-1 mt-2 text-xs"
                    onClick={() => setIsExpanded(false)}
                  >
                    Show less
                  </Button>
                </div>
              )}
            </div>

            {/* Domains Section */}
            {domains && domains.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">DOMAINS</h3>
                <div className="flex flex-wrap gap-2">
                  {domains.map((domain: any, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="font-normal px-3 py-1 rounded-full border-primary/20"
                    >
                      {domain.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </DialogTrigger>
                
                {/* Profile Dialog */}
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Freelancer Profile</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                      <div className="text-center md:text-left">
                        <Avatar className="h-24 w-24 border-4 border-primary/10 mx-auto md:mx-0">
                          <AvatarImage src={profile} alt={name} className="object-cover" />
                          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold mt-4">{name}</h2>
                        <p className="text-muted-foreground">@{userName || 'username'}</p>
                        
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Experience:</span>
                            <span className="font-medium">{experience} years</span>
                          </div>
                          {monthlyPay && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Rate:</span>
                              <span className="font-medium">${monthlyPay}/hr</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex justify-center md:justify-start gap-4">
                          {githubUrl && (
                            <SocialLink href={githubUrl} icon={Github}>
                              GitHub
                            </SocialLink>
                          )}
                          {linkedInUrl && (
                            <SocialLink href={linkedInUrl} icon={Linkedin}>
                              LinkedIn
                            </SocialLink>
                          )}
                        </div>
                      </div>
                      
                      <Separator className="my-4 md:hidden" />
                      
                      <div className="flex-1 space-y-6">
                        <div>
                          <h3 className="font-medium mb-2">Skills</h3>
                          <div className="space-y-4">
                            {skills?.slice(0, 5).map((skill: any, index: number) => (
                              <SkillProgress 
                                key={index} 
                                name={skill.name} 
                                level={Math.min(100, 70 + Math.floor(Math.random() * 30))} 
                              />
                            ))}
                          </div>
                        </div>
                        
                        {domains && domains.length > 0 && (
                          <div>
                            <h3 className="font-medium mb-2">Domains</h3>
                            <div className="flex flex-wrap gap-2">
                              {domains.map((domain: any, index: number) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="font-normal px-3 py-1 rounded-full"
                                >
                                  {domain.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button className="w-full">
                Hire Now
                </Button>
          </div>
        </div>
        </div>
      </Card>
    </div>
  );
};

export default FreelancerCard;
