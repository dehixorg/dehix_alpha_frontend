import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Mail, Phone, Linkedin, Earth } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { axiosInstance } from '@/lib/axiosinstance';

interface ProfileData {
  _id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  companySize: string;
  email: string;
  phone: string;
  position: string;
  linkedin: string;
  personalWebsite: string;
  connects: number;
  ProjectList: string[];
  Appliedcandidates: string[];
  hirefreelancer: {
    freelancer: string;
    status: string;
    _id: string;
  }[];
  profileImage?: string; // Adding profile image field
}

const BusinessProfile: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const { business_id } = useParams<{ business_id: string }>();
  useEffect(() => {
    if (business_id) {
      const fetchData = async () => {
        try {
          const response = await axiosInstance.get(`/business/${business_id}`);
          setProfileData(response.data);
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      };
      fetchData();
    }
  }, [business_id]);

  if (!profileData) return <p>Loading...</p>;
  return (
    <Card className="w-full h-full max-w-4xl mx-auto p-6">
      {/* Header with Profile Picture and Basic Info */}
      <CardHeader className="flex items-center space-x-6">
        <Avatar>
          <AvatarImage
            src={profileData.profileImage || '/default-image.png'}
            alt={profileData.companyName}
          />
          <AvatarFallback>
            {profileData.firstName[0]}
            {profileData.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-1">
          <CardTitle className="text-3xl font-bold">
            {profileData.companyName}
          </CardTitle>
          <p className="text-lg font-semibold">{profileData.position}</p>
          <p className="text-sm">{`${profileData.firstName} ${profileData.lastName}`}</p>
        </div>
      </CardHeader>
      <CardContent className="flex justify-around items-center pb-4 mb-4">
        <div className="text-center">
          <p className="text-xl font-semibold">{profileData.connects}</p>
          <p className="text-xs ">Connects</p>
        </div>
        <Separator orientation="vertical" className="h-6 bg-gray-400" />
        <div className="text-center">
          <p className="text-xl font-semibold">
            {profileData.ProjectList.length}
          </p>
          <p className="text-xs ">Projects</p>
        </div>
        <Separator orientation="vertical" className="h-6 bg-gray-400" />
        <div className="text-center">
          <p className="text-xl font-semibold">{profileData.companySize}</p>
          <p className="text-xs ">Company Size</p>
        </div>
      </CardContent>

      {/* Contact Information */}
      <CardContent className="space-y-8">
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-bold">Contact Information</h3>
          <p className="text-sm">
            <div className="flex items-center">
              <Mail className="mr-1 h-5" /> Email:{' '}
              <a
                href={`mailto:${profileData.email}`}
                className="text-blue-600 ml-1"
              >
                {profileData.email}
              </a>
            </div>
          </p>

          <p className="text-sm">
            <div className="flex items-center">
              <Phone className="mr-1 h-5" />
              Phone: {profileData.phone}
            </div>
          </p>

          <p className="text-sm">
            <div className="flex items-center">
              <Linkedin className="mr-1 h-5" />
              LinkedIn:{' '}
              <a href={profileData.linkedin} className="text-blue-600 ml-1">
                {profileData.linkedin}
              </a>
            </div>
          </p>
          <p className="text-sm">
            <div className="flex items-center">
              <Earth className="mr-1 h-5" />
              Website:{' '}
              <a
                href={profileData.personalWebsite}
                className="text-blue-600 ml-1"
              >
                {profileData.personalWebsite}
              </a>
            </div>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessProfile;
