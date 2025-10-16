import React, { useEffect } from 'react';
// import { useForm } from 'react-hook-form';
import { NotebookText, X } from 'lucide-react';

import { AddButton } from '@/components/ui/AddButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';

// const promptTemplate = `
// Job Title: {jobTitle} ,depends on job title give me summary for my resume within 3-4 lines in JSON format with field experience Level and summary with experience for fresher ,mid-level and experienced
// `;

interface SummaryInfoProps {
  summaryData: string[];
  setSummaryData: React.Dispatch<React.SetStateAction<string[]>>;
  workExperienceData: {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
}

export const SummaryInfo: React.FC<SummaryInfoProps> = ({
  summaryData,
  setSummaryData,
  workExperienceData,
}) => {
  // const [loading, setLoading] = useState(false);
  // const [completed, setCompleted] = useState(false);
  // const [aiResponse, setAiResponse] = useState<string>('');

  const handleInputChange = (index: number, value: string) => {
    const updatedSummaryData = [...summaryData];
    updatedSummaryData[index] = value;
    setSummaryData(updatedSummaryData);
  };

  useEffect(() => {}, [workExperienceData]); // Logs data every time it updates

  const handleAddSummary = () => {
    setSummaryData([...summaryData, '']);
  };

  const handleRemoveSummary = (index: number) => {
    const updatedSummaryData = summaryData.filter((_, i) => i !== index);
    setSummaryData(updatedSummaryData);
  };

  // const generateFromAI = async () => {
  //

  // Ensure jobTitle is correctly extracted
  // const jobTitle = workExperienceData?.[0]?.jobTitle || 'Unknown Job Title';

  //   const PROMPT = promptTemplate.replace('{jobTitle}', jobTitle);
  //   const result = await generateAIResponse(PROMPT);
  //   setAiResponse(result);
  //   setLoading(true);
  //   setCompleted(false);

  //   try {
  //     const result = await generateAIResponse(PROMPT);
  //
  //     setAiResponse(result);
  //     setCompleted(true);
  //   } catch (error) {
  //     console.error('Error generating AI response:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div>
      <div className="mb-5">
        <div className="rounded-xl border bg-gradient p-4 sm:p-5 flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 my-auto">
            <NotebookText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Professional Summary
            </h2>
            <p className="text-sm text-muted-foreground">
              Write a short introduction for your resume.
            </p>
          </div>
        </div>
        {/* <Button
          onClick={generateFromAI}
          disabled={loading} // Disable the button while loading
          className={`relative overflow-hidden group rounded-lg p-2 border-2 ${
            loading
              ? 'animate-twinkle bg-gradient-to-br from-pink-500 to-purple-500 text-white'
              : completed
                ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white'
                : 'bg-black text-white hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-500'
          }`}
        >
          {loading ? (
            <Loader className="animate-spin h-5 w-5" /> // Loading spinner
          ) : (
            'Generate From AI'
          )}
        </Button> */}
      </div>

      <form className="space-y-5">
        {summaryData.map((summary, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardDescription>A short professional intro.</CardDescription>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveSummary(index)}
                    className="rounded-full"
                    type="button"
                    size="icon"
                  >
                    <X className="h-5 w-5 text-red-500" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={summary}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder="A brief, engaging text about yourself"
              />
            </CardContent>
          </Card>
        ))}
      </form>

      <AddButton onClick={handleAddSummary} />

      {/* <div className="flex justify-center mt-4">
        <Button className="text-center bg-green-500 hover:bg-green-600 text-white">
          Save
        </Button>
      </div> */}

      {/* AI Response Section */}
      {/*     
      {aiResponse && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-center mb-4">
            AI Suggestions
          </h3>

          {(() => {
            try {
              const responseJSON = JSON.parse(aiResponse);

              return responseJSON.experienceLevels.map(
                (exp: any, index: number) => (
                  <div
                    key={index}
                    className="p-6 shadow-lg rounded-lg bg-white mb-4"
                  >
                    <h4 className="text-md font-semibold text-gray-800 mb-2">
                      {exp.level} Level
                    </h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {exp.summary.map((line: string, i: number) => (
                        <li key={i} className="text-sm">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              );
            } catch (error) {
              return <p className="text-red-500">Error parsing AI response.</p>;
            }
          })()}
        </div>
      )} */}
    </div>
  );
};
