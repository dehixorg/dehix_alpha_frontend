'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Globe,
  Copy,
  Share2,
  ExternalLink,
  CheckCheck,
  Award,
  Code,
  Briefcase,
  GraduationCap,
  UserCircle,
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

import FreelancerSettingsLayout from '@/components/layout/FreelancerSettingsLayout';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface FreelancerProfile {
  userName?: string;
  firstName: string;
  lastName: string;
  description: string;
  profilePic?: string;
  skills: { _id: string; name: string }[];
  domain: { _id: string; name: string }[];
  projectDomain: { _id: string; name: string }[];
  projects: any[];
  professionalInfo: any[];
  education: any[];
}

export default function FreelancerPublicProfileSettings() {
  const user = useSelector((state: RootState) => state.user);
  const [profileData, setProfileData] = useState<FreelancerProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/public/freelancer/${user.uid}`);
        const data = res.data?.data || res.data;

        const attrs = Array.isArray(data.attributes) ? data.attributes : [];
        const skillsFromAttrs = attrs
          .filter((a: any) => a?.type === 'SKILL')
          .map((a: any) => ({ _id: a._id, name: a.name }));
        const domainsFromAttrs = attrs
          .filter((a: any) => a?.type === 'DOMAIN')
          .map((a: any) => ({ _id: a._id, name: a.name }));

        setProfileData({
          userName: data.userName || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          description: data.description || '',
          profilePic: data.profilePic || '',
          skills:
            skillsFromAttrs.length > 0 ? skillsFromAttrs : data.skills || [],
          domain:
            domainsFromAttrs.length > 0 ? domainsFromAttrs : data.domain || [],
          projectDomain: data.projectDomain || [],
          projects: data.projects || [],
          professionalInfo: data.professionalInfo || [],
          education: data.education || [],
        });
        // Build share URL from userName
        const uname = data.userName || user.uid;
        setPublicUrl(
          typeof window !== 'undefined'
            ? `${window.location.origin}/freelancer-profile/${uname}`
            : `/freelancer-profile/${uname}`,
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
          title: `${profileData?.firstName ?? ''} ${profileData?.lastName ?? ''} — Dehix Freelancer`,
          text: 'Check out this freelancer profile on Dehix!',
          url: publicUrl,
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    try {
      return format(new Date(d), 'MMM yyyy');
    } catch {
      return d;
    }
  };

  return (
    <FreelancerSettingsLayout
      active="Public Profile"
      activeMenu="Public Profile"
      breadcrumbItems={[
        { label: 'Settings', link: '#' },
        { label: 'Public Profile', link: '#' },
      ]}
      isKycCheck={false}
      contentClassName="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8"
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
              Anyone with this link can view your profile — no login required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Link display */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border text-sm break-all font-mono text-muted-foreground">
              <Globe className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 truncate">{publicUrl}</span>
            </div>
            {/* Action buttons */}
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

          {/* Header card */}
          <Card className="mb-6 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-muted border-2 border-border shadow-md flex-shrink-0">
                  {loading ? (
                    <Skeleton className="h-full w-full rounded-full" />
                  ) : profileData?.profilePic ? (
                    <Image
                      src={profileData.profilePic}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10">
                      <UserCircle className="h-12 w-12 text-primary/60" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 min-w-0">
                  {loading ? (
                    <>
                      <Skeleton className="h-7 w-44" />
                      <Skeleton className="h-4 w-64" />
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground">
                          {profileData?.firstName} {profileData?.lastName}
                        </h1>
                        <Badge
                          variant="outline"
                          className="text-xs font-medium border-primary/30 text-primary bg-primary/5"
                        >
                          Freelancer
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-xl">
                        {profileData?.description ||
                          'No description added yet.'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Domains */}
          <Card className="mb-6 overflow-hidden border border-border shadow-md">
            <CardHeader className="bg-primary/5 border-b border-border py-4">
              <CardTitle className="text-md font-semibold text-primary flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skills &amp; Domains
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {loading ? (
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-20 rounded-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profileData?.skills?.length ? (
                        profileData.skills.map((s) => (
                          <Badge
                            key={s._id}
                            variant="outline"
                            className="text-xs px-3 py-1 rounded-full border-primary/20 bg-primary/5"
                          >
                            {s.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground italic text-sm">
                          No skills added
                        </p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Domains
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profileData?.domain?.length ? (
                        profileData.domain.map((d) => (
                          <Badge
                            key={d._id}
                            variant="outline"
                            className="text-xs px-3 py-1 rounded-full border-indigo-500/30 bg-indigo-500/5 text-indigo-700 dark:text-indigo-300"
                          >
                            {d.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground italic text-sm">
                          No domains added
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card className="mb-6 overflow-hidden border border-border shadow-md">
            <CardHeader className="bg-green-500/5 border-b border-border py-4">
              <CardTitle className="text-md font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                <Code className="h-5 w-5" />
                Projects ({loading ? '…' : (profileData?.projects?.length ?? 0)}
                )
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-36 w-full rounded-xl" />
                  ))}
                </div>
              ) : profileData?.projects?.length ? (
                <div className="space-y-2">
                  {profileData.projects.slice(0, 4).map((p: any) => (
                    <div
                      key={p._id}
                      className="p-3 rounded-md border bg-muted/40 flex items-center gap-3"
                    >
                      <Code className="h-4 w-4 text-green-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{p.projectName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.role}
                        </p>
                      </div>
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

          {/* Professional Experience */}
          <Card className="mb-6 overflow-hidden border border-border shadow-md">
            <CardHeader className="bg-amber-500/5 border-b border-border py-4">
              <CardTitle className="text-md font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Experience (
                {loading ? '…' : (profileData?.professionalInfo?.length ?? 0)})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-md" />
                  ))}
                </div>
              ) : profileData?.professionalInfo?.length ? (
                <div className="space-y-2">
                  {profileData.professionalInfo.slice(0, 3).map((e: any) => (
                    <div
                      key={e._id}
                      className="flex gap-3 p-3 bg-muted/50 border border-border rounded-md"
                    >
                      <Briefcase className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{e.jobTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {e.company}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(e.workFrom)} –{' '}
                          {e.workTo ? formatDate(e.workTo) : 'Present'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No experience added.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="mb-6 overflow-hidden border border-border shadow-md">
            <CardHeader className="bg-cyan-500/5 border-b border-border py-4">
              <CardTitle className="text-md font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education (
                {loading ? '…' : (profileData?.education?.length ?? 0)})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <Skeleton className="h-16 w-full rounded-md" />
              ) : profileData?.education?.length ? (
                <div className="space-y-2">
                  {profileData.education.slice(0, 3).map((edu: any) => (
                    <div
                      key={edu._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/50 border border-border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">
                          {edu.fieldOfStudy}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground bg-cyan-500/5 px-2 py-1 rounded-md w-fit">
                        {formatDate(edu.startDate)} –{' '}
                        {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No education added.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </FreelancerSettingsLayout>
  );
}
