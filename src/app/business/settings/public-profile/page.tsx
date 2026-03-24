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
    >
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Share Link Card */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                Your Public Profile Link
              </CardTitle>
            </div>
            <CardDescription>
              Anyone with this link can view your business profile — no login
              required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border text-sm break-all font-mono text-muted-foreground">
              <Globe className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 truncate">{publicUrl}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                className="flex items-center gap-2"
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
                className="flex items-center gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => window.open(publicUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Preview */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Profile Preview — how visitors see your profile
          </p>

          {/* Profile Header */}
          <Card className="w-full bg-black text-white p-4 shadow-md mb-4">
            <Card className="p-8 flex items-center rounded-lg gap-6">
              {loading ? (
                <Skeleton className="w-24 h-24 rounded-full" />
              ) : (
                <Avatar className="w-24 h-24 rounded-full border-4 border-primary shadow-lg">
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
                <div className="space-y-2">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {profileData?.firstName} {profileData?.lastName}
                  </h1>
                  <p className="text-white/70">{profileData?.companyName}</p>
                </div>
              )}
            </Card>

            {/* Projects preview */}
            <Card className="w-full shadow-lg mt-4">
              <CardHeader className="bg-green-500/5 border-b border-border py-4">
                <CardTitle className="text-md font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Projects (
                  {loading ? '…' : (profileData?.ProjectList?.length ?? 0)})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {loading ? (
                  <Skeleton className="h-20 w-full rounded-lg" />
                ) : profileData?.ProjectList?.length ? (
                  <div className="space-y-2">
                    {profileData.ProjectList.slice(0, 3).map((p: any) => (
                      <div
                        key={p._id}
                        className="p-3 rounded-md border bg-muted/40 flex items-center gap-3"
                      >
                        <Code className="h-4 w-4 text-green-500 shrink-0" />
                        <p className="font-medium truncate">
                          {p.projectName || p.title}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No projects added yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contact preview */}
            <Card className="w-full shadow-lg mt-4">
              <CardHeader className="bg-blue-500/5 border-b border-border py-4">
                <CardTitle className="text-md font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {loading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium text-sm">
                          {profileData?.email || '—'}
                        </p>
                      </div>
                    </div>
                    {profileData?.linkedin && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <Linkedin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            LinkedIn
                          </p>
                          <p className="font-medium text-sm truncate">
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
