import React from 'react';
import Image from 'next/image';

const ProjectFormIllustration: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center rounded-xl p-6 bg-transparent">
      <div className="relative w-64 h-64">
        <Image
          src="/undraw_preferences-popup_cru5.svg"
          alt="Create your project"
          fill
          sizes="256px"
          className="object-contain"
          priority
        />
      </div>
      <div className="mt-6 space-y-2 text-center">
        <h3 className="text-lg font-semibold">Bring your idea to life</h3>
        <p className="text-sm text-muted-foreground">
          Define project info, add roles, set a budget and publish.
        </p>
      </div>
    </div>
  );
};

export default ProjectFormIllustration;
