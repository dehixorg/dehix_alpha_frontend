import type React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  Icon?: LucideIcon;
  icon?: React.ReactNode; // For backward compatibility
  actions?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  Icon,
  icon,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/30 ${className}`}
    >
      {Icon ? (
        <div className="w-48 h-48 bg-muted/20 rounded-full flex items-center justify-center mb-6">
          <Icon className="w-24 h-24 text-muted-foreground/50" />
        </div>
      ) : icon ? (
        <div className="mb-6">{icon}</div>
      ) : null}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      )}
      {actions}
    </div>
  );
};

export default EmptyState;
