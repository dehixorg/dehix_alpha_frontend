import React from 'react';
import { BriefcaseBusiness, X, Building2 } from 'lucide-react';

import { AddButton } from '@/components/ui/AddButton';
import { Label } from '@/components/ui/label';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { DatePicker } from '@/components/shared/datePicker';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface WorkExperience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface WorkExperienceInfoProps {
  workExperienceData: WorkExperience[];
  setWorkExperienceData: React.Dispatch<React.SetStateAction<WorkExperience[]>>;
}
export const WorkExperienceInfo: React.FC<WorkExperienceInfoProps> = ({
  workExperienceData,
  setWorkExperienceData,
}) => {
  const handleInputChange = (
    index: number,
    field: keyof WorkExperience,
    value: string,
  ) => {
    if (
      (field === 'startDate' || field === 'endDate') &&
      value &&
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      return;
    }

    const updatedWorkExperience = [...workExperienceData];
    updatedWorkExperience[index] = {
      ...updatedWorkExperience[index],
      [field]: value,
    };
    setWorkExperienceData(updatedWorkExperience);
  };

  const toYmd = (iso: string) => iso.slice(0, 10);

  const handleAddWorkExperience = () => {
    setWorkExperienceData([
      ...workExperienceData,
      {
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ]);
  };

  const handleRemoveWorkExperience = (index: number) => {
    const updatedWorkExperience = workExperienceData.filter(
      (_, i) => i !== index,
    );
    setWorkExperienceData(updatedWorkExperience);
  };

  return (
    <div>
      <div className="mb-5">
        <div className="rounded-xl border bg-gradient p-4 sm:p-5 flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 my-auto">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Work Experience
            </h2>
            <p className="text-sm text-muted-foreground">
              Add your work experience details.
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-5">
        {workExperienceData.map((work, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardDescription>
                  Role, company and responsibilities.
                </CardDescription>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveWorkExperience(index)}
                    className="rounded-full"
                    type="button"
                    size="icon"
                    aria-label={`Remove work experience entry ${index + 1}`}
                  >
                    <X className="h-5 w-5 text-red-500" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`jobTitle-${index}`}>Job Title</Label>
                <InputGroup>
                  <InputGroupText>
                    <BriefcaseBusiness className="h-4 w-4" />
                  </InputGroupText>
                  <InputGroupInput
                    id={`jobTitle-${index}`}
                    type="text"
                    value={work.jobTitle}
                    onChange={(e) =>
                      handleInputChange(index, 'jobTitle', e.target.value)
                    }
                    placeholder="e.g., Software Engineer"
                  />
                </InputGroup>
              </div>
              <div>
                <Label htmlFor={`company-${index}`}>Company</Label>
                <InputGroup>
                  <InputGroupText>
                    <Building2 className="h-4 w-4" />
                  </InputGroupText>
                  <InputGroupInput
                    id={`company-${index}`}
                    type="text"
                    value={work.company}
                    onChange={(e) =>
                      handleInputChange(index, 'company', e.target.value)
                    }
                    placeholder="e.g., Tech Solutions Inc."
                  />
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                  <DatePicker
                    value={work.startDate}
                    onChange={(date) =>
                      handleInputChange(index, 'startDate', toYmd(date))
                    }
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                <div>
                  <Label htmlFor={`endDate-${index}`}>End Date</Label>
                  <DatePicker
                    value={work.endDate}
                    onChange={(date) =>
                      handleInputChange(index, 'endDate', toYmd(date))
                    }
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  rows={4}
                  value={work.description}
                  onChange={(e) =>
                    handleInputChange(index, 'description', e.target.value)
                  }
                  placeholder="Describe your role and responsibilities"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </form>

      <AddButton onClick={handleAddWorkExperience} />
    </div>
  );
};
