/* eslint-disable prettier/prettier */
'use client';
import React from 'react';
import { User, MapPin, ExternalLink, XCircle, RefreshCw } from 'lucide-react';

import TalentLayout from '@/components/marketComponents/TalentLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import axios from 'axios';

import { axiosInstance } from '@/lib/axiosinstance';

import{useEffect, useState} from 'react';

const RejectedTalentsPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [rejectedTalents, setRejectedTalents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const buisnessId = user?.uid;

  useEffect(() =>{
    async function fetchRejectedTalents() {
      try{
        setIsLoading(true);
        const response = await axiosInstance.get(`/business/hire-dehixtalent/free/${buisnessId}/rejected`);
        console.log(response); 
        setRejectedTalents(response.data.data);
      }catch(error){
        console.error('Error fetching rejected talents:', error);
      } finally {
        setIsLoading(false);
      }
    }
    if(buisnessId){
      fetchRejectedTalents();
    }
  },[buisnessId]);

  return (
    <TalentLayout activeTab="rejected">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Rejected Talents</h2>
        <span className="text-muted-foreground">
          Showing {rejectedTalents.length} results
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          rejectedTalents.length > 0 ? (
            rejectedTalents.map((talent) => (
              <Card key={talent._id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <Avatar className="h-12 w-12">
                        {/* <AvatarImage src={talent.avatar} alt={talent.firstName} /> */}
                        <AvatarFallback>
                          {talent.firstName.slice(0, 1).toUpperCase()}
                          {talent.lastName.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{talent.firstName} {talent.lastName}</CardTitle>
                        <CardDescription>{talent.role}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Rejected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{talent.workExperience} years of experience</span>
                    </div>
                    {/* Location is not available in the provided data */}
                    {/* <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{talent.location}</span>
                    </div> */}
                    {/* Reason for rejection is not available in the provided data */}
                    {/* <div className="flex items-center gap-2 text-sm text-destructive">
                      <XCircle className="h-4 w-4" />
                      <span>Reason: {talent.reason}</span>
                    </div> */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {talent.skills.map((skill) => (
                        <Badge key={skill._id} variant="secondary">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  {/* Rejected date is not available in the provided data */}
                  {/* <div className="text-sm text-muted-foreground">
                    Rejected on {talent.rejectedDate}
                  </div> */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Reconsider
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Profile
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div>No rejected talents found.</div>
          )
        )}
      </div>
    </TalentLayout>
  );
};

export default RejectedTalentsPage;