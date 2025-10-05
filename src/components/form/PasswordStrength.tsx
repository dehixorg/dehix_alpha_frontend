import { Check, X } from 'lucide-react';

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
  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Progress Bar */}
      <div className="flex w-40 h-2 rounded overflow-hidden">
        <div
          className={`flex-1 ${
            passwordStrength.level >= 1 ? passwordStrength.color : 'bg-gray-200'
          } transition-all`}
        ></div>
        <div
          className={`flex-1 ${
            passwordStrength.level >= 2 ? passwordStrength.color : 'bg-gray-200'
          } transition-all`}
        ></div>
        <div
          className={`flex-1 ${
            passwordStrength.level >= 3 ? passwordStrength.color : 'bg-gray-200'
          } transition-all`}
        ></div>
        <div
          className={`flex-1 ${
            passwordStrength.level >= 4 ? passwordStrength.color : 'bg-gray-200'
          } transition-all`}
        ></div>
      </div>
      <span
        className={`text-xs font-semibold ${
          passwordStrength.label === 'Weak'
            ? 'text-red-500'
            : passwordStrength.label === 'Medium'
              ? 'text-yellow-500'
              : passwordStrength.label === 'Good'
                ? 'text-blue-500'
                : 'text-green-600'
        }`}
      >
        {passwordStrength.label}
      </span>
      {/* Checklist */}
      <ul className="mt-1 space-y-1">
        {passwordStrength.rules.map((rule, idx) => (
          <li key={idx} className="flex items-center gap-2 text-xs">
            {rule.passed ? (
              <Check className="text-green-500 w-4 h-4" />
            ) : (
              <X className="text-red-500 w-4 h-4" />
            )}
            <span className={rule.passed ? 'text-green-600' : 'text-red-500'}>
              {rule.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
