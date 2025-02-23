'use client';

import React from 'react';

import { Search } from '@/components/search';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SidebarMenu from '@/components/menu/sidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import Breadcrumb from '@/components/shared/breadcrumbList';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import { getBadgeColor } from '@/utils/common/getBadgeStatus';

// Dummy data
const dummyData = {
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    role: 'Developer',
    skills: [{ name: 'JavaScript' }, { name: 'React' }, { name: 'Node.js' }],
    domains: [{ name: 'Web Development' }, { name: 'Frontend' }],
  },
  professional: [
    {
      company: 'Tech Solutions',
      jobTitle: 'Senior Developer',
      workDescription:
        'Developed and maintained web applications using modern technologies.',
      workFrom: '2020-01-01',
      workTo: '2024-01-01',
      referencePersonName: 'Jane Smith',
      referencePersonContact: '+0987654321',
      githubRepoLink: 'https://github.com/username/repo',
      location: 'India',
      status: 'Verified',
    },
    {
      company: 'Innovatech',
      jobTitle: 'Software Engineer',
      workDescription:
        'Worked on various innovative projects and improved software performance.',
      workFrom: '2018-01-01',
      workTo: '2019-12-31',
      referencePersonName: 'Mike Johnson',
      referencePersonContact: '+1234509876',
      githubRepoLink: 'https://github.com/username/innovatech-repo',
      location: 'India',
      status: 'Pending',
    },
  ],
  project: [
    {
      projectName: 'Awesome Project',
      description: 'A cutting-edge project involving the latest technologies.',
      githubRepoLink: 'https://github.com/username/project-repo',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      reference: 'Project reference details',
      technologiesUsed: 'React, Node.js, Express',
      role: 'Lead Developer',
      projectType: 'Web Application',
      status: 'Verified',
    },
    {
      projectName: 'Another Cool Project',
      description: 'An innovative project solving real-world problems.',
      githubRepoLink: 'https://github.com/username/cool-project-repo',
      startDate: '2022-01-01',
      endDate: '2022-12-31',
      reference: 'Cool project reference details',
      technologiesUsed: 'Angular, Node.js, MongoDB',
      role: 'Full Stack Developer',
      projectType: 'Mobile Application',
      status: 'Pending',
    },
  ],
  education: [
    {
      degree: 'Bachelor of Technology',
      universityName: 'KJ Somaiya Institute of Technology',
      fieldOfStudy: 'Information Technology',
      startDate: '2018-08-01',
      endDate: '2022-06-30',
      grade: '9.86 CGPA',
      status: 'Pending',
    },
    {
      degree: 'Master of Technology',
      universityName: 'ABC University',
      fieldOfStudy: 'Computer Science',
      startDate: '2023-08-01',
      endDate: '2025-06-30',
      grade: '9.95 CGPA',
      status: 'Verified',
    },
  ],
};

// Types
interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

interface DisplayInfoProps {
  title: string;
  data: React.ReactNode;
}

// Reusable Card Component
const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => (
  <Card className="p-8 bg-black rounded-lg shadow-md">
    <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
    <div className="space-y-6">{children}</div>
  </Card>
);

// Display Info Function
const DisplayInfo: React.FC<DisplayInfoProps> = ({ title, data }) => (
  <div>
    <p>
      <strong className="font-semibold">{title}:</strong>{' '}
      <span className="text-muted-foreground">{data}</span>
    </p>
  </div>
);

const FreelancerInfo: React.FC = () => {
  // Function to get the badge color based on status

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Personal Info"
      />
      <div className="flex flex-col mb-8 sm:gap-8 sm:py-0 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:border-0  sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Personal Info"
          />
          <Breadcrumb
            items={[
              { label: 'Freelancer', link: '#' },
              { label: 'Freelancer Info', link: '#' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>
          <DropdownProfile />
        </header>
        <main className="flex flex-1 flex-col md:flex-row items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="flex-1 grid gap-4 md:grid-cols-1">
            <InfoCard title="Profile Details">
              <div className="grid gap-4 md:grid-cols-2">
                <DisplayInfo
                  title="First Name"
                  data={dummyData.profile.firstName}
                />
                <DisplayInfo
                  title="Last Name"
                  data={dummyData.profile.lastName}
                />
                <DisplayInfo
                  title="Username"
                  data={dummyData.profile.username}
                />
                <DisplayInfo title="Email" data={dummyData.profile.email} />
                <DisplayInfo title="Phone" data={dummyData.profile.phone} />
                <DisplayInfo title="Role" data={dummyData.profile.role} />
              </div>
            </InfoCard>

            <InfoCard title="Professional Information">
              {dummyData.professional.map((job, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <hr className="my-4 border-t border-gray-600" />
                  )}
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold">{job.jobTitle}</p>
                      <Badge className={getBadgeColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="font-semibold">{job.company} · Full-time</p>
                    <p className="text-muted-foreground">
                      {new Date(job.workFrom).toLocaleDateString()} -{' '}
                      {new Date(job.workTo).toLocaleDateString()} ·{' '}
                      {(new Date(job.workTo).getFullYear() -
                        new Date(job.workFrom).getFullYear()) *
                        12 +
                        (new Date(job.workTo).getMonth() -
                          new Date(job.workFrom).getMonth())}{' '}
                      mos
                    </p>
                    <p className="text-muted-foreground">{job.location}</p>
                    <p className="text-muted-foreground">
                      {job.workDescription}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Reference:</strong> {job.referencePersonName},{' '}
                      {job.referencePersonContact}
                    </p>
                    <p className="text-muted-foreground">
                      <a href={job.githubRepoLink} className="text-blue-400">
                        {job.githubRepoLink}
                      </a>
                    </p>
                  </div>
                </React.Fragment>
              ))}
            </InfoCard>

            <InfoCard title="Project Information">
              {dummyData.project.map((project, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <hr className="my-4 border-t border-gray-600" />
                  )}
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold">{project.projectName}</p>
                      <Badge className={getBadgeColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="font-semibold">{project.projectType}</p>
                    <p className="text-muted-foreground">
                      {project.startDate} - {project.endDate}
                    </p>
                    <p className="text-muted-foreground">
                      {project.description}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Reference:</strong> {project.reference}
                    </p>
                    <p className="text-muted-foreground">
                      <a
                        href={project.githubRepoLink}
                        className="text-blue-400"
                      >
                        {project.githubRepoLink}
                      </a>
                    </p>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">
                        Technologies Used
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologiesUsed
                          .split(', ')
                          .map((tech, index) => (
                            <Badge
                              key={index}
                              className="bg-gray-700 text-muted-foreground"
                            >
                              {tech}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </InfoCard>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-1/3">
            <InfoCard title="Education Information">
              {dummyData.education.map((education, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <hr className="my-4 border-t border-gray-600" />
                  )}
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold">
                        {education.universityName}
                      </p>
                      <Badge className={getBadgeColor(education.status)}>
                        {education.status}
                      </Badge>
                    </div>
                    <p className="font-semibold">{education.degree}</p>
                    <p className="text-muted-foreground">
                      {education.fieldOfStudy}
                    </p>
                    <p className="text-muted-foreground">
                      {education.startDate} - {education.endDate}
                    </p>
                    <p className="text-white">
                      <strong>Grade:</strong> {education.grade}
                    </p>
                  </div>
                </React.Fragment>
              ))}
            </InfoCard>

            <InfoCard title="Skills and Domains">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Skills</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dummyData.profile.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        className="bg-gray-700 text-muted-foreground"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Domains</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dummyData.profile.domains.map((domain, index) => (
                      <Badge
                        key={index}
                        className="bg-gray-700 text-muted-foreground"
                      >
                        {domain.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </InfoCard>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FreelancerInfo;
