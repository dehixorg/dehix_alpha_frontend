import React from 'react';
// import { useForm } from 'react-hook-form';
import { X, PlusCircle, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SummaryInfoProps {
  summaryData: string[];
  setSummaryData: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SummaryInfo: React.FC<SummaryInfoProps> = ({
  summaryData,
  setSummaryData,
}) => {
  // const form = useForm({
  //   defaultValues: {
  //     summary: '',
  //   },
  // });

  const handleInputChange = (index: number, value: string) => {
    const updatedSummaryData = [...summaryData];
    updatedSummaryData[index] = value;
    setSummaryData(updatedSummaryData);
  };

  const handleAddSummary = () => {
    setSummaryData([...summaryData, '']);
  };

  const handleRemoveSummary = (index: number) => {
    const updatedSummaryData = summaryData.filter((_, i) => i !== index);
    setSummaryData(updatedSummaryData);
  };

  return (
    <div>
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl">Professional Summary</h2>
        <p className="text-sm text-gray-500">
          {' '}
          Write a short introduction for your resume.{' '}
        </p>
      </div>

      <form className="space-y-5">
        {summaryData.map((summary, index) => (
          <div key={index} className="relative space-y-4 p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Summary {index + 1}</h3>
              {index > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleRemoveSummary(index)}
                  className="p-1 rounded-full"
                >
                  <X className="h-5 w-5 text-red-500" />
                </Button>
              )}
            </div>

            <Textarea
              value={summary}
              onChange={(e) => handleInputChange(index, e.target.value)}
              placeholder="A brief, engaging text about yourself"
              className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        ))}
      </form>
      <div className="flex justify-center mt-4">
        <Button
          onClick={handleAddSummary}
          className="text-center bg-gray hover:bg-gray-600 text-white"
        >
          <PlusCircle />
        </Button>
      </div>
      <div className="flex justify-center mt-4">
        <Button className="text-center bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle />
        </Button>
      </div>
    </div>
  );
};
