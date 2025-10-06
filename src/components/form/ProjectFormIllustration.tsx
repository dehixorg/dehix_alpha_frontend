import React from 'react';
import Image from 'next/image';
import { Lightbulb, Rocket, Palette } from 'lucide-react';

const ProjectFormIllustration: React.FC = () => {
  return (
    <div className="relative hidden lg:flex lg:flex-col lg:items-center lg:justify-center rounded-xl p-6">
      <div className="relative w-64 h-64">
        <Image
          src="/undraw_preferences-popup_cru5.svg"
          alt="Create your project"
          fill
          sizes="256px"
          className="object-contain p-6 drop-shadow-sm"
          priority
        />
      </div>
      <div className="mt-6 w-full space-y-3 text-center">
        <h3 className="text-lg font-semibold">Bring your idea to life</h3>
        <p className="text-sm text-muted-foreground px-2">
          Define project info, add profiles, set a budget and publish.
        </p>
        <ul className="mt-2 grid grid-cols-1 gap-2 text-left text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            Clear two-step flow for faster setup
          </li>
          <li className="flex items-center gap-2">
            <Palette className="h-3.5 w-3.5 text-primary" />
            Organized roles and skills with tags
          </li>
          <li className="flex items-center gap-2">
            <Rocket className="h-3.5 w-3.5 text-primary" />
            Smart budget inputs with live preview
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectFormIllustration;
