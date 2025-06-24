import React from 'react';
import { PlusCircle, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
      <div className={cn('space-y-1.5 mb-5 ml-5')}>
        <h2 className={cn('text-2xl')}>Education Info</h2>
        <p className={cn('text-sm text-gray-500')}>
          Add details about your educational background.
        </p>
      </div>

      <form className={cn('space-y-5')}>
        {educationData.map((education, index) => (
          <div key={index} className={cn('relative space-y-4 p-6 shadow-lg')}>
            <div className={cn('flex justify-between items-center')}>
              <h3 className={cn('text-sm font-semibold')}>
                Education {index + 1}
              </h3>
              {index > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleRemoveEducation(index)}
                  className={cn('p-1 rounded-full')}
                >
                  <X className={cn('h-5 w-5 text-red-500')} />
                </Button>
              )}
            </div>

            <div>
              <Label htmlFor={`degree-${index}`}>Degree</Label>
              <Input
                id={`degree-${index}`}
                type="text"
                value={education.degree}
                onChange={(e) =>
                  handleInputChange(index, 'degree', e.target.value)
                }
                placeholder="e.g., Bachelor of Science"
                className={cn(
                  'block w-full border-gray-300 rounded-md shadow-sm sm:text-sm',
                )}
              />
            </div>

            <div>
              <Label htmlFor={`school-${index}`}>School/University</Label>
              <Input
                id={`school-${index}`}
                type="text"
                value={education.school}
                onChange={(e) =>
                  handleInputChange(index, 'school', e.target.value)
                }
                placeholder="e.g., XYZ University"
                className={cn(
                  'block w-full border-gray-300 rounded-md shadow-sm sm:text-sm',
                )}
              />
            </div>

            <div className={cn('grid grid-cols-2 gap-3')}>
              <div>
                <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                <Input
                  id={`startDate-${index}`}
                  type="date"
                  value={education.startDate}
                  onChange={(e) =>
                    handleInputChange(index, 'startDate', e.target.value)
                  }
                  className={cn(
                    'block w-full border-gray-300 rounded-md shadow-sm sm:text-sm',
                  )}
                />
              </div>
              <div>
                <Label htmlFor={`endDate-${index}`}>End Date</Label>
                <Input
                  id={`endDate-${index}`}
                  type="date"
                  value={education.endDate}
                  onChange={(e) =>
                    handleInputChange(index, 'endDate', e.target.value)
                  }
                  className={cn(
                    'block w-full border-gray-300 rounded-md shadow-sm sm:text-sm',
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </form>

      <div className={cn('flex justify-center mt-4')}>
        <Button
          onClick={handleAddEducation}
          className={cn(
            'text-center justify-items-center dark:text-black  light:bg-black px-72',
          )}
        >
          <PlusCircle />
        </Button>
      </div>
    </div>
  );
};
