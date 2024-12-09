import React, { useRef } from 'react';
import { Separator } from '@/components/ui/separator'; 

interface ResumeProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  skills: { name: string; level?: string }[];
  domains: { name: string; level?: string }[];
  description: string;
}


const ResumeTemplate: React.FC<ResumeProps> = ({
  firstName,
  lastName,
  email,
  phone,
  role,
  skills,
  description,
}) => {
  const resumeRef = useRef<HTMLDivElement>(null);

  return (
    <div className="font-sans bg-gray-500 py-5">
      <div className="max-w-4xl mx-auto bg-gray-300 shadow-md border border-gray-300 rounded-md p-8" ref={resumeRef}>
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {firstName} {lastName}
          </h1>
          <p className="text-lg text-gray-600">{role}</p>
          <div className="mt-2 space-y-1 text-gray-500">
            <p>{phone}</p>
            <p>{email}</p>
            <p>www.yourdomainname.com</p>
            <p>Country, City, MO 56347</p>
          </div>
        </div>

        <Separator className="my-1 mt-4 " />

        <section>
          <h2 className="text-lg font-bold text-gray-700">ABOUT ME</h2>
          <p className="text-gray-600 mt-2 leading-relaxed">{description}</p>
        </section>

       
        <Separator className="my-1 mt-4 " />

        <section>
          <h2 className="text-lg font-bold text-gray-700">EXPERIENCE</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">WEBSITE DESIGNER</h3>
              <p className="text-sm text-gray-600">Company Name Here - USA | 2015 - Present</p>
              <p className="text-gray-600 mt-1">
                Porttitor amet massa Donec pro the lictor dolor odssd nisdi, ofsd pretium feugiat fringilla.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">UI AND UX DESIGNER</h3>
              <p className="text-sm text-gray-600">Company Name Here - USA | 2013 - 2015</p>
              <p className="text-gray-600 mt-1">
                Porttitor amet massa Donec pro the lictor dolor odssd nisdi, feugiat fringilla.
              </p>
            </div>
          </div>
        </section>

       
        <Separator className="my-1 mt-4" />

        <section>
          <h2 className="text-lg font-bold text-gray-700">EDUCATION</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">MASTER OF SOCIAL SCIENCE</h3>
              <p className="text-sm text-gray-600">Your College Name Here - USA | 2015 - Present</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">BACHELOR OF ARTS</h3>
              <p className="text-sm text-gray-600">Your College Name Here - USA | 2013 - 2015</p>
            </div>
          </div>
        </section>

        <Separator className="my-1 mt-4" />

        <section>
          <h2 className="text-lg font-bold text-gray-700">EXPERTISE</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-600 mt-2">
            {skills.map((skill, index) => (
              <li key={index}>{skill.name} {skill.level && `(${skill.level})`}</li>
            ))}
          </ul>
        </section>

        <Separator className="my-1 mt-4" />

        <section>
          <h2 className="text-lg font-bold text-gray-700">ACHIEVEMENT</h2>
          <p className="text-gray-600 mt-2">
            LOGO DESIGN AWARDS - International Graphic Design Awards | 2016
          </p>
        </section>

  
        <Separator className="my-1 mt-4" />

      
        <section>
          <h2 className="text-lg font-bold text-gray-700">REFERENCE</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">SHUSHANT SINGH</h3>
              <p className="text-sm text-gray-600">CEO Director | P: +555-4545-5699</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">SAMIR SEHKHAR</h3>
              <p className="text-sm text-gray-600">Account Manager | P: +555-4545-5699</p>
            </div>
          </div>
        </section>
      </div>
</div>
  );
};

export default ResumeTemplate;

