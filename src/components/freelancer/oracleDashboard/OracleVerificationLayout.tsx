'use client';

import React from 'react';

interface OracleVerificationLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const OracleVerificationLayout: React.FC<OracleVerificationLayoutProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="bg-muted-foreground/20 dark:bg-muted/20 rounded-xl border shadow-sm overflow-hidden">
      <div className="flex flex-col gap-2 p-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
};

export default OracleVerificationLayout;
