import React from 'react';
import { FileText, Check, X, User, CreditCard, CircleDot } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

import StatItem from './StatItem';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { getStatusBadge } from '@/utils/statusBadge';
import type { Task } from '@/utils/types/Milestone';

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  isFreelancer: boolean;
  onApproveUpdatePermission?: (taskId: string) => Promise<boolean>;
  onRejectUpdatePermission?: (taskId: string) => Promise<boolean>;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  task,
  open,
  onClose,
  isFreelancer,
  onApproveUpdatePermission,
  onRejectUpdatePermission,
}) => {
  if (!task) return null;
  const { className: dialogStatusBadgeStyle } = getStatusBadge(
    (task as any).taskStatus,
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-xl mx-auto w-[92vw] sm:max-w-xl shadow-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="truncate" title={task.title}>
                {task.title}
              </span>
              {task.taskStatus !== 'SUMMARY' && (
                <Badge
                  className={`${dialogStatusBadgeStyle} rounded-full px-3 py-1`}
                >
                  {task.taskStatus}
                </Badge>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription className="text-sm mt-1 leading-relaxed">
          {task.taskStatus !== 'SUMMARY' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatItem
                  icon={<CircleDot className="h-4 w-4" />}
                  label="Task status"
                  value={task?.taskStatus}
                  color="blue"
                />
                <StatItem
                  icon={<User className="h-4 w-4" />}
                  label="Freelancer"
                  value={task?.freelancers[0]?.freelancerName || '—'}
                  color="green"
                />
                <StatItem
                  icon={<CreditCard className="h-4 w-4" />}
                  label="Payment status"
                  value={task?.freelancers[0]?.paymentStatus || '—'}
                  color="amber"
                />
              </div>
            </>
          )}

          {!isFreelancer && task.taskStatus !== 'SUMMARY' && (
            <div className="mt-5">
              <h4 className="font-semibold mb-2">Update Task Request</h4>
              {task.freelancers.some(
                (f: any) =>
                  f.updatePermissionFreelancer && !f.updatePermissionBusiness,
              ) ? (
                <Table className="border border-border bg-card rounded-md">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-left">
                        Freelancer
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {task.freelancers
                      .filter(
                        (f: any) =>
                          f.updatePermissionFreelancer &&
                          !f.updatePermissionBusiness,
                      )
                      .map((freelancer: any, index: number) => (
                        <TableRow
                          key={index}
                          className="border-b last:border-0"
                        >
                          <TableCell className="py-2 px-4">
                            {freelancer.freelancerName || 'Freelancer'}
                          </TableCell>
                          <TableCell className="py-2 px-4">
                            <div className="flex items-center justify-center gap-3">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="secondary"
                                      size="icon"
                                      className="h-8 w-8"
                                      aria-label="Approve update permission"
                                      onClick={async () => {
                                        if (onApproveUpdatePermission) {
                                          const ok =
                                            await onApproveUpdatePermission(
                                              task._id,
                                            );
                                          if (ok) {
                                            (task as any).freelancers = (
                                              task.freelancers || []
                                            ).filter(
                                              (f: any) =>
                                                f._id !== freelancer._id,
                                            );
                                          }
                                        }
                                      }}
                                    >
                                      <Check className="text-green-600 w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Approve</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      aria-label="Reject update permission"
                                      onClick={async () => {
                                        if (onRejectUpdatePermission) {
                                          const ok =
                                            await onRejectUpdatePermission(
                                              task._id,
                                            );
                                          if (ok) {
                                            (task as any).freelancers = (
                                              task.freelancers || []
                                            ).filter(
                                              (f: any) =>
                                                f._id !== freelancer._id,
                                            );
                                          }
                                        }
                                      }}
                                    >
                                      <X className="text-red-600 w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Reject</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No update permission requests.
                </p>
              )}
            </div>
          )}

          <div className="mt-5">
            <h4 className="font-semibold mb-1">Description</h4>
            <p className="mb-2 whitespace-pre-wrap">
              {task.summary || 'No description provided.'}
            </p>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;
