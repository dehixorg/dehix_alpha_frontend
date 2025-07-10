import React from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AddProfileCardProps {
  onClick: () => void;
}

const AddProfileCard: React.FC<AddProfileCardProps> = ({ onClick }) => {
  return (
    <Card className="w-full h-full flex flex-col border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer">
      <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
        <Button
          variant="ghost"
          size="lg"
          onClick={onClick}
          className="h-full w-full flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-foreground"
        >
          <div className="rounded-full border-2 border-dashed border-current p-4">
            <Plus className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Add New Profile</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create a specialized profile for different roles
            </p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddProfileCard;
