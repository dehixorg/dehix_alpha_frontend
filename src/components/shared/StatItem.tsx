import React from 'react';

export interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}

const StatItem: React.FC<StatItemProps> = ({
  icon,
  label,
  value,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-3 rounded-md border bg-muted/20 px-3 py-2 ${className}`}
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
};

export default StatItem;
