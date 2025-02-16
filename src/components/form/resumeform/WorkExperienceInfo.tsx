import React, { useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
      console.error('Invalid date format. Expected yyyy-MM-dd.');
      return;
    }

    const updatedWorkExperience = [...workExperienceData];
    updatedWorkExperience[index] = {
      ...updatedWorkExperience[index],
      [field]: value,
    };
    setWorkExperienceData(updatedWorkExperience);
  };
  //
  useEffect(() => {
    console.log(
      'Updated Work Experience Data in SummaryInfo:',
      workExperienceData,
    );
  }, [workExperienceData]);

  useEffect(() => {
    if (workExperienceData.length > 0) {
      const latestJobTitle =
        workExperienceData[workExperienceData.length - 1].jobTitle;
      if (latestJobTitle) {
        console.log('Confirmed updated job title:', latestJobTitle);
        generateAISuggestion(latestJobTitle);
      }
    }
  }, [workExperienceData]);
  // This runs whenever workExperienceData changes

  const generateAISuggestion = (jobTitle: string) => {
    // Call your AI API or function to generate suggestions
    console.log('Fetching AI suggestions for:', jobTitle);
    // Example: Fetching data from OpenAI API
    // fetchAIResponse(jobTitle).then(response => console.log(response));
  };

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
      <div className="space-y-1.5 ml-5 mb-5">
        <h2 className="text-2xl font-normal">Work Experience</h2>
        <p className="text-sm text-gray-500">
          Add your work experience details.
        </p>
      </div>

      <form className="space-y-5">
        {workExperienceData.map((work, index) => (
          <div key={index} className="relative space-y-4 p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">
                Work Experience {index + 1}
              </h3>
              {index > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleRemoveWorkExperience(index)}
                  className="p-1 rounded-full"
                >
                  <X className="h-5 w-5 text-red-500" />
                </Button>
              )}
            </div>
            <div>
              <Label htmlFor={`jobTitle-${index}`}>Job Title</Label>
              <Input
                id={`jobTitle-${index}`}
                type="text"
                value={work.jobTitle}
                onChange={(e) =>
                  handleInputChange(index, 'jobTitle', e.target.value)
                }
                placeholder="e.g., Software Engineer"
                className="border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <Label htmlFor={`company-${index}`}>Company</Label>
              <Input
                id={`company-${index}`}
                type="text"
                value={work.company}
                onChange={(e) =>
                  handleInputChange(index, 'company', e.target.value)
                }
                placeholder="e.g., Tech Solutions Inc."
                className="border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                <Input
                  id={`startDate-${index}`}
                  type="date"
                  value={work.startDate}
                  onChange={(e) =>
                    handleInputChange(index, 'startDate', e.target.value)
                  }
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <Label htmlFor={`endDate-${index}`}>End Date</Label>
                <Input
                  id={`endDate-${index}`}
                  type="date"
                  value={work.endDate}
                  onChange={(e) =>
                    handleInputChange(index, 'endDate', e.target.value)
                  }
                  className="border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`description-${index}`}>Description</Label>
              <textarea
                id={`description-${index}`}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                rows={4}
                value={work.description}
                onChange={(e) =>
                  handleInputChange(index, 'description', e.target.value)
                }
                placeholder="Describe your role and responsibilities"
              />
            </div>
          </div>
        ))}
      </form>

      <div className="flex justify-center mt-4">
        <Button
          onClick={handleAddWorkExperience}
          className="text-center dark:text-black  light:bg-black"
        >
          <PlusCircle />
        </Button>
      </div>
    </div>
  );
};
