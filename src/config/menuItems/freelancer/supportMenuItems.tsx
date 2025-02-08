import { useSelector } from 'react-redux';
import { HeartHandshake, Boxes, Home } from 'lucide-react'; // Use Home from lucide-react
import Image from 'next/image';

import { MenuItem } from '@/components/menu/sidebarMenu';
import { RootState } from '@/lib/store';
export const menuItemsTop: MenuItem[] = [
  {
    href: '#',
    icon: (
      <Image
        src="/dehix.png" // Path to your image in the public folder
        alt="Icon"
        width={16} // Set the desired width
        height={16} // Set the desired height
        className="transition-all group-hover:scale-110"
      />
    ),
    label: 'Dehix',
  },
  {
    href: '/dashboard/business',
    icon: <Home className="h-5 w-5" />, // Consistent use of Home component here
    label: 'Home',
  },
  {
    href: '/settings/support',
    icon: <HeartHandshake className="h-5 w-5" />,
    label: 'support',
  },
];

const getUserType = (state: RootState) => state.user.type; // Assuming you have a user slice in Redux

export function useMenuItemsBottom() {
  const userType = useSelector(getUserType);

  // Return empty array or nothing if you don't want the bottom Home item
  return [];
}
