import React from 'react';
import { Trophy, X } from 'lucide-react';

import { AddButton } from '@/components/ui/AddButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';

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
      <div className="mb-5">
        <div className="rounded-xl border bg-gradient p-4 sm:p-5 flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 my-auto">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Achievements
            </h2>
            <p className="text-sm text-muted-foreground">
              What accomplishments are you proud of?
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-5 mt-5">
        {achievementData.map((achievement, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardDescription>
                  Your standout accomplishments.
                </CardDescription>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveAchievement(index)}
                    className="rounded-full"
                    type="button"
                    size="icon"
                    aria-label={`Delete achievement ${index + 1}`}
                  >
                    <X className="h-5 w-5 text-red-500" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor={`achievementName-${index}`}>
                  Achievement Description
                </Label>
                <Input
                  id={`achievementName-${index}`}
                  type="text"
                  value={achievement.achievementName}
                  onChange={(e) =>
                    handleAchievementChange(index, e.target.value)
                  }
                  placeholder="e.g., Increased sales by 20%, Led a team of 5, etc."
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </form>

      <AddButton onClick={handleAddAchievement} />
    </div>
  );
};
