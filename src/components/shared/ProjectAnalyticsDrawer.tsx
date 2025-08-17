import React, { useState } from 'react';
import {
  User,
  Briefcase,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  MessageSquare,
  Award,
} from 'lucide-react';

import { CircularProgressBar } from './CircularProgressBar';
import { MetricCard } from './MetricCard';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectData {
  _id: string;
  projectName: string;
  projectDomain: string[];
  description: string;
  companyId: string;
  email: string;
  companyName: string;
  end: Date | null;
  skillsRequired: string[];
  role: string;
  projectType: string;
  profiles: Array<{
    _id: string;
    domain: string;
    freelancersRequired: string;
    skills: string[];
    experience: number;
    minConnect: number;
    rate: number;
    description: string;
    selectedFreelancer: string[];
    totalBid: string[];
    freelancers: Array<{
      freelancerId: string;
      bidId: string;
    }>;
  }>;
  status: string;
  team: string[];
  url: string[];
  createdAt: Date;
  updatedAt: Date;
  maxBidDate: Date;
  startBidDate: Date;
  budget?: {
    type: string;
    hourly?: {
      minRate: number;
      maxRate: number;
      estimatedHours: number;
    };
    fixedAmount?: number;
  };
  bids?: Array<{
    _id: string;
    userName: string;
    bidder_id: string;
    current_price: number;
    project_id: string;
    bid_status?: string; // Optional as it's not present in all bid examples
    createdAt: string;
    updatedAt: string;
    description: string;
    profile_id: string;
  }>;
}

interface ProjectAnalyticsDrawerProps {
  projectData?: ProjectData;
  onClose?: () => void;
  setShowAnalyticsDrawer: (show: boolean) => void;
}

const ProjectAnalyticsDrawer: React.FC<ProjectAnalyticsDrawerProps> = ({
  projectData,
  setShowAnalyticsDrawer,
}) => {
  const [, setActiveTab] = useState<string>('insights');
  // If projectData is not provided, render a loading state or a message
  if (!projectData) {
    return (
      <Card className="flex flex-col h-full w-full overflow-auto text-white items-center justify-center">
        <p>Loading project data...</p>
      </Card>
    );
  }

  // Use the passed projectData directly
  const project = projectData;

  // Calculate analytics based on actual project data
  const calculateAnalytics = () => {
    const totalBids =
      project.profiles?.reduce(
        (sum, profile) => sum + (profile.totalBid?.length || 0),
        0,
      ) || 0;
    const totalFreelancersHired =
      project.profiles?.reduce(
        (sum, profile) => sum + (profile.selectedFreelancer?.length || 0),
        0,
      ) || 0;

    const validProfiles =
      project.profiles?.filter(
        (p) => typeof p.rate === 'number' && !isNaN(p.rate),
      ) || [];

    const avgRate =
      validProfiles.length > 0
        ? validProfiles.reduce((sum, profile) => sum + profile.rate, 0) /
          validProfiles.length
        : 0;

    const maxRate =
      validProfiles.length > 0
        ? Math.max(...validProfiles.map((p) => p.rate))
        : 0;

    const minRate =
      validProfiles.length > 0
        ? Math.min(...validProfiles.map((p) => p.rate))
        : 0;

    const experienceScore = Math.min(
      ((project.profiles?.reduce((sum, p) => sum + (p.experience || 0), 0) ||
        0) /
        (project.profiles?.length || 1)) *
        10,
      100,
    );
    const rateCompetitiveness =
      maxRate > 0 ? Math.max(0, 100 - (avgRate / maxRate) * 50) : 0;
    const bidScore = Math.round((experienceScore + rateCompetitiveness) / 2);

    const daysUntilDeadline = project.maxBidDate
      ? Math.floor(
          (new Date(project.maxBidDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 'N/A';

    return {
      score: bidScore,
      applied: totalBids,
      interviews: Math.floor(totalBids * 0.15),
      hired: totalFreelancersHired,
      terminated: 0,
      jobDuration:
        daysUntilDeadline !== 'N/A' && daysUntilDeadline > 0
          ? `${daysUntilDeadline} days remaining`
          : project.status === 'COMPLETED'
            ? 'Completed'
            : 'Deadline passed/N/A',
      startDate: project.startBidDate
        ? new Date(project.startBidDate).toISOString().split('T')[0]
        : 'N/A',
      endDate: project.maxBidDate
        ? new Date(project.maxBidDate).toISOString().split('T')[0]
        : 'N/A',
      avgBid: `$${Math.round(avgRate)}/hr`,
      topBid: `$${maxRate}/hr`,
      lowBid: `$${minRate}/hr`,
      totalBids: totalBids,
      status: project.status,
      clientResponsiveness: 85 + Math.floor(Math.random() * 15),
      projectComplexity: Math.min(
        (project.skillsRequired?.length || 0) * 15,
        100,
      ),
      rateCompetitiveness: Math.round(rateCompetitiveness),
      clientHistory: {
        totalProjects: 8 + Math.floor(Math.random() * 12),
        completionRate: 90 + Math.floor(Math.random() * 10),
        avgRating: 4.2 + Math.random() * 0.8,
      },
      relevance: Math.min((project.skillsRequired?.length || 0) * 20, 100),
      timeline: [
        project.createdAt && {
          date: new Date(project.createdAt).toISOString().split('T')[0],
          event: 'Project Posted',
        },
        project.startBidDate && {
          date: new Date(project.startBidDate).toISOString().split('T')[0],
          event: 'Bidding Started',
        },
        {
          date: new Date().toISOString().split('T')[0],
          event: 'Current Status',
        },
        project.maxBidDate && {
          date: new Date(project.maxBidDate).toISOString().split('T')[0],
          event: 'Bidding Deadline',
        },
      ].filter(Boolean) as { date: string; event: string }[],
      competitorInsights: {
        avgExperience: `${Math.round((project.profiles?.reduce((sum, p) => sum + (p.experience || 0), 0) || 0) / (project.profiles?.length || 1))} years`,
        topSkills: (project.skillsRequired || []).slice(0, 4),
        bidRange: `$${minRate}-${maxRate}/hr`,
      },
    };
  };

  const analyticsData = calculateAnalytics();

  const metricItems = [
    {
      icon: <User className="h-4 w-4" />,
      label: 'Applied',
      value: analyticsData.applied,
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      label: 'Interviews',
      value: analyticsData.interviews,
    },
    {
      icon: <CheckCircle className="h-4 w-4" />,
      label: 'Hired',
      value: analyticsData.hired,
    },
    {
      icon: <XCircle className="h-4 w-4" />,
      label: 'Terminated',
      value: analyticsData.terminated,
    },
  ];

  //   setExporting(true);
  //   setExportError(null);
  //   try {
  //     const dataStr = JSON.stringify(project, null, 2); // Converts project object to a JSON string
  //     const dataUri =
  //       'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr); // Sets the MIME type to JSON
  //     const exportFileDefaultName = `${project.projectName}_analytics.json`; // Sets the file extension to .json

  //     const linkElement = document.createElement('a');
  //     linkElement.setAttribute('href', dataUri);
  //     linkElement.setAttribute('download', exportFileDefaultName);
  //     document.body.appendChild(linkElement);
  //     linkElement.click();
  //     document.body.removeChild(linkElement);
  //   } catch (error) {
  //     console.error('Failed to export project data:', error);
  //     setExportError('Failed to export data. Please try again.');
  //   } finally {
  //     setExporting(false);
  //   }
  // };

  return (
    <Card className="flex flex-col h-full w-full overflow-auto text-white  ">
      <div className="p-4 border-b ">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">
              {project.projectName} - Proposal Details
            </h2>
            <p className="text-sm text-gray-400">
              {project.projectDomain?.join(', ') || 'N/A'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-400 border-gray-700"
            onClick={() => setShowAnalyticsDrawer(false)}
          >
            Close
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="w-full flex flex-col flex-grow">
        <TabsList className="w-full bg-[#09090B] gap-6 rounded-none">
          <TabsTrigger
            value="insights"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white hover:bg-gray-700"
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white hover:bg-gray-700"
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
          </TabsTrigger>
          <TabsTrigger
            value="competition"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white hover:bg-gray-700"
            onClick={() => setActiveTab('competition')}
          >
            Competition
          </TabsTrigger>
        </TabsList>

        <div className="flex-grow overflow-y-auto p-4">
          {' '}
          {/* Scrollable content area */}
          <TabsContent value="insights" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="  col-span-1 bg-gray-850">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Bid score
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <CircularProgressBar
                    percentage={analyticsData.score}
                    size={140}
                    strokeWidth={12}
                  />
                </CardContent>
              </Card>

              <Card className="  md:col-span-2 bg-gray-850">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {metricItems.map((item, index) => (
                    <MetricCard
                      key={index}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              <Card className="  bg-gray-850">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium">{analyticsData.jobDuration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Start date</p>
                      <p className="font-medium">{analyticsData.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Deadline</p>
                      <p className="font-medium">{analyticsData.endDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <Badge
                        className={`${
                          project.status === 'COMPLETED'
                            ? 'bg-green-600/20 text-green-500 hover:bg-green-600/30'
                            : project.status === 'ACTIVE'
                              ? 'bg-blue-600/20 text-blue-500 hover:bg-blue-600/30'
                              : 'bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30'
                        }`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>

                  {project.budget && ( // Display budget if available
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Budget</p>
                      <div className="flex flex-wrap gap-2">
                        {project.budget.type === 'hourly' &&
                        project.budget.hourly ? (
                          <Badge className="bg-purple-600/20 text-purple-400">
                            Hourly: ${project.budget.hourly.minRate}-$
                            {project.budget.hourly.maxRate}/hr (Est.{' '}
                            {project.budget.hourly.estimatedHours} hrs)
                          </Badge>
                        ) : project.budget.type === 'fixed' &&
                          project.budget.fixedAmount ? (
                          <Badge className="bg-purple-600/20 text-purple-400">
                            Fixed: ${project.budget.fixedAmount}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-600/20 text-gray-400">
                            Budget not specified
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {project.skillsRequired &&
                      project.skillsRequired.length > 0 ? (
                        project.skillsRequired.map((skill, index) => (
                          <Badge
                            key={index}
                            className="bg-gray-800 text-gray-300"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No specific skills listed.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Project Profiles</p>
                    {project.profiles && project.profiles.length > 0 ? (
                      project.profiles.map((profile) => (
                        <div
                          key={profile._id}
                          className="border border-gray-700 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{profile.domain}</h4>
                            <Badge className="bg-blue-600/20 text-blue-500">
                              ${profile.rate}/hr
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">
                            {profile.description || 'No description provided.'}
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Required: </span>
                              <span>
                                {profile.freelancersRequired || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Experience:{' '}
                              </span>
                              <span>{profile.experience || 'N/A'} years</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Bids: </span>
                              <span>{profile.totalBid?.length || 0}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs">
                            <span className="text-gray-500">
                              Selected Freelancers:{' '}
                            </span>
                            <span>
                              {profile.selectedFreelancer?.length || 0}
                            </span>
                          </div>
                          {/* {profile.freelancers && profile.freelancers.length > 0 && (
                            <div className="mt-2 text-xs">
                              <span className="text-gray-500">Associated Freelancers: </span>
                              {profile.freelancers.map((f, idx) => (
                                <span key={idx} className="ml-1">{f.freelancerId}{idx < profile.freelancers.length - 1 ? ',' : ''}</span>
                              ))}
                            </div>
                          )} */}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No project profiles defined.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="  bg-gray-850">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    About the Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">
                      {project.companyName || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {project.email || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="text-gray-500 h-4 w-4" />
                    <div>
                      <p className="text-sm">
                        {analyticsData.clientHistory.totalProjects} projects
                        posted
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-gray-500 h-4 w-4" />
                    <div>
                      <p className="text-sm">
                        {analyticsData.clientHistory.completionRate}% completion
                        rate
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500 h-4 w-4" />
                    <span className="text-sm">
                      {analyticsData.clientHistory.avgRating.toFixed(1)}
                    </span>
                    <div className="flex ml-1">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i <
                              Math.floor(analyticsData.clientHistory.avgRating)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-500'
                            }
                          />
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="  md:col-span-2 bg-gray-850">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Bid Competitiveness
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Avg bid</p>
                      <p className="font-medium text-green-500">
                        {analyticsData.avgBid}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Top bid</p>
                      <p className="font-medium">{analyticsData.topBid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Low bid</p>
                      <p className="font-medium">{analyticsData.lowBid}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">Relevance</p>
                      <p className="text-xs font-medium">
                        {analyticsData.relevance}%
                      </p>
                    </div>
                    <Progress
                      value={analyticsData.relevance}
                      className="h-2 bg-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Rate competitiveness
                      </p>
                      <p className="text-xs font-medium">
                        {analyticsData.rateCompetitiveness}%
                      </p>
                    </div>
                    <Progress
                      value={analyticsData.rateCompetitiveness}
                      className="h-2 bg-gray-800"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="timeline" className="mt-0">
            <Card className="  bg-gray-850">
              <CardHeader>
                <CardTitle className="text-md font-medium">
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.timeline &&
                  analyticsData.timeline.length > 0 ? (
                    analyticsData.timeline.map((event, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="font-medium">{event.event}</p>
                          <p className="text-sm text-gray-400">{event.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No timeline data available.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="competition" className="mt-0">
            <Card className="  bg-gray-850">
              <CardHeader>
                <CardTitle className="text-md font-medium">
                  Competitor Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Average Experience
                    </h3>
                    <p className="text-2xl font-bold">
                      {analyticsData.competitorInsights.avgExperience}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Bid Range</h3>
                    <p className="text-2xl font-bold">
                      {analyticsData.competitorInsights.bidRange}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Total Competitors
                    </h3>
                    <p className="text-2xl font-bold">
                      {analyticsData.totalBids}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Top Skills Among Competitors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analyticsData.competitorInsights.topSkills &&
                    analyticsData.competitorInsights.topSkills.length > 0 ? (
                      analyticsData.competitorInsights.topSkills.map(
                        (skill, index) => (
                          <Badge
                            key={index}
                            className="bg-gray-800 text-gray-300"
                          >
                            {skill}
                          </Badge>
                        ),
                      )
                    ) : (
                      <p className="text-sm text-gray-500">
                        No top skills identified among competitors.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Bid Distribution</h3>
                  {project.profiles && project.profiles.length > 0 ? (
                    <div className="space-y-2">
                      {project.profiles.map((profile) => (
                        <div
                          key={profile._id}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm">{profile.domain}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              {profile.totalBid?.length || 0} bids
                            </span>
                            <Badge className="bg-blue-600/20 text-blue-500">
                              ${profile.rate || 'N/A'}/hr
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No bid distribution data available.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="  mt-4 bg-gray-850">
              <CardHeader>
                <CardTitle className="text-md font-medium">
                  Competitive Edge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-500/20 rounded-full p-2">
                      <Award className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Strong skill match</h3>
                      <p className="text-sm text-gray-400">
                        Your skills match {analyticsData.relevance}% of the
                        project requirements.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-500/20 rounded-full p-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Rate consideration</h3>
                      <p className="text-sm text-gray-400">
                        Your rate competitiveness is{' '}
                        {analyticsData.rateCompetitiveness}%. Consider
                        highlighting your unique value proposition.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/20 rounded-full p-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Project complexity</h3>
                      <p className="text-sm text-gray-400">
                        This project has a complexity score of{' '}
                        {analyticsData.projectComplexity}% based on required
                        skills.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <div className="mt-auto p-4 border-t  ">
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-400 border-gray-700"
            onClick={() => setShowAnalyticsDrawer(false)}
          >
            Back to projects
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProjectAnalyticsDrawer;
