import React from 'react';
import { Briefcase, UserCog, DollarSign, CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type Props = {
  currentStep: number;
  onProjectClick: () => void;
  onProfileClick: () => void;
  onBudgetClick: () => void;
  className?: string;
};

const ProjectFormStepper: React.FC<Props> = ({
  currentStep,
  onProjectClick,
  onProfileClick,
  onBudgetClick,
  className,
}) => {
  const steps = [
    { id: 0, title: 'Project Info', icon: Briefcase, onClick: onProjectClick },
    {
      id: 1,
      title: 'Profiles',
      icon: UserCog,
      onClick: onProfileClick,
    },
    {
      id: 2,
      title: 'Budget',
      icon: DollarSign,
      onClick: onBudgetClick,
    },
  ] as const;

  const activeStep = steps.find((s) => s.id === currentStep) ?? steps[0];
  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={className || ''}>
      <div className="w-full">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                Step {currentStep + 1} of {steps.length}
              </Badge>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight truncate">
                {activeStep.title}
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete the steps below to publish your project.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Progress value={progressValue} className="h-2" />
        </div>

        <nav aria-label="Project steps" className="mt-4">
          <ol className="grid grid-cols-3 gap-2">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isDone = currentStep > step.id;

              return (
                <li
                  key={step.id}
                  aria-current={isActive ? 'step' : undefined}
                  className={cn(
                    'rounded-lg border px-2 py-2 sm:px-3 sm:py-3 transition-colors',
                    isActive
                      ? 'border-primary/40 bg-primary/5 shadow-sm'
                      : isDone
                        ? 'border-border bg-muted/30'
                        : 'border-border bg-background hover:bg-muted/20',
                  )}
                >
                  <button
                    type="button"
                    onClick={step.onClick}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          'h-7 w-7 sm:h-8 sm:w-8 rounded-full border flex items-center justify-center shrink-0',
                          isDone
                            ? 'bg-primary border-primary text-primary-foreground'
                            : isActive
                              ? 'border-primary text-primary'
                              : 'border-muted-foreground/30 text-muted-foreground',
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            'text-xs sm:text-sm font-medium truncate',
                            isActive
                              ? 'text-foreground'
                              : 'text-muted-foreground',
                          )}
                          title={step.title}
                        >
                          {step.title}
                        </p>
                        <p className="hidden sm:block text-[11px] text-muted-foreground truncate">
                          {step.id === 0
                            ? 'Basics & requirements'
                            : step.id === 1
                              ? 'Roles & requirements'
                              : 'Fixed or hourly'}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default ProjectFormStepper;
