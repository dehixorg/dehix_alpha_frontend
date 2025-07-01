import React from 'react';
import { X } from 'lucide-react';
import { AddButton } from '@/components/ui/AddButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Achievement {
  achievementName: string;
}

interface AchievementInfoProps {
  achievementData: Achievement[];
  setAchievementData: React.Dispatch<React.SetStateAction<Achievement[]>>;
}

export const AchievementInfo: React.FC<AchievementInfoProps> = ({
  achievementData,
  setAchievementData,
}) => {
  const handleAchievementChange = (index: number, value: string) => {
    const updatedAchievements = [...achievementData];
    updatedAchievements[index] = { achievementName: value };
    setAchievementData(updatedAchievements);
  };

  const handleAddAchievement = () => {
    setAchievementData([...achievementData, { achievementName: '' }]);
  };

  const handleRemoveAchievement = (index: number) => {
    const updatedAchievements = achievementData.filter((_, i) => i !== index);
    setAchievementData(updatedAchievements);
  };

  return (
    <div>
      <div className="space-y-1.5 ml-5 mb-5">
        <h2 className="text-2xl">Achievements</h2>
        <p className="text-sm text-gray-500">
          What accomplishments are you proud of?
        </p>
      </div>

      <form className="space-y-5 mt-5">
        {achievementData.map((achievement, index) => (
          <div key={index} className="relative space-y-4 p-6 shadow-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Achievement {index + 1}</h3>
              {index > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleRemoveAchievement(index)}
                  className="p-1 rounded-full"
                >
                  <X className="h-5 w-5 text-red-500" />
                </Button>
              )}
            </div>
            <div>
              <Label
                htmlFor={`achievementName-${index}`}
                className="block text-sm font-medium text-gray-500"
              >
                Achievement Description
              </Label>
              <Input
                id={`achievementName-${index}`}
                type="text"
                value={achievement.achievementName}
                onChange={(e) => handleAchievementChange(index, e.target.value)}
                placeholder="e.g., Increased sales by 20%, Led a team of 5, etc."
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
        ))}
      </form>

      <AddButton onClick={handleAddAchievement} />
    </div>
  );
};
