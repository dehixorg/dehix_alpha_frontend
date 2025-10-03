import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { notifySuccess } from '@/utils/toastMessage';

interface UseDraftProps<T extends Record<string, any>> {
  form?: ReturnType<typeof useForm<T>>;
  formSection?: string | null | undefined;
  isDialogOpen?: boolean;
  setIsDialogOpen?: (open: boolean) => void;
  onSave?: (values: T | undefined) => void;
  onDiscard?: () => void;
  setCurrSkills?: any;
}

const useDraft = <T extends Record<string, any>>({
  form,
  formSection = '',
  isDialogOpen,
  setIsDialogOpen,
  onSave,
  onDiscard,
  setCurrSkills,
}: UseDraftProps<T>) => {
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [confirmExitDialog, setConfirmExitDialog] = useState(false);
  const draftChecked = useRef(false);
  const restoredDraft = useRef<T | null | undefined>(null);

  const saveDraft = (values: any) => {
    if (!formSection) return; // Prevent undefined indexing

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

      notifySuccess(`Your ${formSection} draft has been saved.`, 'Draft Saved');
    }
  };

  useEffect(() => {
    if (isDialogOpen && !draftChecked.current && formSection) {
      const draft = JSON.parse(localStorage.getItem('DEHIX_DRAFT') || '{}');
      if (draft && draft[formSection]) {
        setShowDraftDialog(true);
      }
      draftChecked.current = true;
    }
  }, [isDialogOpen, formSection]);

  const loadDraft = () => {
    if (!formSection) return;

    const draft = JSON.parse(localStorage.getItem('DEHIX_DRAFT') || '{}');

    if (draft && draft[formSection]) {
      Object.keys(draft[formSection]).forEach((key) => {
        if (draft[formSection][key] === undefined) {
          delete draft[formSection][key];
        }
      });

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

      if (hasData && form) {
        form.reset(draft[formSection]);
        restoredDraft.current = draft[formSection];

        notifySuccess(
          `Your ${formSection} draft has been restored.`,
          'Draft Loaded',
        );
      }

      setShowDraftDialog(false);
    }
  };

  const discardDraft = () => {
    if (!formSection) return;

    const draft = JSON.parse(localStorage.getItem('DEHIX_DRAFT') || '{}');
    if (draft) {
      delete draft[formSection];
      if (Object.keys(draft).length === 0) {
        localStorage.removeItem('DEHIX_DRAFT');
      } else {
        localStorage.setItem('DEHIX_DRAFT', JSON.stringify(draft));
      }
    }
    form?.reset();
    notifySuccess(
      `Your ${formSection} draft has been discarded.`,
      'Draft Discarded',
    );
    setShowDraftDialog(false);
    if (onDiscard) {
      onDiscard();
    }
  };

  const handleSaveAndClose = () => {
    if (!formSection) return;

    const formValues = form?.getValues();
    saveDraft(formValues);
    notifySuccess('Your draft has been saved.', 'Draft Saved');

    restoredDraft.current = formValues;

    setConfirmExitDialog(false);
    if (setIsDialogOpen) {
      setIsDialogOpen(false);
    }
    if (onSave) {
      onSave(formValues);
    }
  };

  const handleDiscardAndClose = () => {
    if (!formSection) return;

    const existingDraft: Record<string, any> = JSON.parse(
      localStorage.getItem('DEHIX_DRAFT') || '{}',
    );

    delete existingDraft[formSection];

    if (Object.keys(existingDraft).length === 0) {
      localStorage.removeItem('DEHIX_DRAFT');
    } else {
      localStorage.setItem('DEHIX_DRAFT', JSON.stringify(existingDraft));
    }

    notifySuccess(
      `Your ${formSection} draft has been discarded.`,
      'Draft Discarded',
    );
    setConfirmExitDialog(false);
    if (setIsDialogOpen) {
      setIsDialogOpen(false);
    }
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
    if (!isDialogOpen || !formSection) return;

    const currentValues = form?.getValues() || {};
    const draftValues = restoredDraft.current || {};
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

    if (!hasChanges && !hasNonEmptyValues && setIsDialogOpen) {
      setIsDialogOpen(false);
      return;
    }

    if (
      Object.values(trimmedCurrent).some((value) => value?.toString().trim())
    ) {
      setConfirmExitDialog(true);
    } else {
      if (setIsDialogOpen) {
        setIsDialogOpen(false);
      }
    }
  };

  const hasOtherValues = useCallback((formValues: any) => {
    return Object.entries(formValues).some(
      ([key, value]) =>
        key !== 'profiles' &&
        ((Array.isArray(value) &&
          value.length > 0 &&
          (key === 'urls'
            ? value.some((item: any) => item?.value?.trim() !== '')
            : true)) ||
          (typeof value === 'string' && value.trim() !== '') ||
          (typeof value === 'number' && !isNaN(value))),
    );
  }, []);

  const hasProfiles = useCallback((profiles: any[] | undefined) => {
    return profiles?.some((profile: any) =>
      Object.values(profile).some(
        (value) =>
          (Array.isArray(value) && value.length > 0) ||
          (typeof value === 'string' && value.trim() !== '') ||
          (typeof value === 'number' && !isNaN(value)),
      ),
    );
  }, []);

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
    hasOtherValues,
    hasProfiles,
  };
};

export default useDraft;
