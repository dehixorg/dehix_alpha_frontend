import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

      {/* Contact Information */}
      <CardContent className="space-y-8">
        <div className="flex justify-between space-x-12">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-bold">Contact Information</h3>
            <p className="text-sm">
              Email:{' '}
              <a href={`mailto:${profileData.email}`} className="text-blue-600">
                {profileData.email}
              </a>
            </p>
            <p className="text-sm">Phone: {profileData.phone}</p>
          </div>

          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-bold">Company Information</h3>
            <p className="text-sm">Company Size: {profileData.companySize}</p>
          </div>
        </div>

        {/* Links Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold">Links</h3>
          <p className="text-sm">
            LinkedIn:{' '}
            <a href={profileData.linkedin} className="text-blue-600">
              {profileData.linkedin}
            </a>
          </p>
          <p className="text-sm">
            Website:{' '}
            <a href={profileData.personalWebsite} className="text-blue-600">
              {profileData.personalWebsite}
            </a>
          </p>
        </div>
      </CardContent>

      {/* Stats Section */}
      <CardContent className="space-y-2">
        <h3 className="text-lg font-bold">Stats</h3>
        <p className="text-sm">Connects: {profileData.connects}</p>
        <p className="text-sm">Projects: {profileData.ProjectList.length}</p>
      </CardContent>
    </Card>
  );
};

export default BusinessProfile;
