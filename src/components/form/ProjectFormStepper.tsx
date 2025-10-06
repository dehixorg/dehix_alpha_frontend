import React from 'react';
import { Briefcase, UserCog, CheckCircle2 } from 'lucide-react';

type Props = {
  currentStep: any; // parent controls the enum/type
  onProjectClick: () => void;
  onProfileClick: () => void;
  className?: string;
};

const ProjectFormStepper: React.FC<Props> = ({
  currentStep,
  onProjectClick,
  onProfileClick,
  className,
}) => {
  return (
    <div className={className || ''}>
      <nav aria-label="Form steps">
        <ol className="flex items-center w-full flex-wrap gap-2">
          {/* Step 1 */}
          <li
            className={`min-w-0 flex items-center gap-2 sm:gap-3 ${
              currentStep === 0 || currentStep === 1
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <button
              type="button"
              onClick={onProjectClick}
              className="group flex items-center gap-2 sm:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background rounded-md"
              aria-current={currentStep === 0 ? 'step' : undefined}
            >
              <div
                className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center border ${
                  currentStep === 0 || currentStep === 1
                    ? 'bg-primary/10 border-primary'
                    : 'border-border'
                }`}
              >
                {currentStep === 1 ? (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium truncate">
                Project Info
              </span>
            </button>
          </li>

          {/* Responsive connector that grows */}
          <li
            aria-hidden
            className="flex-1 min-w-[48px] sm:min-w-[96px] lg:min-w-[144px]"
          >
            <div
              className={`h-px w-full ${currentStep === 1 ? 'bg-primary/40' : 'bg-border'}`}
            />
          </li>

          {/* Step 2 */}
          <li
            className={`min-w-0 flex items-center gap-2 sm:gap-3 ${
              currentStep === 1
                ? 'text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background'
                : 'text-muted-foreground'
            }`}
          >
            <button
              type="button"
              onClick={onProfileClick}
              className="group flex items-center gap-2 sm:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background rounded-md"
              aria-current={currentStep === 1 ? 'step' : undefined}
            >
              <div
                className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center border ${
                  currentStep === 1
                    ? 'bg-primary/10 border-primary'
                    : 'border-border'
                }`}
              >
                <UserCog className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-xs sm:text-sm font-medium truncate">
                Profiles & Budget
              </span>
            </button>
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default ProjectFormStepper;
