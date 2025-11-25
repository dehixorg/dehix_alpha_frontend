import { Check, CircleAlert } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthProps {
  passwordStrength: {
    label: string;
    color: string;
    level: number;
    rules: {
      label: string;
      passed: boolean;
    }[];
  };
}

export function getPasswordStrength(password: string) {
  const rules = [
    { label: 'At least 8 characters', test: (pw: string) => pw.length >= 8 },
    { label: 'Contains a number', test: (pw: string) => /[0-9]/.test(pw) },
    {
      label: 'Contains a special character',
      test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    },
    {
      label: 'Contains an uppercase letter',
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: 'Contains a lowercase letter',
      test: (pw: string) => /[a-z]/.test(pw),
    },
  ];
  const passed = rules.map((rule) => rule.test(password));
  const level = passed.filter(Boolean).length;
  let color = 'bg-red-500';
  let label = 'Weak';
  if (level >= 2) {
    color = 'bg-yellow-400';
    label = 'Medium';
  }
  if (level >= 3) {
    color = 'bg-blue-400';
    label = 'Good';
  }
  if (level >= 4) {
    color = 'bg-green-500';
    label = 'Strong';
  }
  return {
    label,
    color,
    level,
    rules: rules.map((r, i) => ({ label: r.label, passed: passed[i] })),
  };
}

export default function PasswordStrength({
  passwordStrength,
}: PasswordStrengthProps) {
  const progressValue = (passwordStrength.level / 4) * 100;

  const strengthTone =
    passwordStrength.label === 'Weak'
      ? 'text-red-500'
      : passwordStrength.label === 'Medium'
        ? 'text-yellow-500'
        : passwordStrength.label === 'Good'
          ? 'text-blue-500'
          : 'text-green-600';

  return (
    <div className="mt-2 space-y-2">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mt-2">
        <Progress value={progressValue} className="h-1.5 flex-1 bg-muted" />
        <Badge
          variant="outline"
          className={`border-0 bg-muted text-[10px] font-medium px-2 py-0.5 ${strengthTone}`}
        >
          {passwordStrength.label || 'Password'}
        </Badge>
      </div>
      {/* Checklist */}
      <ul className="mt-1 space-y-1">
        {passwordStrength.rules.map((rule, idx) => (
          <li
            key={idx}
            className="flex items-center gap-2 text-[11px] text-muted-foreground"
          >
            {rule.passed ? (
              <Check className="text-green-500 w-3.5 h-3.5" />
            ) : (
              <CircleAlert className="text-red-500 w-3.5 h-3.5" />
            )}
            <span className={rule.passed ? 'text-emerald-600' : 'text-red-500'}>
              {rule.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
