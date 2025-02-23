import React, { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
import { X, PlusCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const promptTemplate = `
Job Title: {jobTitle} ,depends on job title give me summary for my resume within 3-4 lines in JSON format with field experience Level and summary with experience for fresher ,mid-level and experienced
`;

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

  useEffect(() => {
  }, [workExperienceData]); // Logs data every time it updates

  const handleAddSummary = () => {
    setSummaryData([...summaryData, '']);
  };

  const handleRemoveSummary = (index: number) => {
    const updatedSummaryData = summaryData.filter((_, i) => i !== index);
    setSummaryData(updatedSummaryData);
  };

  // const generateFromAI = async () => {
  //   console.log('Current Work Experience Data:', workExperienceData);

  // Ensure jobTitle is correctly extracted
  // const jobTitle = workExperienceData?.[0]?.jobTitle || 'Unknown Job Title';

  //   const PROMPT = promptTemplate.replace('{jobTitle}', jobTitle);
  //   const result = await generateAIResponse(PROMPT);
  //   setAiResponse(result);
  //   setLoading(true);
  //   setCompleted(false);

  //   try {
  //     const result = await generateAIResponse(PROMPT);
  //     console.log('AI Response:', result);
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
      <div className="space-y-1.5 ml-5 mb-5">
        <h2 className="text-2xl">Professional Summary</h2>
        <p className="text-sm text-gray-500">
          Write a short introduction for your resume.
        </p>
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
          className="text-center dark:text-black  light:bg-black"
        >
          <PlusCircle />
        </Button>
      </div>
      <div className="flex justify-center mt-4">
        <Button className="text-center bg-green-500 hover:bg-green-600 text-white">
          {/* <CheckCircle /> */}
          Save
        </Button>
      </div>

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
