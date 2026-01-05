import React from 'react';
import { GraduationCap, X, School } from 'lucide-react';

import { AddButton } from '@/components/ui/AddButton';
import { cn } from '@/lib/utils';
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
  const toYmd = (iso: string) => iso.slice(0, 10);

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
      <div className={cn('mb-5')}>
        <div className="rounded-xl border bg-gradient p-4 sm:p-5 flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 my-auto">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Education</h2>
            <p className="text-sm text-muted-foreground">
              Add details about your educational background.
            </p>
          </div>
        </div>
      </div>

      <form className={cn('space-y-5')}>
        {educationData.map((education, index) => (
          <Card key={index} className={cn('relative')}>
            <CardHeader className={cn('pb-2')}>
              <div className={cn('flex justify-between items-center')}>
                <CardDescription>Degree, school and dates.</CardDescription>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveEducation(index)}
                    className={cn('rounded-full')}
                    type="button"
                    size="icon"
                  >
                    <X className={cn('h-5 w-5 text-red-500')} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className={cn('space-y-4')}>
              <div>
                <Label htmlFor={`degree-${index}`}>Degree</Label>
                <InputGroup>
                  <InputGroupText>
                    <GraduationCap className="h-4 w-4" />
                  </InputGroupText>
                  <InputGroupInput
                    id={`degree-${index}`}
                    type="text"
                    value={education.degree}
                    onChange={(e) =>
                      handleInputChange(index, 'degree', e.target.value)
                    }
                    placeholder="e.g., Bachelor of Science"
                  />
                </InputGroup>
              </div>

              <div>
                <Label htmlFor={`school-${index}`}>School/University</Label>
                <InputGroup>
                  <InputGroupText>
                    <School className="h-4 w-4" />
                  </InputGroupText>
                  <InputGroupInput
                    id={`school-${index}`}
                    type="text"
                    value={education.school}
                    onChange={(e) =>
                      handleInputChange(index, 'school', e.target.value)
                    }
                    placeholder="e.g., XYZ University"
                  />
                </InputGroup>
              </div>

              <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-3')}>
                <div>
                  <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                  <DatePicker
                    value={education.startDate}
                    onChange={(date) =>
                      handleInputChange(index, 'startDate', toYmd(date))
                    }
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                <div>
                  <Label htmlFor={`endDate-${index}`}>End Date</Label>
                  <DatePicker
                    value={education.endDate}
                    onChange={(date) =>
                      handleInputChange(index, 'endDate', toYmd(date))
                    }
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </form>

      <AddButton onClick={handleAddEducation} />
    </div>
  );
};
