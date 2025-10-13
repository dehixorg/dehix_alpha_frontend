'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { axiosInstance } from '@/lib/axiosinstance';
import ProjectVerificationCard from '@/components/cards/oracleDashboard/projectVerificationCard';
import { notifyError } from '@/utils/toastMessage';
import { VerificationStatus } from '@/utils/verificationStatus';

type FilterOption = 'all' | 'pending' | 'approved' | 'denied';
interface ProjectData {
  _id: string;
  projectName: string;
  description: string;
  githubLink: string;
  start: string;
  end: string;
  refer: string;
  techUsed: string[];
  comments: string;
  role: string;
  projectType: string;
  verification_status: VerificationStatus;
  onStatusUpdate: (newStatus: VerificationStatus) => void;
  onCommentUpdate: (newComment: string) => void;
}

const ProjectVerification = () => {
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFilterChange = useCallback(
    (newFilter: FilterOption) => setFilter(newFilter),
    [],
  );

  const filteredData = useMemo(() => {
    return projectData.filter((data) => {
      if (filter === 'all') return true;
      if (filter === 'pending')
        return data.verification_status === VerificationStatus.PENDING;
      if (filter === 'approved')
        return data.verification_status === VerificationStatus.APPROVED;
      if (filter === 'denied')
        return data.verification_status === VerificationStatus.DENIED;
      return true;
    });
  }, [projectData, filter]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/verification/oracle?doc_type=project`,
      );
      const result = response.data.data;

      const flattenedData: ProjectData[] = result.flatMap((entry: any) =>
        entry.result?.projects
          ? (Object.values(entry.result.projects) as any[]).map(
              (project: any) => ({
                ...project,
                verification_status:
                  project.verificationStatus as VerificationStatus,
                verifier_id: entry.verifier_id,
                verifier_username: entry.verifier_username,
              }),
            )
          : [],
      );

      setProjectData(flattenedData);
    } catch (error) {
      notifyError('Something went wrong. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateProjectStatus = useCallback(
    (index: number, newStatus: VerificationStatus) => {
      setProjectData((prev) => {
        const next = [...prev];
        if (next[index]) next[index].verification_status = newStatus;
        return next;
      });
    },
    [],
  );

  const updateCommentStatus = useCallback(
    (index: number, newComment: string) => {
      setProjectData((prev) => {
        const next = [...prev];
        if (next[index]) next[index].comments = newComment;
        return next;
      });
    },
    [],
  );

  return (
    <div className="bg-muted-foreground/20 dark:bg-muted/20 rounded-xl border shadow-sm overflow-hidden">
      <div className="flex flex-col gap-2 p-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Project Verification
        </h1>
        <p className="text-muted-foreground">
          Monitor the status of your project verifications.
        </p>
      </div>
      <Tabs
        value={filter}
        defaultValue="all"
        onValueChange={(v) => handleFilterChange(v as FilterOption)}
      >
        <div className="border-b px-2 sm:px-6 flex items-center justify-between gap-3 flex-wrap">
          <TabsList className="bg-transparent h-12 p-0">
            <TabsTrigger
              value="all"
              className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="denied"
              className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Denied
            </TabsTrigger>
          </TabsList>
        </div>

        {(['all', 'pending', 'approved', 'denied'] as FilterOption[]).map(
          (t) => (
            <TabsContent key={t} value={t}>
              <CardContent>
                <div className="grid flex-1 items-start gap-4 md:gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6 mb-2" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))
                  ) : filteredData.length > 0 ? (
                    filteredData.map((data, index) => (
                      <ProjectVerificationCard
                        key={index}
                        _id={data._id}
                        projectName={data.projectName}
                        description={data.description}
                        githubLink={data.githubLink}
                        startFrom={data.start}
                        endTo={data.end}
                        role={data.role}
                        projectType={data.projectType}
                        reference={data.refer}
                        techUsed={data.techUsed}
                        comments={data.comments}
                        status={data.verification_status}
                        onStatusUpdate={(newStatus) =>
                          updateProjectStatus(index, newStatus)
                        }
                        onCommentUpdate={(newComment) =>
                          updateCommentStatus(index, newComment)
                        }
                      />
                    ))
                  ) : (
                    <div className="text-center w-full col-span-full mt-10 py-10">
                      <p className="text-sm text-muted-foreground">
                        No Project verification found.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </TabsContent>
          ),
        )}
      </Tabs>
    </div>
  );
};

export default ProjectVerification;
