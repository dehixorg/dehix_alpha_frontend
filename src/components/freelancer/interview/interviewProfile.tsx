import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';

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

const InterviewProfile: React.FC = () => {
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

  useEffect(() => {
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

    fetchVerifiedAttributes();
  }, []);

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
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
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
