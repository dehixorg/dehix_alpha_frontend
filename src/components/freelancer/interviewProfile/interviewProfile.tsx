import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Button } from '@/components/ui/button';
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

  const [openSkillApplyDialog, setOpenSkillApplyDialog] = useState(false);
  const [openDomainApplyDialog, setOpenDomainApplyDialog] = useState(false);

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

  return (
    <>
      <div className="flex flex-col gap-4 p-2 sm:px-6 sm:py-0 md:gap-8  pt-2 pl-4 sm:pt-4 sm:pl-6 md:pt-6 md:pl-8 min-h-screen relative">
        <div className="w-full relative border border-gray-200 rounded-xl shadow-sm p-4">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold">
                Dehix Talent & Interviewer
              </h2>

              <div className="flex flex-wrap gap-3">
                <Dialog
                  open={openSkillApplyDialog}
                  onOpenChange={setOpenSkillApplyDialog}
                >
                  <Button
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setOpenSkillApplyDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Apply to be Interviewer (Skill)
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply to be Interviewer - Skill</DialogTitle>
                      <DialogDescription>
                        Select a verified skill and set your per interview
                        charge.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600">
                          Skill
                        </p>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                          value={selectedSkillAttrId}
                          onChange={(e) =>
                            setSelectedSkillAttrId(e.target.value)
                          }
                          disabled={interviewerLoading}
                        >
                          <option value="">Select a verified skill</option>
                          {verifiedAttributes
                            .filter(
                              (a) =>
                                a.type === 'SKILL' &&
                                String(a.interviewerStatus).toUpperCase() ===
                                  'NOT_APPLIED',
                            )
                            .map((a) => (
                              <option key={a._id} value={a._id}>
                                {a.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600">
                          Per Interview Charge (₹)
                        </p>
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
                    <DialogFooter className="mt-4">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleApplyAsInterviewer(
                            selectedSkillAttrId,
                            Number(skillCharge),
                          );
                          setOpenSkillApplyDialog(false);
                        }}
                        disabled={interviewerLoading}
                      >
                        Apply
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={openDomainApplyDialog}
                  onOpenChange={setOpenDomainApplyDialog}
                >
                  <Button
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setOpenDomainApplyDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Apply as Interviewer (Domain)
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply as Interviewer - Domain</DialogTitle>
                      <DialogDescription>
                        Select a verified domain and set your per interview
                        charge.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600">
                          Domain
                        </p>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                          value={selectedDomainAttrId}
                          onChange={(e) =>
                            setSelectedDomainAttrId(e.target.value)
                          }
                          disabled={interviewerLoading}
                        >
                          <option value="">Select a verified domain</option>
                          {verifiedAttributes
                            .filter(
                              (a) =>
                                a.type === 'DOMAIN' &&
                                String(a.interviewerStatus).toUpperCase() ===
                                  'NOT_APPLIED',
                            )
                            .map((a) => (
                              <option key={a._id} value={a._id}>
                                {a.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600">
                          Per Interview Charge (₹)
                        </p>
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
                    <DialogFooter className="mt-4">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleApplyAsInterviewer(
                            selectedDomainAttrId,
                            Number(domainCharge),
                          );
                          setOpenDomainApplyDialog(false);
                        }}
                        disabled={interviewerLoading}
                      >
                        Apply
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="w-full overflow-x-auto mt-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-200 hover:bg-gray-300 dark:bg-[#09090B] dark:hover:bg-[#09090B]">
                    <TableHead className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Type
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Level
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Experience
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Interviewer Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Per Interview Charge
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Active
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviewerLoading
                    ? [...Array(3)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-6 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-10" />
                          </TableCell>
                        </TableRow>
                      ))
                    : verifiedAttributes
                        .filter(
                          (a) =>
                            String(a.interviewerStatus).toUpperCase() !==
                            'NOT_APPLIED',
                        )
                        .map((a) => (
                          <TableRow key={a._id}>
                            <TableCell className="text-xs font-medium text-gray-800 dark:text-gray-100">
                              {a.type}
                            </TableCell>
                            <TableCell className="text-xs font-medium text-gray-800 dark:text-gray-100">
                              {a.name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${statusOutlineClasses(a.level)}`}
                              >
                                {a.level?.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-gray-700 dark:text-gray-300">
                              {a.experience ? `${a.experience} yrs` : ''}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${statusOutlineClasses(a.interviewerStatus)}`}
                              >
                                {String(a.interviewerStatus).toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-gray-700 dark:text-gray-300">
                              {a.perInterviewCharge ?? '-'}
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={
                                  String(
                                    a.interviewerActiveStatus,
                                  ).toUpperCase() === 'ACTIVE'
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
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewProfile;
