'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { getBadgeColor } from '@/utils/common/getBadgeStatus';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
interface Freelancer {
  _id: string;
  freelancerId: string;
  freelancer_professional_profile_id: string;
  status: string;
  cover_letter?: string;
  interview_ids: Array<{
    _id: string;
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    interviewer: string;
    skills: string[];
    domain: string;
  }>;
  updatedAt: string;
}

interface TalentDetails {
  _id: string;
  talentName: string;
  experience: string;
  description: string;
  status: string;
  visible: boolean;
  type?: 'skill' | 'domain';
  createdAt?: string;
  updatedAt?: string;
  freelancers?: Freelancer[];
}

export default function ManageTalentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const talentId = searchParams.talentId as string;
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  if (!talentId) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Manage Talents</h1>
          <p className="text-gray-500 mt-2">
            View and manage your talent requirements and find matching
            candidates
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">
            Please select a talent to manage from the previous page.
          </p>
        </div>
      </div>
    );
  }

  // State for talent data
  const [talent, setTalent] = React.useState<TalentDetails | null>(null);
  const [freelancers, setFreelancers] = React.useState<Freelancer[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedFreelancer, setSelectedFreelancer] =
    React.useState<Freelancer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);

  // Function to generate realistic dummy interview data
  const generateDummyInterviews = (freelancerId: string) => {
    const domains = ['Frontend Development', 'Backend Development', 'UI/UX Design', 'DevOps', 'Mobile Development'];
    const skills = {
      'Frontend Development': ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux'],
      'Backend Development': ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'GraphQL'],
      'UI/UX Design': ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Wireframing'],
      'DevOps': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
      'Mobile Development': ['React Native', 'Flutter', 'iOS', 'Android', 'Swift']
    };
    
    const statuses: Array<'scheduled' | 'completed' | 'cancelled'> = ['scheduled', 'completed', 'cancelled'];
    const interviewers = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sarah Williams', 'Michael Brown'];
    
    // Generate 1-3 random interviews
    const interviewCount = Math.floor(Math.random() * 3) + 1;
    const interviews = [];
    
    for (let i = 0; i < interviewCount; i++) {
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30) - 15); // Random date within ±15 days
      
      interviews.push({
        _id: `interview_${freelancerId}_${i}`,
        date: date.toISOString().split('T')[0],
        time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '30' : '00'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        status,
        interviewer: interviewers[Math.floor(Math.random() * interviewers.length)],
        skills: [...(skills[domain as keyof typeof skills] || [])].sort(() => 0.5 - Math.random()).slice(0, 3), // Get 3 random skills
        domain
      });
    }
    
    return interviews;
  };

  // Parse talent data from URL on component mount
  React.useEffect(() => {
    if (!talentId) {
      setIsLoading(false);
      setError('No talent ID provided');
      return;
    }

    // Get data from URL
    const urlParams = new URLSearchParams(window.location.search);
    const talentDataParam = urlParams.get('data');

    if (!talentDataParam) {
      setError('No talent data found in URL');
      setIsLoading(false);
      return;
    }

    try {
      // Parse the talent data from URL
      const talentData = JSON.parse(decodeURIComponent(talentDataParam));

      if (!talentData) {
        throw new Error('Invalid talent data');
      }
      console.log('talentData');
      console.log(talentData);
      setTalent(talentData);

      // Set freelancers if available
      console.log('Raw freelancers data:', talentData.freelancers);

      if (talentData.freelancers && Array.isArray(talentData.freelancers)) {
        // Ensure all required fields have default values
        let formattedFreelancers = talentData.freelancers.map(
          (freelancer) => ({
            _id:
              freelancer._id ||
              `freelancer-${Math.random().toString(36).substr(2, 9)}`,
            freelancerId: freelancer.freelancerId || 'N/A',
            freelancer_professional_profile_id:
              freelancer.freelancer_professional_profile_id || 'N/A',
            status: freelancer.status || 'PENDING',
            cover_letter: freelancer.cover_letter || '',
            interview_ids: Array.isArray(freelancer.interview_ids) && freelancer.interview_ids.length > 0
              ? freelancer.interview_ids
              : generateDummyInterviews(freelancer._id || `freelancer-${Math.random().toString(36).substr(2, 9)}`),
            updatedAt: freelancer.updatedAt || new Date().toISOString(),
            // Add any additional fields with defaults
            ...freelancer,
          }),
        );
        
        // Ensure at least one freelancer has interviews for demo purposes
        if (formattedFreelancers.length > 0 && !formattedFreelancers.some(f => f.interview_ids.length > 0)) {
          formattedFreelancers[0].interview_ids = generateDummyInterviews(formattedFreelancers[0]._id);
        }
        console.log('Formatted freelancers:', formattedFreelancers);
        setFreelancers(formattedFreelancers);
      } else {
        console.log('No freelancers array found in talent data');
        setFreelancers([]);
      }

      setError(null);
    } catch (err) {
      console.error('Error parsing talent data:', err);
      setError('Failed to load talent data');
    } finally {
      setIsLoading(false);
    }
  }, [talentId]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-500">{error || 'Talent not found'}</p>
          <Button className="mt-4" onClick={handleBack}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Talent</h1>
            <p className="text-gray-500 mt-2">
              View and manage talent requirements and find matching candidates
            </p>
          </div>
          <Button variant="outline" onClick={handleBack} className="mb-4">
            Back to List
          </Button>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">{talent.talentName}</h2>
            <Badge className={getBadgeColor(talent.status)}>
              {talent.status.toUpperCase()}
            </Badge>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {talent.type &&
              `${talent.type.charAt(0).toUpperCase() + talent.type.slice(1)} • `}
            {talent.experience} years experience
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium text-foreground mb-3">Description</h3>
              <p className="text-muted-foreground">
                {talent.description || 'No description provided.'}
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium text-foreground mb-3">Details</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Experience
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {talent.experience} years
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Visibility
                  </dt>
                  <dd className="mt-1 text-sm">
                    {talent.visible ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Visible
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        Hidden
                      </span>
                    )}
                  </dd>
                </div>
                {talent.createdAt && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Created
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {new Date(talent.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {talent.updatedAt && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {new Date(talent.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-3">Actions</h3>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {}}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View Matches
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => {}}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Details
                </Button>
                <Button
                  className="w-full justify-start text-red-600 dark:text-red-400"
                  variant="outline"
                  onClick={() => {}}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove
                </Button>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-3">Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      Active
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {talent.status === 'active' ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        talent.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      }`}
                      style={{
                        width: talent.status === 'active' ? '100%' : '0%',
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Freelancers Section */}
          <div className="mt-8 md:col-span-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Associated Freelancers
            </h3>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md mb-4">
                {error}
              </div>
            )}
            {freelancers && freelancers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
                {freelancers.map((freelancer) => (
                  <Card
                    key={freelancer._id || `freelancer-${Math.random()}`}
                    className="hover:shadow-lg transition-shadow duration-200 flex flex-col h-full border border-gray-200 dark:border-gray-700 overflow-hidden min-w-0 w-full max-w-sm mx-auto sm:max-w-none"
                  >
                    <CardHeader className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`/avatars/${freelancer.freelancerId}.jpg`}
                            alt={freelancer.freelancerId}
                          />
                          <AvatarFallback>FP</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            Freelancer Profile
                          </CardTitle>
                          <CardDescription className="flex items-center">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                freelancer.status === 'SELECTED'
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                            ></span>
                            {freelancer.status}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 flex-grow min-w-0 space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Last Updated
                          </span>
                          <span className="font-medium">
                            {new Date(
                              freelancer.updatedAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {freelancer.cover_letter && (
                          <div className="line-clamp-2 text-gray-600 dark:text-gray-300 text-sm break-words mb-3">
                            "{freelancer.cover_letter.substring(0, 100)}
                            {freelancer.cover_letter.length > 100 ? '...' : ''}"
                          </div>
                        )}
                      </div>
                      
                      {/* Interview Section */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Interviews
                          <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                            {freelancer.interview_ids?.length || 0} scheduled
                          </span>
                        </h4>
                        
                        {freelancer.interview_ids && freelancer.interview_ids.length > 0 ? (
                          <div className="space-y-2">
                            {freelancer.interview_ids.map((interview, index) => (
                              <div 
                                key={interview._id} 
                                className="p-2 text-xs bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {interview.domain} Interview
                                  </span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      interview.status === 'scheduled' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                                        : interview.status === 'completed' 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                                  >
                                    {interview.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span className="text-xs">
                                    {new Date(interview.date).toLocaleDateString()} at {interview.time}
                                  </span>
                                </div>
                                {interview.skills && interview.skills.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {interview.skills.slice(0, 3).map((skill, i) => (
                                      <span 
                                        key={i}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {interview.skills.length > 3 && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        +{interview.skills.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                            No interviews scheduled yet
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center p-4 sm:p-5 mt-auto border-t border-gray-100 dark:border-gray-700 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          // Handle schedule interview
                          console.log('Schedule interview for:', freelancer._id);
                        }}
                        disabled={freelancer.status !== 'APPLIED'}
                      >
                        Schedule Interview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFreelancer(freelancer);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="text-gray-400 mx-auto w-16 h-16 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  No freelancers found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  There are no freelancers associated with this talent yet.
                </p>
              </div>
            )}
          </div>

          {/* Freelancer Details Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              {selectedFreelancer && (
                <>
                  <DialogHeader>
                    <DialogTitle>Freelancer Details</DialogTitle>
                    <DialogDescription>
                      Detailed information about the freelancer
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={`/avatars/${selectedFreelancer.freelancerId}.jpg`}
                          alt={selectedFreelancer.freelancerId}
                        />
                        <AvatarFallback>
                          {selectedFreelancer.freelancerId
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-medium">
                          Freelancer {selectedFreelancer.freelancerId}
                        </h3>
                        <div className="flex items-center">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              selectedFreelancer.status === 'SELECTED'
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                            }`}
                          ></span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedFreelancer.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Freelancer ID
                        </h4>
                        <p className="text-sm">
                          {selectedFreelancer.freelancerId}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Profile ID
                        </h4>
                        <p className="text-sm">
                          {
                            selectedFreelancer.freelancer_professional_profile_id
                          }
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Last Updated
                        </h4>
                        <p className="text-sm">
                          {new Date(
                            selectedFreelancer.updatedAt,
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Interviews
                        </h4>
                        <p className="text-sm">
                          {selectedFreelancer.interview_ids?.length || 0}{' '}
                          completed
                        </p>
                      </div>
                    </div>

                    {selectedFreelancer.cover_letter && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Cover Letter
                        </h4>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {selectedFreelancer.cover_letter}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
