import React from 'react';
import { useSelector } from 'react-redux';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

  const existingInvites = Array.isArray(talent?.dehixTalent)
    ? talent.dehixTalent
    : [];

  const freelancerTalentNames = new Set(
    (Array.isArray(talent?.talents) ? talent.talents : [])
      .map((t: any) =>
        String(t?.talentName || '')
          .trim()
          .toLowerCase(),
      )
      .filter((v: any) => Boolean(v)),
  );

  const existingHireIds = new Set(
    existingInvites
      .map((i: any) => i?.hireId)
      .filter((id: any) => typeof id === 'string' && id.length > 0),
  );

  const filteredOptions = (skillDomainData || []).filter((opt: any) => {
    const id = opt?.uid || opt?._id;
    if (!id) return false;
    return !existingHireIds.has(id);
  });

  const inDeveloperProfileOptions = filteredOptions.filter((opt: any) => {
    const label = String(opt?.label || '')
      .trim()
      .toLowerCase();
    if (!label) return false;
    return freelancerTalentNames.has(label);
  });

  const notInDeveloperProfileOptions = (skillDomainData || []).filter(
    (opt: any) => {
      const label = String(opt?.label || '')
        .trim()
        .toLowerCase();
      if (!label) return false;
      return !freelancerTalentNames.has(label);
    },
  );

  const formatUpdatedAt = (v: any) => {
    if (!v) return 'N/A';
    try {
      return new Date(v).toLocaleString();
    } catch {
      return String(v);
    }
  };

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
          <DialogTitle>Invite Freelancer</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <SelectTagPicker
            label="Select hires"
            options={inDeveloperProfileOptions}
            selected={currSkills}
            onAdd={(value: string) => {
              setTmpSkill(value);
              handleAddSkill();
            }}
            onRemove={(name: string) => handleDeleteSkill(name)}
            optionLabelKey="label"
            selectedNameKey="name"
            selectPlaceholder="Search and select hires"
            searchPlaceholder="Filter hires..."
          />

          {existingInvites.length > 0 && (
            <div className="space-y-2">
              {existingInvites.map((inv: any) => (
                <div
                  key={inv?._id || `${inv?.hireId}:${inv?.attributeId}`}
                  className="rounded-md border border-border bg-muted/30 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {inv?.attributeName || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated: {formatUpdatedAt(inv?.updatedAt)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {inv?.status || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {notInDeveloperProfileOptions.length > 0 && (
            <div className="rounded-md border border-border bg-muted/20 p-3">
              <div className="text-xs font-medium text-muted-foreground">
                Not in developer profile
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {notInDeveloperProfileOptions.map((opt: any) => (
                  <span
                    key={opt?.uid || opt?._id || opt?.label}
                    className="text-xs px-2 py-1 rounded-full bg-muted border border-border"
                  >
                    {opt?.label || 'N/A'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <ConnectsDialog
            // form is unused internally; provide a dummy to satisfy types
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
            skipRedirect={true}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToLobbyDialog;
