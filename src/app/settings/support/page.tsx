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
import { toast } from '@/components/ui/use-toast';

const HomePage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [userType, setUserType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const characterLimit = 500;

  const menuItemsBottom = useMenuItemsBottom();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;

    if (id === 'message' && value.length > characterLimit) return;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  useEffect(() => {
    if (user?.type) {
      setUserType(user.type);
    } else {
      const storedUserType = Cookies.get('userType');
      setUserType(storedUserType || null);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Message sent successfully!',
      description: 'Thanks for connecting! We will connect soon.',
      duration: 1500,
    });

    setFormData({ name: '', email: '', message: '' });
  };

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
            <div className="flex justify-end w-full">
              <DropdownProfile />
            </div>
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
              <p className="mt-4 md:text-xl">
                Have a project in mind? Let&apos;s discuss how we can help.
              </p>
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-4 text-left"
              >
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
                    required
                    value={formData.name}
                    onChange={handleChange}
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
                    required
                    value={formData.email}
                    onChange={handleChange}
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
                    required
                    placeholder="Enter your message"
                    value={formData.message}
                    onChange={handleChange}
                  />
                  <p className="text-right text-sm text-gray-500">
                    {formData.message.length}/{characterLimit} characters
                  </p>
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
