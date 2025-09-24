'use client';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { axiosInstance } from '@/lib/axiosinstance';
import ProjectCard from '@/components/cards/freelancerProjectCard';
import { AddProject } from '@/components/dialogs/addProject';
import ProjectDetailsDialog from '@/components/dialogs/projectDetailsDialog';
import EditProjectDialog from '@/components/dialogs/editProjectDialog';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import Header from '@/components/header/header';
import { toast } from '@/components/ui/use-toast';

export default function Projects() {
  const user = useSelector((state: RootState) => state.user);
  const [refresh, setRefresh] = useState(false);
  const [projects, setProjects] = useState<any>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleFormSubmit = () => {
    setRefresh((prev) => !prev);
  };

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setIsDetailsDialogOpen(true);
  };

  const handleEditProject = () => {
    setIsDetailsDialogOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setRefresh((prev) => !prev);
    setIsEditDialogOpen(false);
    setSelectedProject(null);
  };

  const handleDeleteSuccess = () => {
    setRefresh((prev) => !prev);
    setIsDetailsDialogOpen(false);
    setSelectedProject(null);
  };

  const handleCloseDialogs = () => {
    setIsDetailsDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedProject(null);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${user.uid}`);

        const projectsData = response.data?.data;

        if (!projectsData || typeof projectsData !== 'object') {
          console.warn('No projects data found, setting empty array.');
          setProjects([]);
          return;
        }

        setProjects(Object.values(response?.data?.data?.projects));
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        });
        console.error('API Error:', error);
        setProjects([]);
      }
    };

    fetchData();
  }, [user.uid, refresh]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Projects"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Projects"
          breadcrumbItems={[
            { label: 'Freelancer', link: '/dashboard/freelancer' },
            { label: 'Settings', link: '#' },
            { label: 'Projects', link: '#' },
          ]}
        />
        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8
                grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        >
          {projects.map((project: any, index: number) => (
            <ProjectCard
              key={index}
              {...project}
              onClick={() => handleProjectClick(project)}
            />
          ))}
          <AddProject onFormSubmit={handleFormSubmit} />
        </main>

        {/* Project Details Dialog */}
        {selectedProject && (
          <ProjectDetailsDialog
            isOpen={isDetailsDialogOpen}
            onClose={handleCloseDialogs}
            onEdit={handleEditProject}
            onDelete={handleDeleteSuccess}
            project={selectedProject}
          />
        )}

        {/* Edit Project Dialog */}
        {selectedProject && (
          <EditProjectDialog
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialogs}
            onSuccess={handleEditSuccess}
            project={selectedProject}
          />
        )}
      </div>
    </div>
  );
}
