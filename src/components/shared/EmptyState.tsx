import type React from 'react';

interface EmptyStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/30 ${className}`}
    >
      {icon && (
        <div className="w-48 h-48 bg-muted/20 rounded-full flex items-center justify-center mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      )}
      {actions}
    </div>
  );
};

export default EmptyState;
