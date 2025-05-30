import React from 'react';

import { Card, CardDescription, CardHeader } from '@/components/ui/card';

const Page = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-lg p-6 shadow-lg">
        <CardHeader>
          <p className="text-center text-xl font-semibold">
            Page Under Development
          </p>
        </CardHeader>
        <CardDescription>
          <p className="text-center text-gray-600">
            We&apos;re working hard to bring this page to you. Stay tuned for
            updates!
          </p>
        </CardDescription>
      </Card>
    </div>
  );
};

export default Page;
