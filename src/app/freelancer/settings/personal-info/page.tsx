'use client';
import { useSelector } from 'react-redux';
import ResumeUpload from '@/components/fileUpload/resume';
import { Search } from '@/components/search';
import { RootState } from '@/lib/store';
import SidebarMenu from '@/components/menu/sidebarMenu';
import { ProfileForm } from '@/components/form/profileForm';
import Breadcrumb from '@/components/shared/breadcrumbList';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/freelancer/settingsMenuItems';
import DropdownProfile from '@/components/shared/DropdownProfile';

export default function PersonalInfo() {
  const user = useSelector((state: RootState) => state.user);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Personal Info"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4  sm:border-0  sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Personal Info"
          />
          <Breadcrumb
            items={[
              { label: 'Settings', link: '#' },
              { label: 'Personal Info', link: '#' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="w-full md:w-[200px] lg:w-[336px]" />
          </div>
          <DropdownProfile />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <ProfileForm user_id={user.uid} />
        </main>
      </div>
      {/* <ResumeUpload user_id={user.id}/> */}
    </div>
  );
}
