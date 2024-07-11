import React from 'react';
import { Github, MessageSquareIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

interface ProjectProps {
  _id: string;
  projectName: string;
  description: string;
  verified: boolean;
  githubLink: string;
  start: string;
  end: string;
  refer: string;
  techUsed: string[];
  role: string;
  projectType: string;
  oracleAssigned: string | null;
  verificationUpdateTime: string;
  comments: string;
}

const ProjectCard: React.FC<ProjectProps> = ({
  projectName,
  description,
  verified,
  githubLink,
  start,
  end,
  refer,
  techUsed,
  role,
  projectType,
  comments,
}) => {
  return (
    <Card className="w-full mx-auto md:max-w-2xl">
      <CardHeader>
        <CardTitle className="flex">
          {projectName}
          {githubLink && (
            <div className="ml-auto">
              <a href={githubLink} className="text-sm text-white underline">
                <Github />
              </a>
            </div>
          )}
        </CardTitle>
        <CardDescription className="block mt-1 uppercase tracking-wide leading-tight font-medium text-white">
          {projectType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {verified ? (
          <Badge className="bg-success hover:bg-success">VERIFIED</Badge>
        ) : (
          <Badge className="bg-warning hover:bg-warning">PENDING</Badge>
        )}
        <p className="text-gray-300 pt-4">{description}</p>

        <p className="mt-2 flex text-gray-500 border p-3 rounded">
          <MessageSquareIcon className="pr-1" />
          {comments}
        </p>
        <div className="mt-4">
          <p className="text-sm text-gray-600">Reference: {refer}</p>
        </div>
        <div className="my-4">
          <p className="text-sm text-gray-600">Role: {role}</p>
        </div>
        {techUsed.map((tech: string, index: number) => (
          <Badge
            className="uppercase mx-1 text-xs font-normal bg-gray-300"
            key={index}
          >
            {tech}
          </Badge>
        ))}
      </CardContent>
      <CardFooter className="flex">
        <p className="text-sm font-semibold text-black bg-white px-3 py-1 rounded">
          {new Date(start).toLocaleDateString()}
        </p>
        <p>-</p>
        <p className="text-sm font-semibold text-black bg-white px-3 py-1 uppercase rounded">
          {end !== 'current' ? new Date(end).toLocaleDateString() : 'Current'}
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
