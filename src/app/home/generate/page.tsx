'use client';
import React from 'react';
import { saveAs } from 'file-saver';

import CreateSchemaForm from '@/components/form/generateForm';
import { Button } from '@/components/ui/button';
import generateDao from '@/generators/fastify/dao.generator';

const Generator: React.FC = () => {
  const handleClick = async () => {
    try {
      const { fileName, fileContent } = await generateDao({
        modelName: 'Freelancer',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'email', type: 'string' },
          { name: 'fullName', type: 'string' },
          { name: 'skills', type: 'any[]' },
          { name: 'experience', type: 'number' },
        ],
        customMethods: [
          `async getFreelancerByEmail(email: string) {
          return this.model.findOne({ email });
        }`,
          `async addSkill(freelancerId: string, skill: any) {
          return this.model.findByIdAndUpdate(freelancerId, { $push: { skills: skill } });
        }`,
        ],
      });

      // Ensure that fileContent is a valid string and then create the Blob
      if (fileContent && typeof fileContent === 'string') {
        const blob = new Blob([fileContent], { type: 'text/plain' });
        saveAs(blob, fileName);
      } else {
        console.error('Error: File content is not valid.');
      }
    } catch (error) {
      console.error('Error generating DAO:', error);
    }
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
