import React from 'react';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SelectTagPicker from '@/components/shared/SelectTagPicker';

const AddToLobbyDialog = ({
  skillDomainData = [],
  currSkills = [],
  handleAddSkill,
  handleDeleteSkill,
  handleAddToLobby,
  talent,
  setTmpSkill,
  open,
  setOpen,
  isLoading,
}: any) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Skills to Lobby</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <SelectTagPicker
            label="Select skills"
            options={skillDomainData}
            selected={currSkills}
            onAdd={(value: string) => {
              setTmpSkill(value);
              handleAddSkill();
            }}
            onRemove={(name: string) => handleDeleteSkill(name)}
            optionLabelKey="label"
            selectedNameKey="name"
            selectPlaceholder="Search and select skills"
            searchPlaceholder="Filter skills..."
          />
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={async () => {
              const success = await handleAddToLobby(talent.freelancer_id);
              if (success) setOpen(false);
            }}
            className="w-full text-sm py-2 px-3 rounded-md bg-primary hover:bg-primary/90"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToLobbyDialog;
