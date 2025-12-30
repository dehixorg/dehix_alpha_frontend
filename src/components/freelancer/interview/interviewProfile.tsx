import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarPlus,
  CheckCircle,
  Clock,
  Plus,
  Sparkles,
  Settings2,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { axiosInstance } from '@/lib/axiosinstance';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import EmptyState from '@/components/shared/EmptyState';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { RootState } from '@/lib/store';

const InterviewProfile: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);

  type DayKey = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

  type AvailabilityRange = {
    start: string;
    end: string;
  };

  type InterviewerAvailability = {
    timezone: string;
    weekly: Record<DayKey, AvailabilityRange[]>;
    slotDurationMinutes: number;
    bufferMinutes: number;
    minNoticeMinutes: number;
    updatedAt?: string;
  };

  interface VerifiedAttribute {
    _id: string;
    type: 'SKILL' | 'DOMAIN' | string;
    type_id: string;
    name: string;
    experience: number;
    level: string;
    freelancerProfileId: string;
    dehixTalentStatus: string;
    talentMonthlyPay?: number;
    talentActiveStatus?: 'ACTIVE' | 'INACTIVE' | string;
    interviewerStatus:
      | 'NOT_APPLIED'
      | 'PENDING'
      | 'APPROVED'
      | 'REJECTED'
      | string;
    perInterviewCharge?: number;
    interviewerActiveStatus?: 'ACTIVE' | 'INACTIVE' | string;
  }

  const [verifiedAttributes, setVerifiedAttributes] = useState<
    VerifiedAttribute[]
  >([]);
  const [interviewerLoading, setInterviewerLoading] = useState<boolean>(false);

  const [selectedSkillAttrId, setSelectedSkillAttrId] = useState('');
  const [skillCharge, setSkillCharge] = useState('');
  const [selectedDomainAttrId, setSelectedDomainAttrId] = useState('');
  const [domainCharge, setDomainCharge] = useState('');

  const [openApplyDialog, setOpenApplyDialog] = useState(false);
  const [applyTab, setApplyTab] = useState<'skill' | 'domain'>('skill');

  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [scheduleAttribute, setScheduleAttribute] =
    useState<VerifiedAttribute | null>(null);
  const [interviewDateLocal, setInterviewDateLocal] = useState('');
  const [interviewDescription, setInterviewDescription] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [openAvailabilitySheet, setOpenAvailabilitySheet] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);

  const emptyWeekly = useMemo((): InterviewerAvailability['weekly'] => {
    return {
      MON: [],
      TUE: [],
      WED: [],
      THU: [],
      FRI: [],
      SAT: [],
      SUN: [],
    };
  }, []);

  const [availability, setAvailability] = useState<InterviewerAvailability>({
    timezone: '',
    weekly: emptyWeekly,
    slotDurationMinutes: 30,
    bufferMinutes: 0,
    minNoticeMinutes: 0,
  });

  const dayOrder: DayKey[] = useMemo(
    () => ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    [],
  );

  const dayLabel: Record<DayKey, string> = useMemo(
    () => ({
      MON: 'Mon',
      TUE: 'Tue',
      WED: 'Wed',
      THU: 'Thu',
      FRI: 'Fri',
      SAT: 'Sat',
      SUN: 'Sun',
    }),
    [],
  );

  const detectTimezone = () => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {
      return '';
    }
  };

  const fetchAvailability = async () => {
    setAvailabilityLoading(true);
    try {
      const res = await axiosInstance.get(
        '/freelancer/interviewer/availability',
      );
      const data: InterviewerAvailability | undefined = res?.data?.data;

      if (!data) {
        setAvailability((prev) => ({
          ...prev,
          timezone: detectTimezone() || prev.timezone,
        }));
        return;
      }

      setAvailability({
        timezone: String(data.timezone || detectTimezone() || ''),
        weekly: {
          MON: Array.isArray(data.weekly?.MON) ? data.weekly.MON : [],
          TUE: Array.isArray(data.weekly?.TUE) ? data.weekly.TUE : [],
          WED: Array.isArray(data.weekly?.WED) ? data.weekly.WED : [],
          THU: Array.isArray(data.weekly?.THU) ? data.weekly.THU : [],
          FRI: Array.isArray(data.weekly?.FRI) ? data.weekly.FRI : [],
          SAT: Array.isArray(data.weekly?.SAT) ? data.weekly.SAT : [],
          SUN: Array.isArray(data.weekly?.SUN) ? data.weekly.SUN : [],
        },
        slotDurationMinutes: Number(data.slotDurationMinutes || 30),
        bufferMinutes: Number(data.bufferMinutes || 0),
        minNoticeMinutes: Number(data.minNoticeMinutes || 0),
        updatedAt: data.updatedAt,
      });
    } catch (error: any) {
      console.error('Error fetching availability:', error);
      notifyError(
        'Failed to load availability. Please try again later.',
        'Error',
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const upsertSingleRangeForDay = (
    day: DayKey,
    patch: Partial<AvailabilityRange>,
  ) => {
    setAvailability((prev) => {
      const current = prev.weekly[day]?.[0] || { start: '10:00', end: '19:00' };
      const nextRange: AvailabilityRange = {
        start: patch.start ?? current.start,
        end: patch.end ?? current.end,
      };

      return {
        ...prev,
        weekly: {
          ...prev.weekly,
          [day]: [nextRange],
        },
      };
    });
  };

  const toggleDayEnabled = (day: DayKey, enabled: boolean) => {
    setAvailability((prev) => {
      if (!enabled) {
        return {
          ...prev,
          weekly: {
            ...prev.weekly,
            [day]: [],
          },
        };
      }

      const existing = prev.weekly[day]?.[0];
      return {
        ...prev,
        weekly: {
          ...prev.weekly,
          [day]: [existing || { start: '10:00', end: '19:00' }],
        },
      };
    });
  };

  const validateAvailability = () => {
    for (const day of dayOrder) {
      const range = availability.weekly?.[day]?.[0];
      if (!range) continue;
      if (!range.start || !range.end) {
        return `Please select start and end time for ${dayLabel[day]}.`;
      }
      if (range.start >= range.end) {
        return `Start time must be before end time for ${dayLabel[day]}.`;
      }
    }
    if (
      !availability.slotDurationMinutes ||
      availability.slotDurationMinutes <= 0
    ) {
      return 'Slot duration must be greater than 0.';
    }
    if (availability.bufferMinutes < 0 || availability.minNoticeMinutes < 0) {
      return 'Buffer and minimum notice must be 0 or more.';
    }
    return null;
  };

  const saveAvailability = async () => {
    const validationError = validateAvailability();
    if (validationError) {
      notifyError(validationError, 'Error');
      return;
    }

    setAvailabilitySaving(true);
    try {
      const timezone = detectTimezone() || availability.timezone || 'UTC';

      const weekly: InterviewerAvailability['weekly'] = {
        MON: Array.isArray(availability.weekly?.MON) ? availability.weekly.MON : [],
        TUE: Array.isArray(availability.weekly?.TUE) ? availability.weekly.TUE : [],
        WED: Array.isArray(availability.weekly?.WED) ? availability.weekly.WED : [],
        THU: Array.isArray(availability.weekly?.THU) ? availability.weekly.THU : [],
        FRI: Array.isArray(availability.weekly?.FRI) ? availability.weekly.FRI : [],
        SAT: Array.isArray(availability.weekly?.SAT) ? availability.weekly.SAT : [],
        SUN: Array.isArray(availability.weekly?.SUN) ? availability.weekly.SUN : [],
      };

      const payload: InterviewerAvailability = {
        timezone,
        weekly,
        slotDurationMinutes: Number(availability.slotDurationMinutes),
        bufferMinutes: Number(availability.bufferMinutes),
        minNoticeMinutes: Number(availability.minNoticeMinutes),
      };

      await axiosInstance.put('/freelancer/interviewer/availability', payload);
      notifySuccess('Availability updated successfully.', 'Success');
      setOpenAvailabilitySheet(false);
    } catch (error: any) {
      console.error('Error saving availability:', error);
      const message =
        error?.response?.data?.message ||
        'Failed to update availability. Please try again later.';
      notifyError(message, 'Error');
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const visibleAttributes = useMemo(
    () =>
      verifiedAttributes.filter(
        (a) => String(a.interviewerStatus).toUpperCase() !== 'NOT_APPLIED',
      ),
    [verifiedAttributes],
  );

  const eligibleSkillAttributes = useMemo(
    () =>
      verifiedAttributes.filter(
        (a) =>
          a.type === 'SKILL' &&
          String(a.interviewerStatus).toUpperCase() === 'NOT_APPLIED',
      ),
    [verifiedAttributes],
  );

  const eligibleDomainAttributes = useMemo(
    () =>
      verifiedAttributes.filter(
        (a) =>
          a.type === 'DOMAIN' &&
          String(a.interviewerStatus).toUpperCase() === 'NOT_APPLIED',
      ),
    [verifiedAttributes],
  );

  const fetchVerifiedAttributes = async () => {
    setInterviewerLoading(true);
    try {
      const res = await axiosInstance.get(
        `/freelancer/dehix-talent/attributes/verified`,
      );

      const items: VerifiedAttribute[] = res?.data?.data || [];
      setVerifiedAttributes(items);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setVerifiedAttributes([]);
      } else {
        console.error('Error fetching verified attributes:', error);
        notifyError(
          'Failed to fetch verified Dehix talent attributes. Please try again later.',
          'Error',
        );
      }
    } finally {
      setInterviewerLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleApplyAsInterviewer = async (
    attributeId: string,
    perInterviewChargeValue: number,
  ) => {
    if (
      !attributeId ||
      !perInterviewChargeValue ||
      perInterviewChargeValue <= 0
    ) {
      notifyError(
        'Please select an attribute and enter a valid interview fee.',
        'Error',
      );
      return;
    }

    setInterviewerLoading(true);
    try {
      const res = await axiosInstance.post(
        `/freelancer/attributes/${attributeId}/interviewer/apply`,
        {
          perInterviewCharge: perInterviewChargeValue,
        },
      );

      const updated: VerifiedAttribute | undefined = res?.data?.data;

      if (updated?._id) {
        setVerifiedAttributes((prev) =>
          prev.map((attr) =>
            attr._id === updated._id ? { ...attr, ...updated } : attr,
          ),
        );
      }

      notifySuccess(
        'Your interviewer application has been submitted.',
        'Success',
      );
    } catch (error: any) {
      console.error('Error applying as interviewer:', error);
      const message =
        error?.response?.data?.message ||
        'Failed to apply as interviewer. Please try again later.';
      notifyError(message, 'Error');
    } finally {
      setInterviewerLoading(false);
    }
  };

  const handleToggleInterviewerActive = async (
    attribute: VerifiedAttribute,
  ) => {
    const { _id } = attribute;
    if (!_id) return;

    const prevStatus = attribute.interviewerActiveStatus;

    setVerifiedAttributes((prev) =>
      prev.map((a) =>
        a._id === _id
          ? {
              ...a,
              interviewerActiveStatus:
                a.interviewerActiveStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
            }
          : a,
      ),
    );

    try {
      const res = await axiosInstance.put(
        `/freelancer/attributes/${_id}/interviewer/active-status`,
      );

      const updated: VerifiedAttribute | undefined = res?.data?.data;
      if (updated?._id) {
        setVerifiedAttributes((prev) =>
          prev.map((a) => (a._id === updated._id ? { ...a, ...updated } : a)),
        );
      }
    } catch (error: any) {
      console.error('Error toggling interviewer active status:', error);
      notifyError('Failed to update interviewer active status.', 'Error');

      setVerifiedAttributes((prev) =>
        prev.map((a) =>
          a._id === _id ? { ...a, interviewerActiveStatus: prevStatus } : a,
        ),
      );
    }
  };

  const openApply = () => {
    setOpenApplyDialog(true);
  };

  const openAvailability = async () => {
    setOpenAvailabilitySheet(true);
  };

  const openSchedule = (attribute: VerifiedAttribute) => {
    setScheduleAttribute(attribute);
    setInterviewDateLocal('');
    setInterviewDescription('');
    setOpenScheduleDialog(true);
  };

  const handleScheduleInterview = async () => {
    const attribute = scheduleAttribute;
    const intervieweeId = String(user?.uid || '').trim();
    const creatorId = String(attribute?.freelancerProfileId || '').trim();
    const talentType = String(attribute?.type || '').toUpperCase();

    if (!attribute?._id) {
      notifyError('Missing attribute data.', 'Error');
      return;
    }

    if (!intervieweeId) {
      notifyError('Please login to schedule an interview.', 'Error');
      return;
    }

    if (!creatorId) {
      notifyError('Missing creator id for scheduling.', 'Error');
      return;
    }

    if (!attribute.type_id) {
      notifyError('Missing talent id.', 'Error');
      return;
    }

    if (talentType !== 'SKILL' && talentType !== 'DOMAIN') {
      notifyError('Missing or invalid talent type.', 'Error');
      return;
    }

    if (!interviewDateLocal) {
      notifyError('Please select an interview date.', 'Error');
      return;
    }

    const interviewDate = new Date(interviewDateLocal);
    if (Number.isNaN(interviewDate.getTime())) {
      notifyError('Invalid interview date.', 'Error');
      return;
    }

    setScheduling(true);
    try {
      await axiosInstance.post('/interview', {
        creatorId,
        intervieweeId,
        interviewType: 'INTERVIEWER',
        talentType,
        talentId: attribute.type_id,
        interviewDate: interviewDate.toISOString(),
        description: interviewDescription?.trim() || undefined,
      });

      setVerifiedAttributes((prev) =>
        prev.map((a) =>
          a._id === attribute._id ? { ...a, interviewerStatus: 'APPLIED' } : a,
        ),
      );

      notifySuccess('Interview scheduled successfully.', 'Success');
      setOpenScheduleDialog(false);
      setRefreshKey((k) => k + 1);
    } catch (error: any) {
      console.error('Error scheduling interview:', error);
      const message =
        error?.response?.data?.message ||
        'Failed to schedule interview. Please try again later.';
      notifyError(message, 'Error');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3 border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl">
              Dehix Talent & Interviewer
            </CardTitle>
            <CardDescription>
              Apply as an interviewer for your verified skills/domains and
              manage your availability.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="flex items-center gap-2"
              onClick={openApply}
              disabled={interviewerLoading}
            >
              <Plus className="h-4 w-4" />
              Apply as interviewer
            </Button>

            <Sheet
              open={openAvailabilitySheet}
              onOpenChange={(open) => {
                setOpenAvailabilitySheet(open);
                if (open) {
                  fetchAvailability();
                }
              }}
            >
              <SheetTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={openAvailability}
                  type="button"
                >
                  <Settings2 className="h-4 w-4" />
                  Manage availability
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
                <SheetHeader className="px-6 pt-6">
                  <SheetTitle>Availability settings</SheetTitle>
                  <SheetDescription>
                    Configure when you are available for interviews.
                  </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6 py-4">
                  <div className="grid gap-6">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                          <Label>Slot duration (min)</Label>
                          <Input
                            type="number"
                            min={1}
                            value={availability.slotDurationMinutes}
                            onChange={(e) =>
                              setAvailability((prev) => ({
                                ...prev,
                                slotDurationMinutes: Number(e.target.value),
                              }))
                            }
                            disabled={availabilityLoading || availabilitySaving}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Buffer (min)</Label>
                          <Input
                            type="number"
                            min={0}
                            value={availability.bufferMinutes}
                            onChange={(e) =>
                              setAvailability((prev) => ({
                                ...prev,
                                bufferMinutes: Number(e.target.value),
                              }))
                            }
                            disabled={availabilityLoading || availabilitySaving}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Min notice (min)</Label>
                          <Input
                            type="number"
                            min={0}
                            value={availability.minNoticeMinutes}
                            onChange={(e) =>
                              setAvailability((prev) => ({
                                ...prev,
                                minNoticeMinutes: Number(e.target.value),
                              }))
                            }
                            disabled={availabilityLoading || availabilitySaving}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="text-sm font-medium">Weekly</div>

                      <div className="grid gap-3">
                        {dayOrder.map((day) => {
                          const range = availability.weekly?.[day]?.[0];
                          const enabled = Boolean(range);
                          return (
                            <div
                              key={day}
                              className="rounded-lg border p-3 grid gap-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-medium">
                                  {dayLabel[day]}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs text-muted-foreground">
                                    Available
                                  </Label>
                                  <Switch
                                    checked={enabled}
                                    onCheckedChange={(val) =>
                                      toggleDayEnabled(day, Boolean(val))
                                    }
                                    disabled={
                                      availabilityLoading || availabilitySaving
                                    }
                                  />
                                </div>
                              </div>

                              {enabled ? (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="grid gap-2">
                                    <Label className="text-xs">Start</Label>
                                    <Input
                                      type="time"
                                      value={range?.start || ''}
                                      onChange={(e) =>
                                        upsertSingleRangeForDay(day, {
                                          start: e.target.value,
                                        })
                                      }
                                      disabled={
                                        availabilityLoading ||
                                        availabilitySaving
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label className="text-xs">End</Label>
                                    <Input
                                      type="time"
                                      value={range?.end || ''}
                                      onChange={(e) =>
                                        upsertSingleRangeForDay(day, {
                                          end: e.target.value,
                                        })
                                      }
                                      disabled={
                                        availabilityLoading ||
                                        availabilitySaving
                                      }
                                    />
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <SheetFooter className="border-t px-6 py-4 flex-row gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setOpenAvailabilitySheet(false)}
                    disabled={availabilitySaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={saveAvailability}
                    disabled={availabilityLoading || availabilitySaving}
                  >
                    {availabilitySaving ? 'Saving...' : 'Save'}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Dialog open={openScheduleDialog} onOpenChange={setOpenScheduleDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule interview</DialogTitle>
              <DialogDescription>
                Choose an interview date and optionally add a description.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Talent</Label>
                <div className="text-sm text-muted-foreground">
                  {scheduleAttribute
                    ? `${scheduleAttribute.name} (${String(scheduleAttribute.type).toUpperCase()})`
                    : '-'}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="interviewDate">Interview date</Label>
                <Input
                  id="interviewDate"
                  type="datetime-local"
                  value={interviewDateLocal}
                  onChange={(e) => setInterviewDateLocal(e.target.value)}
                  disabled={scheduling}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={interviewDescription}
                  onChange={(e) => setInterviewDescription(e.target.value)}
                  placeholder="Add any notes for the interview (optional)"
                  disabled={scheduling}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenScheduleDialog(false)}
                disabled={scheduling}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleScheduleInterview}
                disabled={scheduling || !interviewDateLocal}
              >
                {scheduling ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openApplyDialog} onOpenChange={setOpenApplyDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Apply as interviewer</DialogTitle>
              <DialogDescription>
                Choose skill or domain and set your per interview charge.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={applyTab} onValueChange={(v) => setApplyTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="skill">Skill</TabsTrigger>
                <TabsTrigger value="domain">Domain</TabsTrigger>
              </TabsList>

              <TabsContent value="skill" className="mt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Skill</Label>
                    <Select
                      value={selectedSkillAttrId}
                      onValueChange={setSelectedSkillAttrId}
                      disabled={interviewerLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleSkillAttributes.length === 0 ? (
                          <SelectItem value="__none__" disabled>
                            No eligible skills found
                          </SelectItem>
                        ) : (
                          eligibleSkillAttributes.map((a) => (
                            <SelectItem key={a._id} value={a._id}>
                              {a.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Per interview charge (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={skillCharge}
                      onChange={(e) => setSkillCharge(e.target.value)}
                      placeholder="Enter amount"
                      disabled={interviewerLoading}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="domain" className="mt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Domain</Label>
                    <Select
                      value={selectedDomainAttrId}
                      onValueChange={setSelectedDomainAttrId}
                      disabled={interviewerLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleDomainAttributes.length === 0 ? (
                          <SelectItem value="__none__" disabled>
                            No eligible domains found
                          </SelectItem>
                        ) : (
                          eligibleDomainAttributes.map((a) => (
                            <SelectItem key={a._id} value={a._id}>
                              {a.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Per interview charge (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={domainCharge}
                      onChange={(e) => setDomainCharge(e.target.value)}
                      placeholder="Enter amount"
                      disabled={interviewerLoading}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                size="sm"
                onClick={async () => {
                  if (applyTab === 'skill') {
                    await handleApplyAsInterviewer(
                      selectedSkillAttrId,
                      Number(skillCharge),
                    );
                  } else {
                    await handleApplyAsInterviewer(
                      selectedDomainAttrId,
                      Number(domainCharge),
                    );
                  }
                  setOpenApplyDialog(false);
                }}
                disabled={
                  interviewerLoading ||
                  (applyTab === 'skill'
                    ? !selectedSkillAttrId || selectedSkillAttrId === '__none__'
                    : !selectedDomainAttrId ||
                      selectedDomainAttrId === '__none__')
                }
              >
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {interviewerLoading ? (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead className="text-xs font-semibold">Type</TableHead>
                  <TableHead className="text-xs font-semibold">Name</TableHead>
                  <TableHead className="text-xs font-semibold">Level</TableHead>
                  <TableHead className="text-xs font-semibold">
                    Experience
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Interviewer Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Per Interview Charge
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Active
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-10" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : visibleAttributes.length === 0 ? (
          <EmptyState
            title={
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                No interviewer applications yet
              </span>
            }
            description="Apply as an interviewer for a verified skill or domain to get started."
            icon={
              <div className="grid place-items-center">
                <div className="h-28 w-28 rounded-full bg-gradient-to-b from-primary/15 to-transparent" />
              </div>
            }
            actions={
              <Button size="sm" onClick={openApply}>
                Apply as interviewer
              </Button>
            }
            className="bg-transparent"
          />
        ) : (
          <ScrollArea className="w-full">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 hover:bg-muted/60">
                    <TableHead className="text-xs font-semibold">
                      Type
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Level
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Experience
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Interviewer Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Per Interview Charge
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Active
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-center">
                      Interview
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleAttributes.map((a) => (
                    <TableRow key={a._id}>
                      <TableCell className="text-xs font-medium">
                        {a.type}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {a.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${statusOutlineClasses(a.level)}`}
                        >
                          {a.level?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {a.experience ? `${a.experience} yrs` : ''}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${statusOutlineClasses(a.interviewerStatus)}`}
                        >
                          {String(a.interviewerStatus).toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {a.perInterviewCharge ?? '-'}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={
                            String(a.interviewerActiveStatus).toUpperCase() ===
                            'ACTIVE'
                          }
                          onCheckedChange={() =>
                            handleToggleInterviewerActive(a)
                          }
                          disabled={
                            String(a.dehixTalentStatus).toUpperCase() !==
                            'APPROVED'
                          }
                          aria-label="Toggle interviewer active status"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {(() => {
                          const s = String(a.interviewerStatus).toUpperCase();
                          if (s === 'APPROVED') {
                            return (
                              <CheckCircle
                                className="inline-block h-4 w-4 text-emerald-600"
                                aria-label="Approved"
                              />
                            );
                          }

                          if (s === 'APPLIED') {
                            return (
                              <Clock
                                className="inline-block h-4 w-4 text-amber-600"
                                aria-label="Applied"
                              />
                            );
                          }

                          return (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => openSchedule(a)}
                              aria-label="Schedule interview"
                            >
                              <CalendarPlus className="h-4 w-4" />
                            </Button>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default InterviewProfile;
