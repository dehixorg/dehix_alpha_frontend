import React from 'react';
import {
  LinkedinIcon,
  GithubIcon,
  Globe,
  ShieldAlert,
  LucideVerified,
} from 'lucide-react';
import Image from 'next/image';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { UserProfile } from '@/app/business/freelancerProfile/[freelancer_id]/page';

interface ProfileInfoProps {
  user: UserProfile;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  // Destructure KYC status from the user object
  const { status } = user.kyc;
  const render = () => {
    switch (status) {
      case 'VERIFIED':
        return (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <HoverCard>
              <HoverCardTrigger asChild>
                <LucideVerified className="w-6 cursor-pointer h-6" />
              </HoverCardTrigger>
              <HoverCardContent className="w-auto h-auto py-1 cursor-pointer">
                Verified
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-red-600">
            <HoverCard>
              <HoverCardTrigger asChild>
                <ShieldAlert className="w-6 cursor-pointer h-6" />
              </HoverCardTrigger>
              <HoverCardContent className="w-auto h-auto py-1 cursor-pointer">
                Not-verified
              </HoverCardContent>
            </HoverCard>
          </div>
        );
    }
  };

  return (
    <section className="flex flex-col md:flex-row items-center gap-6 rounded-2xl p-6">
      <div className="flex items-center gap-12">
        <Image
          src={user?.profilePic || 'https://via.placeholder.com/150'}
          alt="Profile"
          width={144}
          height={144}
          className="h-40 w-40 ml-6 mx-auto mb-4 rounded-full border-4 border-white hover:border-white transition-all duration-300"
        />
        <div className="text-left">
          <div className="flex justify-center items-center gap-2">
            <h2 className="text-2xl font-semibold">
              {`${user?.firstName} ${user?.lastName}`}{' '}
            </h2>
            <p className=" flex justify-center items-center">{render()}</p>
          </div>
          <p>{user?.description || 'No Job Title Provided'}</p>
        </div>
      </div>
      <div className="flex mt-2 justify-center md:justify-start items-center gap-8 md:gap-10">
        <HoverCard>
          {user?.linkedin && (
            <>
              <a href={user.linkedin}>
                <HoverCardTrigger asChild>
                  <LinkedinIcon
                    className="cursor-pointer hover:text-gray-400"
                    size={20}
                  />
                </HoverCardTrigger>
                <HoverCardContent className="w-auto h-auto py-1 cursor-pointer">
                  <p>LinkedIn</p>
                </HoverCardContent>
              </a>
            </>
          )}
        </HoverCard>
        <HoverCard>
          {user?.githubLink && (
            <>
              <a href={user.githubLink}>
                <HoverCardTrigger asChild>
                  <GithubIcon
                    className="cursor-pointer hover:text-gray-400"
                    size={20}
                  />
                </HoverCardTrigger>
                <HoverCardContent className="w-auto h-auto py-1 cursor-pointer">
                  <p>Github</p>
                </HoverCardContent>
              </a>
            </>
          )}
        </HoverCard>
        <HoverCard>
          {user?.personalWebsite && (
            <a href={user.personalWebsite}>
              <HoverCardTrigger asChild>
                <Globe
                  className="cursor-pointer hover:text-gray-500"
                  size={20}
                />
              </HoverCardTrigger>
              <HoverCardContent className="w-auto h-auto py-1 cursor-pointer">
                <p>Portfolio</p>
              </HoverCardContent>
            </a>
          )}
        </HoverCard>
      </div>
    </section>
  );
};

export default ProfileInfo;
