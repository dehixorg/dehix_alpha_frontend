interface Props {
  status: 'verified' | 'disputed' | 'revoked';
  className?: string;
}

const STATUS_CONFIG = {
  verified: {
    label: 'Verified',
    className:
      'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
  disputed: {
    label: 'Disputed',
    className:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  revoked: {
    label: 'Revoked',
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
};

export function StatusBadge({ status, className = '' }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.verified;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.className} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}
