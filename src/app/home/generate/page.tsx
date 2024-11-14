'use client';
import React from 'react';
import { saveAs } from 'file-saver';

import CreateSchemaForm from '@/components/form/generateForm';
import { Button } from '@/components/ui/button';
import { generateModel } from '@/generators/fastify/model';
import { generateConstants } from '@/generators/fastify/constant';

const Generator: React.FC = () => {
  const handleClick = () => {
    // Example usage
    // const exampleFields = {
    //   firstName: { type: String, required: true },
    //   lastName: { type: String, required: true },
    //   email: { type: String, required: true, unique: true },
    //   age: { type: Number, default: 18 },
    //   isActive: { type: Boolean, default: 'uuidv4' },
    // };

    // const modelName = 'User';

    // // Generate the model file content
    // const { fileContent, fileName } = generateModel(modelName, exampleFields);
    // Example usage:
    const endpoints = [
      {
        label: 'ADMIN',
        value: '/admin',
        group: 'Base endpoint for admin operations',
      },
      {
        label: 'ADMIN_ID',
        value: '/create',
        group: 'Endpoint for admin creation',
      },
      {
        label: 'DELETE_ADMIN_BY_ID',
        value: '/:admin_id',
        group: 'Endpoint for deleting an admin',
      },
      { label: 'ADMIN_ALL', value: '/all', group: 'Fetching all admins' },
      {
        label: 'ADMIN_BY_ID',
        value: '/:admin_id',
        group: 'Fetching specific admin',
      },
      {
        label: 'GET_ALL_ADMIN',
        value: '/all/admin',
        group: 'Fetching all admins',
      },
      {
        label: 'ADMIN_ALL_SKILL',
        value: '/admin/all/domains',
        group: 'Fetching admin skills',
      },
    ];

    const { fileContent, fileName } = generateConstants(endpoints);

    const blob = new Blob([fileContent], { type: 'text/plain' });
    saveAs(blob, fileName);
  };
  return (
    <div className="container text-center max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-5xl font-bold">Generate Schema</h1>
      <Button
        className="my-5"
        onClick={() => {
          handleClick();
        }}
      >
        RUNNER
      </Button>
      <CreateSchemaForm />
    </div>
  );
};

export default Generator;
