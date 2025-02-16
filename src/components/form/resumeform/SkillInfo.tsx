import React, { useState } from 'react';
import { PlusCircle, X, Loader } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateAIResponse } from '@/services/aiService'; // AI service for generating responses

interface Skill {
  skillName: string;
}

interface SkillInfoProps {
  skillData: Skill[];
  setSkillData: React.Dispatch<React.SetStateAction<Skill[]>>;
  projectData: { title: string; description: string }[]; // Add project data for AI skill generation
}

const promptTemplate = `
Given these project titles: {projectTitles}, Given these project titles: {projectTitles}, extract the key technical skills and tools involved in the projects. List them as one-word items, separated by commas. Avoid vague terms like "real-time" and focus on specific technologies or programming skills.

`;

export const SkillInfo: React.FC<SkillInfoProps> = ({
  skillData,
  setSkillData,
  projectData = [],
}) => {
  const [loading, setLoading] = useState(false); // Loading state for AI generation
  const [aiResponse, setAiResponse] = useState<string>(''); // AI-generated skills

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...skillData];
    updatedSkills[index] = { skillName: value };
    setSkillData(updatedSkills);
  };

  const handleAddSkill = () => {
    setSkillData([...skillData, { skillName: '' }]);
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = skillData.filter((_, i) => i !== index);
    setSkillData(updatedSkills);
  };
  const generateSkillsFromAI = async () => {
    if (!projectData || projectData.length === 0) {
      console.error('No project data available for AI generation.');
      return;
    }

    const projectTitles = projectData
      .map((project) => project.title)
      .join(', ');
    const prompt = promptTemplate.replace('{projectTitles}', projectTitles);

    setLoading(true);
    setAiResponse('');

    try {
      const result = await generateAIResponse(prompt);
      setAiResponse(result);
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="space-y-1.5 ml-5 mb-5">
        <h2 className="text-2xl">Skills</h2>
        <p className="text-sm text-gray-500">What are you good at?</p>
        <Button
          onClick={generateSkillsFromAI}
          disabled={loading} // Disable the button while loading
          className={`relative overflow-hidden group rounded-lg p-2 border-2 ${
            loading
              ? 'animate-twinkle bg-gradient-to-br from-blue-500 to-purple-500 text-white'
              : 'bg-black text-white hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-500'
          }`}
        >
          {loading ? (
            <Loader className="animate-spin h-5 w-5" />
          ) : (
            'Generate Skills from AI'
          )}
        </Button>
      </div>

      <form className="space-y-5 mt-5">
        {skillData.map((skill, index) => (
          <div key={index} className="relative space-y-4 p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Skill {index + 1}</h3>
              {index > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleRemoveSkill(index)}
                  className="p-1 rounded-full"
                >
                  <X className="h-5 w-5 text-red-500" />
                </Button>
              )}
            </div>
            <div>
              <Label
                htmlFor={`skillName-${index}`}
                className="block text-sm font-medium text-gray-500"
              >
                Skill Name
              </Label>
              <Input
                id={`skillName-${index}`}
                type="text"
                value={skill.skillName}
                onChange={(e) => handleSkillChange(index, e.target.value)}
                placeholder="e.g., React.js, Node.js, graphic design"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
        ))}
      </form>

      <div className="flex justify-center mt-4">
        <Button
          onClick={handleAddSkill}
          className="text-center justify-items-centerdark:text-black  light:bg-black"
        >
          <PlusCircle />
        </Button>
      </div>

      {/* AI Response Section */}
      {/* AI Response Section */}
      {aiResponse && (
        <div className="mt-8 p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">AI Suggestion</h3>
          <Textarea
            value={aiResponse}
            readOnly
            className="w-full border-4 border-transparent rounded-xl shadow-sm sm:text-sm 
                 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 
                 focus:outline-none"
            style={{
              backgroundClip: 'padding-box', // Ensures gradient is outside the border
              backgroundColor: 'white', // Keeps textarea background white
            }}
            placeholder="AI-generated skills will appear here..."
          />
        </div>
      )}
    </div>
  );
};
