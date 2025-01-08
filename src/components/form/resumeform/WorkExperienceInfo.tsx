import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, PlusCircle, X } from 'lucide-react';

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
    const updatedWorkExperience = [...workExperienceData];
    updatedWorkExperience[index] = {
      ...updatedWorkExperience[index],
      [field]: value,
    };
    setWorkExperienceData(updatedWorkExperience);
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
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl">Work Experience</h2>
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
              <label className="block text-sm font-medium text-gray-500">
                Job Title
              </label>
              <Input
                type="text"
                value={work.jobTitle}
                onChange={(e) =>
                  handleInputChange(index, 'jobTitle', e.target.value)
                }
                placeholder="e.g., Software Engineer"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Company
              </label>
              <Input
                type="text"
                value={work.company}
                onChange={(e) =>
                  handleInputChange(index, 'company', e.target.value)
                }
                placeholder="e.g., Tech Solutions Inc."
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={work.startDate}
                  onChange={(e) =>
                    handleInputChange(index, 'startDate', e.target.value)
                  }
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  End Date
                </label>
                <Input
                  type="date"
                  value={work.endDate}
                  onChange={(e) =>
                    handleInputChange(index, 'endDate', e.target.value)
                  }
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Description
              </label>
              <textarea
                className="block w-full p-2 border-gray-300 rounded-md shadow-sm sm:text-sm"
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

      <div className=" flex justify-center mt-4">
        <Button
          onClick={handleAddWorkExperience}
          className="text-center justify-items-center text-white bg-gray"
        >
          <PlusCircle />
        </Button>
      </div>
      <div className="flex justify-center mt-4">
        <Button className="text-center justify-items-center bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle />
        </Button>
      </div>
    </div>
  );
};

export default WorkExperienceInfo;
