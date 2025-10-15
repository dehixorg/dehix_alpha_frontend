'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Table as TableIcon,
  LayoutGrid,
  PackageOpen,
  Play,
  CheckCircle2,
  Undo2,
  Loader2,
  ListFilter,
  Clock,
  Calendar,
  ArrowDownAZ,
  ArrowUpAZ,
  Search,
} from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import { ProjectCard } from '@/components/cards/projectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/business/dashboardMenuItems';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { RootState } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'projectName'>(
    'createdAt',
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Get user data from Redux store
  const user = useSelector((state: RootState) => state.user);

  // Debug: Log when projects state changes
  useEffect(() => {}, [projects]);

  const filteredSortedProjects = useMemo(() => {
    let items = [...projects];
    const term = search.trim().toLowerCase();
    if (term) {
      items = items.filter((p) =>
        [p.projectName, p.companyName]
          .filter(Boolean)
          .some((v: string) => v.toLowerCase().includes(term)),
      );
    }
    if (statusFilter !== 'ALL') {
      items = items.filter((p) => p.status === statusFilter);
    }
    items.sort((a, b) => {
      let av: any;
      let bv: any;
      if (sortBy === 'createdAt') {
        av = new Date(a.createdAt).getTime();
        bv = new Date(b.createdAt).getTime();
      } else {
        av = String(a.projectName || '').toLowerCase();
        bv = String(b.projectName || '').toLowerCase();
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [projects, search, statusFilter, sortBy, sortDir]);

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
          <Card className="p-6">
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
                  <TableIcon className="h-4 w-4" />
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
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 md:gap-4">
                      <div className="flex items-center justify-between gap-3">
                        <Tabs
                          value={statusFilter}
                          onValueChange={(v) => setStatusFilter(v)}
                          className="w-full"
                        >
                          <TabsList className="bg-transparent h-12 w-full sm:w-auto p-0">
                            <TabsTrigger
                              value="ALL"
                              className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                            >
                              All
                            </TabsTrigger>
                            {PROJECT_STATUS_FORMATS.map((s) => (
                              <TabsTrigger
                                key={s.value}
                                value={s.value}
                                className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                              >
                                {s.textValue}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="sm:max-w-xs w-64">
                            <Input
                              placeholder="Search projects..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                            />
                          </div>
                          <TooltipProvider>
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      aria-label="Sort"
                                    >
                                      <ListFilter className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Sort options</TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSortBy('createdAt');
                                    setSortDir('desc');
                                  }}
                                  className={
                                    sortBy === 'createdAt' && sortDir === 'desc'
                                      ? 'font-medium'
                                      : ''
                                  }
                                >
                                  <Clock className="mr-2 h-4 w-4" /> Newest
                                  first
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSortBy('createdAt');
                                    setSortDir('asc');
                                  }}
                                  className={
                                    sortBy === 'createdAt' && sortDir === 'asc'
                                      ? 'font-medium'
                                      : ''
                                  }
                                >
                                  <Calendar className="mr-2 h-4 w-4" /> Oldest
                                  first
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSortBy('projectName');
                                    setSortDir('asc');
                                  }}
                                  className={
                                    sortBy === 'projectName' &&
                                    sortDir === 'asc'
                                      ? 'font-medium'
                                      : ''
                                  }
                                >
                                  <ArrowDownAZ className="mr-2 h-4 w-4" /> Name
                                  A → Z
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSortBy('projectName');
                                    setSortDir('desc');
                                  }}
                                  className={
                                    sortBy === 'projectName' &&
                                    sortDir === 'desc'
                                      ? 'font-medium'
                                      : ''
                                  }
                                >
                                  <ArrowUpAZ className="mr-2 h-4 w-4" /> Name Z
                                  → A
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TooltipProvider>
                          {(statusFilter !== 'ALL' ||
                            search ||
                            sortBy !== 'createdAt' ||
                            sortDir !== 'desc') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setStatusFilter('ALL');
                                setSearch('');
                                setSortBy('createdAt');
                                setSortDir('desc');
                              }}
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center sm:hidden gap-2">
                        <Input
                          className="flex-1"
                          placeholder="Search projects..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                        <TooltipProvider>
                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label="Sort"
                                  >
                                    <ListFilter className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Sort options</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSortBy('createdAt');
                                  setSortDir('desc');
                                }}
                                className={
                                  sortBy === 'createdAt' && sortDir === 'desc'
                                    ? 'font-medium'
                                    : ''
                                }
                              >
                                <Clock className="mr-2 h-4 w-4" /> Newest first
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSortBy('createdAt');
                                  setSortDir('asc');
                                }}
                                className={
                                  sortBy === 'createdAt' && sortDir === 'asc'
                                    ? 'font-medium'
                                    : ''
                                }
                              >
                                <Calendar className="mr-2 h-4 w-4" /> Oldest
                                first
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSortBy('projectName');
                                  setSortDir('asc');
                                }}
                                className={
                                  sortBy === 'projectName' && sortDir === 'asc'
                                    ? 'font-medium'
                                    : ''
                                }
                              >
                                <ArrowDownAZ className="mr-2 h-4 w-4" /> Name A
                                → Z
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSortBy('projectName');
                                  setSortDir('desc');
                                }}
                                className={
                                  sortBy === 'projectName' && sortDir === 'desc'
                                    ? 'font-medium'
                                    : ''
                                }
                              >
                                <ArrowUpAZ className="mr-2 h-4 w-4" /> Name Z →
                                A
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="rounded-lg border shadow-sm">
                      <Table className="">
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead className="sticky top-0 z-10">
                              Project
                            </TableHead>
                            <TableHead className="text-center sticky top-0 z-10">
                              Status
                            </TableHead>
                            <TableHead className="sticky top-0 z-10">
                              Created
                            </TableHead>
                            <TableHead className="text-center sticky top-0 z-10">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSortedProjects.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="h-40 text-center text-muted-foreground"
                              >
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <Search className="h-8 w-8" />
                                  <span>No matching projects</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                          {filteredSortedProjects.map((p) => {
                            const status = PROJECT_STATUS_FORMATS.find(
                              (s) => s.value === p.status,
                            );
                            return (
                              <TableRow
                                key={p._id}
                                className="hover:bg-muted/40 cursor-pointer"
                                onClick={() =>
                                  (window.location.href = `/business/project/${p._id}`)
                                }
                              >
                                <TableCell className="">
                                  <div className="flex flex-col">
                                    <span className="font-medium leading-tight">
                                      {p.projectName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {p.companyName}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  {status ? (
                                    <Badge
                                      variant="secondary"
                                      className={`uppercase rounded-full px-2.5 py-1 text-xs shadow-sm ${statusOutlineClasses(status.value)}`}
                                    >
                                      {status.textValue}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">
                                      {p.status}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {p.createdAt
                                    ? new Date(p.createdAt).toLocaleDateString()
                                    : '-'}
                                </TableCell>
                                <TableCell className="text-center">
                                  {p.status === 'COMPLETED' ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(p._id, 'ACTIVE');
                                      }}
                                      disabled={updatingStatus === p._id}
                                      className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 disabled:opacity-50"
                                    >
                                      {updatingStatus === p._id ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          Updating...
                                        </>
                                      ) : (
                                        <>
                                          <Undo2 className="h-4 w-4" /> Mark as
                                          Incomplete
                                        </>
                                      )}
                                    </Button>
                                  ) : p.status === 'PENDING' ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(p._id, 'ACTIVE');
                                      }}
                                      disabled={updatingStatus === p._id}
                                      className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 disabled:opacity-50"
                                    >
                                      {updatingStatus === p._id ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          Starting...
                                        </>
                                      ) : (
                                        <>
                                          <Play className="h-4 w-4" /> Start
                                          Project
                                        </>
                                      )}
                                    </Button>
                                  ) : p.status === 'ACTIVE' ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(p._id, 'COMPLETED');
                                      }}
                                      disabled={updatingStatus === p._id}
                                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                    >
                                      {updatingStatus === p._id ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          Completing...
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2 className="h-4 w-4" />{' '}
                                          Mark as Completed
                                        </>
                                      )}
                                    </Button>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">
                                      -
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  /* Card View */
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    {projects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default BusinessProjectsPage;
