import React from 'react';
import { ExternalLink } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConsultantCardProps {
  name: string;
  skills: string;
  domains: string;
  description?: string;
  urls?: { value: string }[];
  perHourRate?: number;
}

const ConsultantCard: React.FC<ConsultantCardProps> = ({
  name,
  skills,
  domains,
  description,
  urls,
  perHourRate,
}) => {
  const skillList = skills.split(',').map((skill) => skill.trim());
  const domainList = domains.split(',').map((domain) => domain.trim());

  return (
    <Card className="mb-4 bg-black text-white">
      <CardHeader className="p-4 border-b border-gray-700">
        <CardTitle className="text-xl font-semibold">{name}</CardTitle>
        <CardDescription className="text-sm text-gray-400 mt-1">
          {skillList.map((skill) => (
            <Badge key={skill} className="mr-2">
              {skill}
            </Badge>
          ))}
          {domainList.map((domain) => (
            <Badge key={domain} className="mr-2">
              {domain}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {description && <p className="mb-2">{description}</p>}
        {urls && urls.length > 0 && (
          <div className="mb-2">
            <p className="font-semibold text-gray-300 mb-1">URLs:</p>
            <ul className="list-none pl-0">
              {urls.map((url, index) => (
                <li key={index} className="mb-1">
                  <a
                    href={url.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <ExternalLink className="mr-1 w-4 h-4 text-gray-400" />
                    {url.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-gray-700">
        {perHourRate !== undefined && (
          <p className="mt-2">
            <strong>Per Hour Rate:</strong> ${perHourRate}
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default ConsultantCard;
