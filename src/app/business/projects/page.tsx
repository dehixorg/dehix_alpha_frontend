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
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { RootState } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';
import EmptyState from '@/components/shared/EmptyState';
import BusinessDashboardLayout from '@/components/layout/BusinessDashboardLayout';
import { useBusinessProjectTour } from '@/components/tour/business/useBusinessProjectTour';
import { ScrollArea } from '@/components/ui/scroll-area';

// Status config
const PROJECT_STATUS_FORMATS = [
  { value: 'PENDING', textValue: 'Pending' },
  { value: 'ACTIVE', textValue: 'Active' },
  { value: 'COMPLETED', textValue: 'Completed' },
];

const BusinessProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTableView, setIsTableView] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'projectName'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const user = useSelector((state: RootState) => state.user);

  useBusinessProjectTour(true);

  // Filtering + sorting
  const filteredSortedProjects = useMemo(() => {
    let items = [...projects];

    if (search.trim()) {
      const term = search.toLowerCase();
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
      const av =
        sortBy === 'createdAt'
          ? new Date(a.createdAt).getTime()
          : String(a.projectName || '').toLowerCase();

      const bv =
        sortBy === 'createdAt'
          ? new Date(b.createdAt).getTime()
          : String(b.projectName || '').toLowerCase();

      return sortDir === 'asc' ? (av < bv ? -1 : 1) : av > bv ? -1 : 1;
    });

    return items;
  }, [projects, search, statusFilter, sortBy, sortDir]);

  // Status update
  const handleStatusUpdate = async (projectId: string, newStatus: string) => {
    if (updatingStatus === projectId) return;

    setUpdatingStatus(projectId);

    try {
      await axiosInstance.put(`/project/${projectId}`, { status: newStatus });

      setProjects((prev) =>
        prev.map((p) =>
          p._id === projectId ? { ...p, status: newStatus } : p,
        ),
      );

      notifySuccess(`Status updated to ${newStatus}`);
    } catch (error) {
      notifyError('Failed to update project', 'Error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const res = await axiosInstance.get('/project/business');
        setProjects(res.data?.data || []);
      } catch {
        notifyError('Failed to load projects', 'Error');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user?.uid]);

  return (
    <BusinessDashboardLayout
      active="Projects"
      activeMenu="Projects"
      breadcrumbItems={[
        { label: 'Business', link: '/dashboard/business' },
        { label: 'Projects', link: '/business/projects' },
      ]}
    >
      <Card className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Projects</h1>

          <div className="flex gap-2">
            <Button
              variant={isTableView ? 'default' : 'outline'}
              onClick={() => setIsTableView(true)}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={!isTableView ? 'default' : 'outline'}
              onClick={() => setIsTableView(false)}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<PackageOpen />}
            title="No projects found"
            description="Create a project to see it here."
          />
        ) : isTableView ? (
          <>
            {/* Filters */}
            <div className="flex gap-3 mt-4">
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Table with ScrollArea ONLY where needed */}
            <ScrollArea className="mt-4 border rounded-lg">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredSortedProjects.map((p) => {
                    const status = PROJECT_STATUS_FORMATS.find(
                      (s) => s.value === p.status,
                    );

                    return (
                      <TableRow key={p._id}>
                        <TableCell>{p.projectName}</TableCell>

                        <TableCell>
                          <Badge className={statusOutlineClasses(p.status)}>
                            {status?.textValue || p.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {new Date(p.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(p._id, 'COMPLETED')
                            }
                            disabled={updatingStatus === p._id}
                          >
                            {updatingStatus === p._id ? (
                              <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                              'Complete'
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        )}
      </Card>
    </BusinessDashboardLayout>
  );
};

export default BusinessProjectsPage;