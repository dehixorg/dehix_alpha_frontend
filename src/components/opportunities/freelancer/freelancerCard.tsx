import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import Link from 'next/link';
import { Plus, X } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
interface FreelancerCardProps {
  name: string;
  skills: string[];
  domains: string[];
  experience: string;
  profile: string;
  userName: string;
  monthlyPay: string;
  Github: string;
  LinkedIn: string;
}

const SHEET_SIDES = ['left'] as const;

type SheetSide = (typeof SHEET_SIDES)[number];

const FreelancerCard: React.FC<FreelancerCardProps> = ({
  name,
  skills,
  domains,
  experience,
  profile,
  userName,
  monthlyPay,
  Github,
  LinkedIn,
}) => {
  const [tmpSkill, setTmpSkill] = React.useState<string>('');
  const [currSkills, setCurrSkills] = React.useState<{ name: string }[]>([]);
  const skillDomainData: { label: string }[] = [];
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleAddSkill = () => {
    if (tmpSkill && !currSkills.some((skill) => skill.name === tmpSkill)) {
      setCurrSkills([...currSkills, { name: tmpSkill }]);
    }
  };

  const handleDeleteSkill = (skillName: string) => {
    setCurrSkills(currSkills.filter((skill) => skill.name !== skillName));
  };

  return (
    <div className=" sm:mx-10 mb-3 max-w-3xl">
      <Card className="flex justify-between mt-5  shadow-lg shadow-gray-500/20  ">
        <div className="flex flex-col justify-between p-4">
          <CardHeader>
            <div className="flex flex-col item-center gap-4">
              <Avatar className="rounded-full w-20 h-20 overflow-hidden border-2 border-gray-400 ">
                <AvatarImage
                  className="w-full h-full object-cover"
                  src={profile}
                  alt="Profile Picture"
                />
              </Avatar>
              <div className="mt-2">
                <CardTitle className="text-xl font-bold">{name}</CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm">
              <span className="font-medium text-gray-400">Experience:</span>
              <span className="font-bold"> {experience} years</span>
            </p>
            {/* Skills Section */}
            {skills && skills.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {skills?.map((skill: any, index) => (
                    <Badge
                      key={index}
                      className="bg-foreground text-background border border-white rounded-xl font-bold uppercase"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {/* Domains Section */}
            {domains && domains.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Domains:</p>
                <div className="flex flex-wrap gap-2">
                  {domains?.map((domain: any, index) => (
                    <Badge
                      key={index}
                      className="bg-foreground text-background border border-white rounded-xl font-bold uppercase"
                    >
                      {domain.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="py-4 mt-8">
              {SHEET_SIDES.map((View) => {
                return (
                  <Sheet key={View}>
                    <SheetTrigger asChild>
                      <Button className="w-full sm:w-[350px] lg:w-[680px]">
                        View
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side={View}
                      className="overflow-y-auto max-h-[100vh]"
                    >
                      <SheetHeader>
                        <SheetTitle className="text-center text-lg font-bold py-4">
                          View Talent Details
                        </SheetTitle>
                      </SheetHeader>
                      <div className="flex flex-col gap-4 items-center justify-center mt-2">
                        <Avatar className="rounded-full w-20 h-20 overflow-hidden border-2 border-gray-400 ">
                          <AvatarImage
                            className="w-full h-full object-cover"
                            src={profile}
                            alt="Profile Picture"
                          />
                        </Avatar>
                        <div className="text-lg font-bold items-center justify-center mt-2">
                          {name}
                        </div>
                        <Card className="w-full shadow-2xl shadow-lg shadow-gray-500/20 mt-4">
                          <table className="min-w-full table-auto border-collapse ">
                            <tbody>
                              <tr>
                                <td className="border-b px-4 py-2 font-medium">
                                  Username
                                </td>
                                <td className="border-b px-4 py-2">
                                  {userName || 'N/A'}
                                </td>
                              </tr>
                              <tr>
                                <td className="border-b px-4 py-2 font-medium">
                                  Skill
                                </td>
                                <td className="border-b px-4 py-2">
                                  {skills?.length === 0 || !skills ? (
                                    'N/A'
                                  ) : (
                                    <>
                                      {skills
                                        .slice(0, 2)
                                        .map((skill: any, index: number) => (
                                          <Badge
                                            key={index}
                                            className="bg-transparent text-foreground"
                                          >
                                            {skill.name}
                                            {index < skills.length - 1 && ','}
                                          </Badge>
                                        ))}

                                      {skills.length > 2 && !isExpanded && (
                                        <Badge
                                          key="extra"
                                          className="bg-transparent border-none text-foreground"
                                          onClick={() => setIsExpanded(true)}
                                        >
                                          +{skills.length - 2}
                                        </Badge>
                                      )}

                                      {isExpanded && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {skills
                                            .slice(2)
                                            .map(
                                              (skill: any, index: number) => (
                                                <Badge
                                                  key={index + 2}
                                                  className="bg-transparent border-none text-foreground"
                                                >
                                                  {skill.name}
                                                  {index <
                                                    skills.slice(2).length -
                                                      1 && ','}
                                                </Badge>
                                              ),
                                            )}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </td>
                              </tr>

                              <tr>
                                <td className="border-b px-4 py-2 font-medium">
                                  Experience
                                </td>
                                <td className="border-b px-4 py-2">
                                  {experience ? `${experience} Years` : 'N/A'}
                                </td>
                              </tr>
                              <tr>
                                <td className="border-b px-4 py-2 font-medium">
                                  MonthlyPay
                                </td>
                                <td className="border-b px-4 py-2">
                                  {monthlyPay && monthlyPay.trim()
                                    ? `${monthlyPay}$`
                                    : 'N/A'}
                                </td>
                              </tr>
                              <tr>
                                <td className="border-b px-4 py-2 font-medium">
                                  Github
                                </td>
                                <td className="border-b px-4 py-2">
                                  {Github && Github.trim() ? (
                                    <a
                                      href={Github}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline overflow-hidden whitespace-nowrap text-ellipsis max- sm:max-w-md lg:max-w-lg"
                                      title={Github}
                                    >
                                      {Github}
                                    </a>
                                  ) : (
                                    'N/A'
                                  )}
                                </td>
                              </tr>

                              <tr>
                                <td className="border-b px-4 py-2 font-medium">
                                  LinkedIn
                                </td>
                                <td className="border-b px-4 py-2">
                                  {LinkedIn && LinkedIn.trim() ? (
                                    <a
                                      href={LinkedIn}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline overflow-hidden whitespace-nowrap text-ellipsis max-w-[120px] sm:max-w-[170px] block"
                                      title={LinkedIn}
                                    >
                                      {LinkedIn}
                                    </a>
                                  ) : (
                                    'N/A'
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </Card>

                        <div className="w-full text-sm mt-6">
                          <div className="w-full text-center">
                            <Link
                              href={`/business/freelancerProfile/${userName}`}
                              passHref
                            >
                              <Button className="w-full text-sm text-black rounded-md">
                                Expand
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                );
              })}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default FreelancerCard;
