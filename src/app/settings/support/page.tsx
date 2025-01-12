'use client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';

import TicketForm from './supportTicketForm';

import FAQAccordion from '@/components/accordian/faqAccordian';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  menuItemsTop,
  useMenuItemsBottom,
} from '@/config/menuItems/freelancer/supportMenuItems';
import SidebarMenu from '@/components/menu/sidebarMenu';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import Breadcrumb from '@/components/shared/breadcrumbList';
import { RootState } from '@/lib/store';
import DropdownProfile from '@/components/shared/DropdownProfile';

const HomePage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [userType, setUserType] = useState<string | null>(null);
  const menuItemsBottom = useMenuItemsBottom();

  useEffect(() => {
    if (user?.type) {
      setUserType(user.type);
    } else {
      const storedUserType = Cookies.get('userType');
      setUserType(storedUserType || null);
    }
  }, [user]);
  return (
    <div className="">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="support"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4  sm:pl-14">
        <header className="sticky  top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="support"
          />
          <Breadcrumb
            items={
              userType === 'freelancer'
                ? [
                    { label: 'Freelancer', link: '/dashboard/freelancer' },
                    { label: 'Support', link: '#' },
                  ]
                : userType === 'business'
                  ? [
                      { label: 'Business', link: '/dashboard/business' },
                      { label: 'Support', link: '#' },
                    ]
                  : [{ label: 'Loading...', link: '#' }]
            }
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <DropdownProfile />
          </div>
        </header>

        {/* Add TicketForm Section Here */}
        <div className="ml-2">
          <div className="mb-8 ">
            <TicketForm /> {/* Render the TicketForm component here */}
          </div>
        </div>

        <div className="ml-4">
          <section className="px-4 pt-20 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className=" sm:text-3xl">FAQs</h2>
            </div>
            <FAQAccordion />
          </section>
          <section className="px-4 py-20 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              {/* FaqQuestions component to be implemented */}
            </div>
          </section>
          <section id="Contact" className="px-4 py-20 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className=" sm:text-3xl">Get in Touch</h2>
              <p className="mt-4 text-white md:text-xl">
                Have a project in mind? Let&apos;s discuss how we can help.
              </p>
              <form className="mt-8 space-y-4 text-left">
                <div>
                  <label
                    className="block text-base font-medium "
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <Input
                    className="mt-2 w-full rounded-md  px-4 py-3  focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
                    id="name"
                    placeholder="Enter your name"
                    type="text"
                  />
                </div>
                <div>
                  <label
                    className="block text-base font-medium "
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <Input
                    className="mt-2 w-full rounded-md  px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
                    id="email"
                    placeholder="Enter your email"
                    type="email"
                  />
                </div>
                <div>
                  <label
                    className="block text-base font-medium "
                    htmlFor="message"
                  >
                    Message
                  </label>
                  <Textarea
                    className="mt-2 w-full rounded-md px-4 py-3  focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
                    id="message"
                    placeholder="Enter your message"
                  />
                </div>
                <Button
                  type="submit"
                  className="  px-8 py-3 rounded-md text-lg font-medium"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
