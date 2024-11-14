import React from 'react';

import CreateSchemaForm from '@/components/form/generateForm';

const Generator: React.FC = () => {
  return (
    <div className="container text-center max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-5xl font-bold">Generate Schema</h1>
      <CreateSchemaForm />
    </div>
  );
};

export default Generator;
