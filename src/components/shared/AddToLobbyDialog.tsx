import React from 'react';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ConnectsDialog from '@/components/shared/ConnectsDialog';
import { RootState } from '@/lib/store';
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
  setLoading,
}: any) => {
  const user = useSelector((state: RootState) => state.user);

  const isValidCheck = async () => {
    if (!currSkills || currSkills.length === 0) {
      // reuse existing error toast in parent path if desired; keeping lightweight here
      return false;
    }
    return true;
  };
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
          <ConnectsDialog
            // form is unused internally; provide a dummy to satisfy types
            form={{} as any}
            loading={isLoading}
            setLoading={setLoading}
            onSubmit={async () => {
              const success = await handleAddToLobby(talent.freelancer_id);
              if (success) setOpen(false);
            }}
            isValidCheck={isValidCheck}
            userId={user?.uid}
            buttonText="Save"
            userType="BUSINESS"
            requiredConnects={parseInt(
              process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST || '0',
              10,
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToLobbyDialog;
