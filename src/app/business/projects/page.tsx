'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Table,
  LayoutGrid,
  Eye,
  PackageOpen,
  Play,
  CheckCircle2,
  Undo2,
  Loader2,
} from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { CustomTable } from '@/components/custom-table/CustomTable';
import { ProjectCard } from '@/components/cards/projectCard';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/business/dashboardMenuItems';
import { FieldType } from '@/components/custom-table/FieldTypes';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { RootState } from '@/lib/store';

// Status configuration for table STATUS field type
const PROJECT_STATUS_FORMATS = [
  {
    value: 'PENDING',
    textValue: 'Pending',
    bgColor: '#D97706',
    textColor: '#FFFFFF',
  },
  {
    value: 'ACTIVE',
    textValue: 'Active',
    bgColor: '#3B82F6',
    textColor: '#FFFFFF',
  },
  {
    value: 'COMPLETED',
    textValue: 'Completed',
    bgColor: '#059669',
    textColor: '#FFFFFF',
  },
];

const BusinessProjectsPage: React.FC = () => {
  // State management
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTableView, setIsTableView] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Get user data from Redux store
  const user = useSelector((state: RootState) => state.user);

  // Debug: Log when projects state changes
  useEffect(() => {}, [projects]);

  // Table fields configuration
  const fields = [
    {
      fieldName: 'projectName',
      textValue: 'Project Name',
      type: FieldType.TEXT,
      className: 'text-left',
    },
    {
      fieldName: 'companyName',
      textValue: 'Company',
      type: FieldType.TEXT,
      className: 'text-left',
    },
    {
      fieldName: 'status',
      textValue: 'Status',
      type: FieldType.STATUS,
      statusFormats: PROJECT_STATUS_FORMATS,
    },
    {
      fieldName: 'createdAt',
      textValue: 'Created Date',
      type: FieldType.DATE,
    },
    {
      textValue: 'View',
      type: FieldType.CUSTOM,
      CustomComponent: ({ data }: { data: any }) => (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              (window.location.href = `/business/project/${data._id}`)
            }
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </Button>
        </div>
      ),
    },
    {
      textValue: 'Actions',
      type: FieldType.CUSTOM,
      CustomComponent: ({ data }: { data: any }) => {
        // Project workflow: PENDING → ACTIVE → COMPLETED

        if (data.status === 'COMPLETED') {
          // Completed projects can be marked as incomplete
          const isUpdating = updatingStatus === data._id;
          return (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate(data._id, 'ACTIVE')}
                disabled={isUpdating}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Undo2 className="h-4 w-4" /> Mark as Incomplete
                  </>
                )}
              </Button>
            </div>
          );
        }

        if (data.status === 'PENDING') {
          // Pending projects can only be started
          const isUpdating = updatingStatus === data._id;
          return (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate(data._id, 'ACTIVE')}
                disabled={isUpdating}
                className="flex items-center gap-2 text-green-600 hover:text-green-700 disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Start Project
                  </>
                )}
              </Button>
            </div>
          );
        }

        if (data.status === 'ACTIVE') {
          // Active projects can only be completed
          const isUpdating = updatingStatus === data._id;
          return (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusUpdate(data._id, 'COMPLETED')}
                disabled={isUpdating}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Mark as Completed
                  </>
                )}
              </Button>
            </div>
          );
        }

        // Fallback for any other status
        return (
          <div className="text-center text-muted-foreground text-sm">-</div>
        );
      },
    },
  ];

  // Handle status update
  const handleStatusUpdate = async (projectId: string, newStatus: string) => {
    if (updatingStatus === projectId) {
      return;
    }

    setUpdatingStatus(projectId);

    try {
      // Try the primary endpoint
      await axiosInstance.put(`/project/${projectId}`, {
        status: newStatus,
      });

      // Update the project in the local state immediately
      setProjects((prevProjects) => {
        const updatedProjects = prevProjects.map((project) =>
          project._id === projectId
            ? { ...project, status: newStatus }
            : project,
        );

        return updatedProjects;
      });

      try {
        const refreshResponse = await axiosInstance.get('/project/business');
        setProjects(refreshResponse.data?.data || []);
      } catch (refreshError) {
        console.error('Failed to refresh data:', refreshError);
      }

      const statusMessage =
        newStatus === 'ACTIVE' &&
        projects.find((p) => p._id === projectId)?.status === 'COMPLETED'
          ? 'Project marked as incomplete'
          : `Project status updated to ${newStatus}`;
      notifySuccess(statusMessage);
    } catch (error: any) {
      console.error('Error details:', error.response?.data || error.message);

      // Try alternative endpoint if first one fails
      try {
        await axiosInstance.patch(`/project/business/${projectId}`, {
          status: newStatus,
        });

        // Update the project in the local state immediately
        setProjects((prevProjects) => {
          const updatedProjects = prevProjects.map((project) =>
            project._id === projectId
              ? { ...project, status: newStatus }
              : project,
          );
          return updatedProjects;
        });

        try {
          const refreshResponse = await axiosInstance.get('/project/business');
          setProjects(refreshResponse.data?.data || []);
        } catch (refreshError) {
          console.error('Failed to refresh data (alternative):', refreshError);
        }

        const statusMessage =
          newStatus === 'ACTIVE' &&
          projects.find((p) => p._id === projectId)?.status === 'COMPLETED'
            ? 'Project marked as incomplete'
            : `Project status updated to ${newStatus}`;
        notifySuccess(statusMessage);
      } catch (alternativeError: any) {
        notifyError(
          alternativeError.response?.data?.message ||
            'Failed to update project status',
          'Error',
        );
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Data fetching
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const response = await axiosInstance.get('/project/business');
        setProjects(response.data?.data || []);
      } catch (error: any) {
        console.error('Failed to fetch projects:', error);
        notifyError('Failed to load projects', 'Error');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user?.uid]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Sidebar */}
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Projects"
      />

      {/* Main content wrapper */}
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        {/* Header */}
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Projects"
          breadcrumbItems={[
            { label: 'Business', link: '/dashboard/business' },
            { label: 'Projects', link: '/business/projects' },
          ]}
        />

        {/* Content container */}
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-8">
          {/* Header section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-2">
              <h1 className="hidden md:block text-2xl sm:text-3xl font-bold tracking-tight">
                Projects
              </h1>
              <p className="hidden md:block text-muted-foreground">
                Manage your projects.
              </p>
            </div>
            {/* View toggle buttons */}
            <div className="flex gap-2">
              <Button
                variant={isTableView ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsTableView(true)}
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button
                variant={!isTableView ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsTableView(false)}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* View content */}
          {loading ? (
            /* Loading state for both views */
            <div>
              {isTableView ? (
                /* Table loading skeleton */
                <div className="space-y-4">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="h-16 bg-muted animate-pulse rounded"
                    />
                  ))}
                </div>
              ) : (
                /* Card loading skeleton */
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="h-48 bg-muted animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : projects.length === 0 ? (
            /* Empty state for both views */
            <div className="flex flex-col items-center justify-center py-12">
              <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No projects found</p>
            </div>
          ) : (
            /* Data views */
            <>
              {isTableView ? (
                /* Table View */
                <CustomTable
                  key={`projects-table-${projects.length}-${JSON.stringify(projects.map((p) => ({ id: p._id, status: p.status })))}`}
                  data={projects}
                  uniqueId="_id"
                  fields={fields}
                  searchColumn={['projectName', 'companyName']}
                  isFilter={true}
                  sortBy={[
                    { label: 'Created Date', fieldName: 'createdAt' },
                    { label: 'Project Name', fieldName: 'projectName' },
                  ]}
                />
              ) : (
                /* Card View */
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default BusinessProjectsPage;
