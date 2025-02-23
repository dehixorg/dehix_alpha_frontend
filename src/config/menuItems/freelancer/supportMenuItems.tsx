import { HeartHandshake, Home } from 'lucide-react'; // Use Home from lucide-react
import Image from 'next/image';

import { MenuItem } from '@/components/menu/sidebarMenu';
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
    href: '/dashboard/freelancer',
    icon: <Home className="h-5 w-5" />, // Consistent use of Home component here
    label: 'Home',
  },
  {
    href: '/settings/support',
    icon: <HeartHandshake className="h-5 w-5" />,
    label: 'support',
  },
];

export function useMenuItemsBottom() {
  // Return empty array or nothing if you don't want the bottom Home item
  return [];
}
