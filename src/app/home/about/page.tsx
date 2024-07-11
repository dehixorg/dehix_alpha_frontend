import React from 'react';

const AboutFreelancingPlatform: React.FC = () => {
  return (
    <div className="container text-center max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-5xl text-bold">About Our Freelancing Platform</h1>
      <p className="mb-16 mt-6 text-gray-500">
        Our platform connects you with talented freelancers from around the
        world, empowering you to bring your projects to life. We&apos;re
        dedicated to providing a seamless experience and helping you find the
        perfect fit for your needs.
      </p>
      <div className="flex flex-row justify-center items-center text-cyan-400">
        <div className="rounded-lg bg-[#1a1a1a] p-6 text-left">
          <svg
            className="h-8 w-8 "
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
            <path d="m15 5 4 4"></path>
          </svg>
          <h3 className="mt-4 text-xl font-bold ">Content Creation</h3>
          <p className="mt-2 text-base text-white">
            Bring your ideas to life with our talented content creators.
          </p>
        </div>
        <div className="rounded-lg bg-[#1a1a1a] p-6 ml-6 text-left">
          <svg
            className="h-8 w-8 "
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <h3 className="mt-4 text-xl font-bold ">Web Development</h3>
          <p className="mt-2 text-base text-white">
            Elevate your online presence with our expert web developers.
          </p>
        </div>
        <div className="rounded-lg bg-[#1a1a1a] p-6 ml-6 text-left">
          <svg
            className="h-8 w-8 "
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4 7 4 4 20 4 20 7"></polyline>
            <line x1="9" x2="15" y1="20" y2="20"></line>
            <line x1="12" x2="12" y1="4" y2="20"></line>
          </svg>
          <h3 className="mt-4 text-xl font-bold ">Graphic Design</h3>
          <p className="mt-2 text-base text-white">
            Bring your brand to life with our talented graphic designers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutFreelancingPlatform;
