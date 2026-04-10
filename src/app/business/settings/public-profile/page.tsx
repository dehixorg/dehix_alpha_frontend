'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Globe,
  Copy,
  Share2,
  ExternalLink,
  CheckCheck,
  Code,
  Mail,
  Linkedin,
} from 'lucide-react';

import BusinessSettingsLayout from '@/components/layout/BusinessSettingsLayout';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BusinessProfile {
  _id: string;
  userName?: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  linkedin?: string;
  personalWebsite?: string;
  ProjectList: any[];
}

export default function BusinessPublicProfileSettings() {
  const user = useSelector((state: RootState) => state.user);
  const [profileData, setProfileData] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/public/business/${user.uid}`);
        setProfileData(res.data);
        // Build share URL from userName (companyName for businesses)
        const uname = res.data.userName || res.data.companyName || user.uid;
        setPublicUrl(
          typeof window !== 'undefined'
            ? `${window.location.origin}/business-profile/${uname}`
            : `/business-profile/${uname}`,
        );
      } catch {
        notifyError('Failed to load profile data.', 'Error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.uid]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      notifySuccess('Link copied to clipboard!', 'Copied');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      notifyError('Failed to copy link.', 'Error');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${profileData?.companyName ?? 'Business'} — Dehix`,
          text: 'Check out this business profile on Dehix!',
          url: publicUrl,
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <BusinessSettingsLayout
      active="Public Profile"
      activeMenu="Public Profile"
      breadcrumbItems={[
        { label: 'Settings', link: '#' },
        { label: 'Public Profile', link: '#' },
      ]}
      isKycCheck={false}
      contentClassName="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8"
    >
      <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 overflow-hidden">
        {/* Share Link Card */}
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary shrink-0" />
              <CardTitle className="text-base sm:text-lg">
                Your Public Profile Link
              </CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Anyone with this link can view your business profile — no login
              required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-3 sm:px-6">
            <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-muted border text-xs sm:text-sm font-mono text-muted-foreground overflow-hidden">
              <Globe className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 min-w-0 truncate">{publicUrl}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="default"
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <CheckCheck className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant="ghost"
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                onClick={() =>
                  window.open(publicUrl, '_blank', 'noopener,noreferrer')
                }
              >
                <ExternalLink className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Preview */}
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Profile Preview — how visitors see your profile
          </p>

          {/* Profile Header */}
          <Card className="w-full bg-black text-white p-2 sm:p-4 shadow-md mb-4 overflow-hidden">
            <Card className="p-3 sm:p-8 flex flex-col sm:flex-row items-center rounded-lg gap-3 sm:gap-6">
              {loading ? (
                <Skeleton className="w-16 h-16 sm:w-24 sm:h-24 rounded-full" />
              ) : (
                <Avatar className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-primary shadow-lg flex-shrink-0">
                  <AvatarImage
                    src="/default-avatar.png"
                    alt="Business"
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {`${profileData?.firstName?.[0] ?? 'B'}${profileData?.lastName?.[0] ?? 'U'}`}
                  </AvatarFallback>
                </Avatar>
              )}
              {loading ? (
                <div className="space-y-2 text-center sm:text-left w-full">
                  <Skeleton className="h-6 sm:h-7 w-3/4 sm:w-48 mx-auto sm:mx-0" />
                  <Skeleton className="h-4 w-1/2 sm:w-32 mx-auto sm:mx-0" />
                </div>
              ) : (
                <div className="text-center sm:text-left min-w-0 w-full">
                  <h1 className="text-lg sm:text-2xl font-bold text-white break-words">
                    {profileData?.firstName} {profileData?.lastName}
                  </h1>
                  <p className="text-white/70 text-xs sm:text-base break-words">
                    {profileData?.companyName}
                  </p>
                </div>
              )}
            </Card>

            {/* Projects preview */}
            <Card className="w-full shadow-lg mt-3 sm:mt-4 overflow-hidden">
              <CardHeader className="bg-green-500/5 border-b border-border py-2.5 sm:py-4 px-3 sm:px-6">
                <CardTitle className="text-xs sm:text-base font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <Code className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0" />
                  <span className="truncate">
                    Projects (
                    {loading ? '…' : (profileData?.ProjectList?.length ?? 0)})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 sm:p-4">
                {loading ? (
                  <Skeleton className="h-16 sm:h-20 w-full rounded-lg" />
                ) : profileData?.ProjectList?.length ? (
                  <div className="space-y-2">
                    {profileData.ProjectList.slice(0, 3).map((p: any) => (
                      <div
                        key={p._id}
                        className="p-2 sm:p-3 rounded-md border bg-muted/40 flex items-center gap-2 sm:gap-3 overflow-hidden"
                      >
                        <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 shrink-0" />
                        <p className="font-medium truncate text-xs sm:text-base">
                          {p.projectName || p.title}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground italic">
                    No projects added yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contact preview */}
            <Card className="w-full shadow-lg mt-3 sm:mt-4 overflow-hidden">
              <CardHeader className="bg-blue-500/5 border-b border-border py-2.5 sm:py-4 px-3 sm:px-6">
                <CardTitle className="text-xs sm:text-base font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 sm:p-4 space-y-2.5 sm:space-y-3">
                {loading ? (
                  <Skeleton className="h-10 sm:h-12 w-full" />
                ) : (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          Email
                        </p>
                        <p className="font-medium text-xs sm:text-sm truncate">
                          {profileData?.email || '—'}
                        </p>
                      </div>
                    </div>
                    {profileData?.linkedin && (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                          <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            LinkedIn
                          </p>
                          <p className="font-medium text-xs sm:text-sm truncate">
                            {profileData.linkedin}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Card>
        </div>
      </div>
    </BusinessSettingsLayout>
  );
}
