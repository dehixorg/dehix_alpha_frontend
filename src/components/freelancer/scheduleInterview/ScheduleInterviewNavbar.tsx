'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  GraduationCap,
  Briefcase,
  Users,
  UserCheck,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  description: string;
}

const ScheduleInterviewNavbar: React.FC = () => {
  const pathname = usePathname();
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home Page',
      icon: <Home className="h-5 w-5" />,
      href: '/dashboard/freelancer',
      description: 'Return to dashboard',
    },
    {
      id: 'upskill',
      label: 'Upskill Interview',
      icon: <GraduationCap className="h-5 w-5" />,
      href: '/dashboard/freelancer',
      description: 'Enhance your skills',
    },
    {
      id: 'project',
      label: 'Project Interview',
      icon: <Briefcase className="h-5 w-5" />,
      href: '/freelancer/scheduleInterview/project',
      description: 'Project-based interviews',
    },
    {
      id: 'talent',
      label: 'Dehix Talent Interview',
      icon: <Users className="h-5 w-5" />,
      href: '/freelancer/scheduleInterview/talent',
      description: 'Talent assessment interviews',
    },
    {
      id: 'dehix',
      label: 'Dehix Interview',
      icon: <UserCheck className="h-5 w-5" />,
      href: '/freelancer/scheduleInterview/dehix',
      description: 'Platform verification interviews',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard/freelancer') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Schedule Interview
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose your interview type
        </p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                active
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                  : 'hover:border-l-4 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    active
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-medium text-sm ${
                      active
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </span>
                </div>
              </div>
              {active && <ChevronRight className="h-4 w-4 text-blue-500" />}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Quick Tips
        </h3>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Prepare your portfolio before interviews</li>
          <li>• Review common interview questions</li>
          <li>• Test your equipment beforehand</li>
          <li>• Be on time for scheduled interviews</li>
        </ul>
      </div>
    </div>
  );
};

export default ScheduleInterviewNavbar;
