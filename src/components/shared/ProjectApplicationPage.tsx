'use client';

import React, { useState } from 'react';
import {
  Paperclip,
  Clock,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Define interfaces for props
interface Bid {
  _id: string;
  userName: string;
  current_price: number;
  bid_status: string;
  description: string;
}

interface Profile {
  _id: string;
  domain: string;
  freelancersRequired: string;
  skills: string[];
  experience: number;
  minConnect: number;
  rate: number;
  description: string;
}

interface Budget {
  type: string;
  hourly?: {
    minRate?: number;
    maxRate?: number;
    estimatedHours?: number;
  };
  fixedAmount?: number;
}

interface ProjectData {
  _id: string;
  projectName: string;
  projectDomain: string[];
  description: string;
  companyName: string;
  skillsRequired: string[];
  status: string;
  projectType: string;
  profiles: Profile[];
  bids: Bid[];
  budget: Budget;
  createdAt: string;
}

interface ProjectApplicationFormProps {
  project: ProjectData;
  isLoading: boolean;
  onSubmit: (coverLetter: string, attachment: File | null) => Promise<void>;
  onCancel: () => void;
}

const ProjectApplicationForm: React.FC<ProjectApplicationFormProps> = ({
  project,
  isLoading,
  onSubmit,
  onCancel,
}) => {

  const [coverLetter, setCoverLetter] = useState<string>('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showFullText, setShowFullText] = useState<boolean>(false);
  const maxLength = 100; // Number of characters to show when collapsed

  const toggleText = () => {
    setShowFullText(!showFullText);
  };

  const shouldTruncate = project?.description?.length > maxLength;
  const displayedText =
    showFullText || !shouldTruncate
      ? project?.description
      : project?.description.slice(0, maxLength) + '...';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target?.files?.[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    onSubmit(coverLetter, attachment);
  };

  // Calculate bid summary
  const totalBids = project?.bids?.length || 0;
  const avgBid =
    totalBids > 0
      ? (
          project?.bids?.reduce(
            (sum, bid) => sum + (bid?.current_price || 0),
            0,
          ) / totalBids
        ).toFixed(2)
      : 'N/A';

  // Format posted date
  const postedDate = new Date(
    project?.createdAt || Date.now(),
  ).toLocaleDateString();

  if (isLoading) {
    return <div className="text-center py-10">Loading project details...</div>;
  }

  // Calculate total estimated budget
  const totalEstimatedBudget =
    (project?.budget?.hourly?.maxRate || 0) *
    (project?.budget?.hourly?.estimatedHours || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column - Main Content (2/3 width) */}
      <div className="md:col-span-2 space-y-6">
        {/* Project Header */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">
                  {project?.projectName}
                </h1>
                <p className="text-sm">Posted on {postedDate}</p>
              </div>
              <p className="text-muted-foreground">
                Position: {project?.projectType} Developer
              </p>

              <div className="mt-4">
                <p>{displayedText}</p>
                {shouldTruncate && (
                  <button
                    onClick={toggleText}
                    className="text-blue-500 hover:underline text-sm mt-2"
                  >
                    {showFullText ? 'less' : 'more'}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-lg font-medium mb-2">Skills required</h2>
              <div className="flex flex-wrap gap-2">
                {project?.skillsRequired?.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 rounded-full bg-gray-200 text-gray-700"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Client Information</h2>

            <div className="flex items-start gap-4">
              <div className="bg-red-500 rounded-full w-8 h-8 flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <div>
                <p className="font-medium">{project?.companyName}</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Briefcase size={14} />
                  <span>12 projects posted</span>
                  <span className="mx-1">|</span>
                  <DollarSign size={14} />
                  <span>$3.5k spent</span>
                </div>
                <div className="flex items-center mt-2">
                  <Star className="text-yellow-400" size={16} />
                  <span className="ml-1">4.5</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm">
              {project?.companyName} is a leading technology company focused on
              innovative AI solutions. They have a history of successful project
              completions with freelancers on our platform.
            </p>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Project Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium">Domains</h3>
                <p>{project?.projectDomain?.join(', ')}</p>
              </div>

              <div>
                <h3 className="font-medium">Status</h3>
                <p>{project?.status}</p>
              </div>

              <div>
                <h3 className="font-medium">Budget Type</h3>
                <p>{project?.budget?.type}</p>
              </div>

              {project?.budget?.type.toUpperCase() === 'HOURLY' ? (
                <>
                  <div>
                    <h3 className="font-medium">Hourly Rate</h3>
                    <p>
                      ${project?.budget?.hourly?.minRate || 0} - $
                      {project?.budget?.hourly?.maxRate || 0} /hr
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium">Estimated Hours</h3>
                    <p>{project?.budget?.hourly?.estimatedHours || 0} hours</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Total Budget</h3>
                    <p>
                      ~$
                      {(
                        (((project?.budget?.hourly?.minRate || 0) +
                          (project?.budget?.hourly?.maxRate || 0)) /
                          2) *
                        (project?.budget?.hourly?.estimatedHours || 0)
                      ).toLocaleString()}
                    </p>
                  </div>
                </>
              ) : project?.budget?.type.toUpperCase() === 'FIXED' ? (
                <div>
                  <h3 className="font-medium">Fixed Budget</h3>
                  <p>${project?.budget?.fixedAmount?.toLocaleString() || 0}</p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Bid Summary */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Bid Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium">Total Bids</h3>
                <p>{totalBids}</p>
              </div>

              <div>
                <h3 className="font-medium">Average Bid</h3>
                <p>${avgBid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Your Application
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="mb-4">
              <label htmlFor="coverLetter" className="block mb-2 font-medium">
                Cover Letter
              </label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-32 w-full"
                placeholder="Explain why you're a good fit for this project..."
              />
            </div>

            <div>
              <p className="block mb-2 font-medium">Attachment</p>
              <p className="text-sm text-muted-foreground mb-2">
                Attach your resume to strengthen your profile
              </p>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => document.getElementById('fileUpload')?.click()}
                >
                  <Paperclip size={16} />
                  <span>Attach File</span>
                </Button>
                <Input
                  id="fileUpload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {attachment && <p className="mt-2 text-sm">{attachment.name}</p>}
            </div>

            <div className="flex gap-4 mt-4">
              <Button
                onClick={handleSubmit}
                className="w-full md:w-auto px-8"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Apply Now'}
              </Button>
              <Button
                onClick={onCancel}
                variant="outline"
                className="w-full md:w-auto px-8"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Experience and Profiles (1/3 width) */}
      <div className="space-y-6">
        {/* Experience Card */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-4">Experience</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="text-gray-500" size={18} />
                <div>
                  <p className="font-medium">3+ yrs</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="text-gray-500" size={18} />
                <div>
                  <p className="font-medium">Hourly rate</p>
                  <p>
                    ${project?.budget?.hourly?.minRate || 0} - $
                    {project?.budget?.hourly?.maxRate || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-gray-500" size={18} />
                <div>
                  <p className="font-medium">Time per week</p>
                  <p>40 hours</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="text-gray-500" size={18} />
                <div>
                  <p className="font-medium">Project length</p>
                  <p>3 to 5 months</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profiles Section */}
        {project?.profiles?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Profiles Needed
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-4 h-[70vh] overflow-y-scroll no-scrollbar">
                {project?.profiles?.map((profile, index) => (
                  <Card
                    key={profile?._id || index}
                    className="border border-gray-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-xs">
                          {profile?.domain} Developer
                        </h3>
                        <Badge variant="outline">
                          {profile?.freelancersRequired} Needed
                        </Badge>
                      </div>

                      <p className="mb-3 text-sm">{profile?.description}</p>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Experience</p>
                          <p className="font-medium">
                            {profile?.experience}+ years
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Rate</p>
                          <p className="font-medium">${profile?.rate}/hr</p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Minimum Connect
                          </p>
                          <p className="font-medium">{profile?.minConnect}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {profile?.skills?.map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="border border-gray-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectApplicationForm;
