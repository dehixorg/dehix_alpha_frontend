import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { toast } from './use-toast';

interface UseDraftProps<T extends Record<string, any>> {
  form: ReturnType<typeof useForm<T>>;
  formSection: string;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  onSave?: (values: T) => void;
  onDiscard?: () => void;
  setCurrSkills?: any;
}

const useDraft = <T extends Record<string, any>>({
  form,
  formSection,
  isDialogOpen,
  setIsDialogOpen,
  onSave,
  onDiscard,
  setCurrSkills,
}: UseDraftProps<T>) => {
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [confirmExitDialog, setConfirmExitDialog] = useState(false);
  const draftChecked = useRef(false);
  const restoredDraft = useRef<T | null>(null);

  const saveDraft = (values: any) => {
    const existingDraft: Record<string, any> = JSON.parse(
      localStorage.getItem('DEHIX_DRAFT') || '{}',
    );

    if (existingDraft[formSection]) {
      restoredDraft.current = existingDraft[formSection];
    }

    const hasValues = Object.values(values).some(
      (value) => value !== undefined && value !== '',
    );

    if (hasValues) {
      existingDraft[formSection] = values;
      localStorage.setItem('DEHIX_DRAFT', JSON.stringify(existingDraft));

      toast({
        title: 'Draft Saved',
        description: `Your ${formSection} draft has been saved.`,
        duration: 1500,
      });
    }
  };

  useEffect(() => {
    if (isDialogOpen && !draftChecked.current) {
      const draft = JSON.parse(localStorage.getItem('DEHIX_DRAFT') || '{}');
      if (draft && draft[formSection]) {
        setShowDraftDialog(true);
      }
      draftChecked.current = true;
    }
  }, [isDialogOpen, formSection]);

  const loadDraft = () => {
    const draft = JSON.parse(localStorage.getItem('DEHIX_DRAFT') || '{}');

    if (draft && draft[formSection]) {
      // Remove undefined values
      Object.keys(draft[formSection]).forEach((key) => {
        if (draft[formSection][key] === undefined) {
          delete draft[formSection][key];
        }
      });

      // Ignore verificationStatus from projects
      if (formSection === 'projects') {
        delete draft[formSection].verificationStatus;

        if (Array.isArray(draft[formSection].techUsed)) {
          setCurrSkills(draft[formSection].techUsed);
        }
      }

      const hasData = Object.entries(draft[formSection]).some(
        ([, value]) =>
          value !== '' &&
          value !== undefined &&
          !(Array.isArray(value) && value.length === 0),
      );

      if (hasData) {
        form.reset(draft[formSection]);
        restoredDraft.current = draft[formSection];

        toast({
          title: 'Draft Loaded',
          description: `Your ${formSection} draft has been restored.`,
          duration: 1500,
        });
      }

      setShowDraftDialog(false);
    }
  };

  const discardDraft = () => {
    const draft = JSON.parse(localStorage.getItem('DEHIX_DRAFT') || '{}');
    if (draft) {
      delete draft[formSection];
      if (Object.keys(draft).length === 0) {
        localStorage.removeItem('DEHIX_DRAFT');
      } else {
        localStorage.setItem('DEHIX_DRAFT', JSON.stringify(draft));
      }
    }
    form.reset();
    toast({
      title: 'Draft Discarded',
      description: `Your ${formSection} draft has been discarded.`,
      duration: 1500,
    });
    setShowDraftDialog(false);
    if (onDiscard) {
      onDiscard();
    }
  };

  const handleSaveAndClose = () => {
    const formValues = form.getValues();
    saveDraft(formValues);
    toast({
      title: 'Draft Saved',
      description: 'Your draft has been saved.',
      duration: 1500,
    });

    restoredDraft.current = formValues;

    setConfirmExitDialog(false);
    setIsDialogOpen(false);
    if (onSave) {
      onSave(formValues);
    }
  };

  const handleDiscardAndClose = () => {
    const existingDraft: Record<string, any> = JSON.parse(
      localStorage.getItem('DEHIX_DRAFT') || '{}',
    );

    delete existingDraft[formSection];

    if (Object.keys(existingDraft).length === 0) {
      localStorage.removeItem('DEHIX_DRAFT');
    } else {
      localStorage.setItem('DEHIX_DRAFT', JSON.stringify(existingDraft));
    }

    toast({
      title: 'Draft Discarded',
      description: `Your ${formSection} draft has been discarded.`,
      duration: 1500,
    });
    setConfirmExitDialog(false);
    setIsDialogOpen(false);
    if (onDiscard) {
      onDiscard();
    }
  };

  const trimObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return {};
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value,
      ]),
    );
  };

  const handleDialogClose = () => {
    if (!isDialogOpen) return;
    const currentValues = form.getValues() || {};
    const draftValues = restoredDraft.current || {};
    console.log(restoredDraft.current);
    const trimmedCurrent = trimObject(currentValues);
    const trimmedDraft = trimObject(draftValues);

    const hasChanges = Object.entries(trimmedDraft).some(([key, value]) => {
      const currentValue = trimmedCurrent[key];

      if (Array.isArray(value) && Array.isArray(currentValue)) {
        return JSON.stringify(value) !== JSON.stringify(currentValue);
      }

      return value !== currentValue;
    });

    const hasNonEmptyValues = Object.entries(trimmedCurrent).some(
      ([key, value]) =>
        key !== 'verificationStatus' &&
        value !== undefined &&
        value !== '' &&
        trimmedDraft[key] === undefined,
    );

    if (!hasChanges && !hasNonEmptyValues) {
      setIsDialogOpen(false);
      return;
    }

    if (
      Object.values(trimmedCurrent).some((value) => value?.toString().trim())
    ) {
      setConfirmExitDialog(true);
    } else {
      setIsDialogOpen(false);
    }
  };

  return {
    showDraftDialog,
    setShowDraftDialog,
    confirmExitDialog,
    setConfirmExitDialog,
    loadDraft,
    discardDraft,
    handleSaveAndClose,
    handleDiscardAndClose,
    handleDialogClose,
    saveDraft,
  };
};

export default useDraft;
