import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { CheckCircle } from 'lucide-react';

interface EducationInfo {
  degree: string;
  school: string;
  startDate: string;
  endDate: string;
}

interface EducationInfoProps {
  educationData: EducationInfo[];
  setEducationData: React.Dispatch<React.SetStateAction<EducationInfo[]>>;
}

export const EducationInfo: React.FC<EducationInfoProps> = ({
  educationData,
  setEducationData,
}) => {
  const handleInputChange = (
    index: number,
    field: keyof EducationInfo,
    value: string,
  ) => {
    const updatedEducation = [...educationData];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setEducationData(updatedEducation);
  };

  const handleAddEducation = () => {
    setEducationData([
      ...educationData,
      { degree: '', school: '', startDate: '', endDate: '' },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    const updatedEducation = educationData.filter((_, i) => i !== index);
    setEducationData(updatedEducation);
  };

  return (
    <div>
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl">Education Info</h2>
        <p className="text-sm text-gray-500">
          Add details about your educational background.
        </p>
      </div>

      <form className="space-y-5">
        {educationData.map((education, index) => (
          <div key={index} className="relative space-y-4 p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Education {index + 1}</h3>
              {index > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleRemoveEducation(index)}
                  className="p-1 rounded-full"
                >
                  <X className="h-5 w-5 text-red-500" />
                </Button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Degree
              </label>
              <Input
                type="text"
                value={education.degree}
                onChange={(e) =>
                  handleInputChange(index, 'degree', e.target.value)
                }
                placeholder="e.g., Bachelor of Science"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                School/University
              </label>
              <Input
                type="text"
                value={education.school}
                onChange={(e) =>
                  handleInputChange(index, 'school', e.target.value)
                }
                placeholder="e.g., XYZ University"
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
                  value={education.startDate}
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
                  value={education.endDate}
                  onChange={(e) =>
                    handleInputChange(index, 'endDate', e.target.value)
                  }
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </form>

      <div className="flex justify-center mt-4">
        <Button
          onClick={handleAddEducation}
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

export default EducationInfo;
