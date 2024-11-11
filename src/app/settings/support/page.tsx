'use client';
import React, { useEffect, useState } from 'react';
import { Pencil, Code, Type } from 'lucide-react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';

import TicketForm from './supportTicketFofm';

import FAQAccordion from '@/components/accordian/faqAccordian';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
            <h2 className="sm:text-3xl">Submit a Support Ticket</h2>
            <TicketForm /> {/* Render the TicketForm component here */}
          </div>
        </div>

        <div className="ml-4">
          <section id="About" className="px-4 py-20 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className=" sm:text-3xl">About Our Freelancing Platform</h2>
              <p className="mt-4  md:text-xl">
                Our platform connects you with talented freelancers from around
                the world, empowering you to bring your projects to life.
                We&apos;re dedicated to providing a seamless experience and
                helping you find the perfect fit for your needs.
              </p>
              <div className="grid gap-6 mt-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                <Card className="h-[350px] ">
                  <CardHeader>
                    <Pencil className="h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="mt-6">Content Creation</CardTitle>
                    <CardDescription className="mt-2 ">
                      Bring your ideas to life with our talented content
                      creators.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="h-[350px] ">
                  <CardHeader>
                    <Code className="h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="">Web Development</CardTitle>
                    <CardDescription className="mt-2">
                      Elevate your online presence with our expert web
                      developers.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="h-[350px] ">
                  <CardHeader>
                    <Type className="h-8 w-8" />
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="mt-4">Graphic Design</CardTitle>
                    <CardDescription className="mt-2 ">
                      Bring your brand to life with our talented graphic
                      designers.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
          <section className="px-4 py-20 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className=" sm:text-3xl">What Our Clients Say</h2>
              <div className="grid gap-6 mt-10 sm:grid-cols-2">
                <Card className=" p-6 text-left">
                  <CardContent>
                    <blockquote className="text-lg font-medium ">
                      &ldquo;The freelancers on this platform are truly
                      exceptional. They delivered high-quality work that
                      exceeded my expectations.&rdquo;
                    </blockquote>
                  </CardContent>
                  <CardFooter className="mt-4">
                    <div>
                      <p className="font-bold">John Doe</p>
                      <p className="font-bold">CEO, Acme Inc.</p>
                    </div>
                  </CardFooter>
                </Card>
                <Card className=" p-6 text-left">
                  <CardContent>
                    <blockquote className="text-lg font-medium ">
                      &ldquo;I&apos;ve been using this freelancing platform for
                      years, and it&apos;s been a game-changer for my business.
                      Highly recommended!&rdquo;
                    </blockquote>
                  </CardContent>
                  <CardFooter className="mt-4">
                    <div>
                      <p className="font-bold">Jane Smith</p>
                      <p className="font-bold">Founder, XYZ Company</p>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </section>
          <section className="px-4 py-20 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className=" sm:text-3xl">Our Portfolio</h2>
              <div className="grid gap-6 mt-10 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="overflow-hidden border-none">
                  <Image
                    alt="Portfolio Item 1"
                    className="object-cover w-full h-auto"
                    height={300}
                    src="/placeholder.svg"
                    style={{
                      aspectRatio: '400/300',
                      objectFit: 'cover',
                    }}
                    width={400}
                  />
                  <CardContent className=" p-4">
                    <CardTitle>Project Title 1</CardTitle>
                    <CardDescription className="mt-2 text-white">
                      A brief description of the project.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden border-none">
                  <Image
                    alt="Portfolio Item 1"
                    className="object-cover w-full h-auto"
                    height={300}
                    src="/placeholder.svg"
                    style={{
                      aspectRatio: '400/300',
                      objectFit: 'cover',
                    }}
                    width={400}
                  />
                  <CardContent className=" p-4">
                    <CardTitle>Project Title 2</CardTitle>
                    <CardDescription className="mt-2 text-white">
                      A brief description of the project.
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="overflow-hidden border-none">
                  <Image
                    alt="Portfolio Item 1"
                    className="object-cover w-full h-auto"
                    height={300}
                    src="/placeholder.svg"
                    style={{
                      aspectRatio: '400/300',
                      objectFit: 'cover',
                    }}
                    width={400}
                  />
                  <CardContent className=" p-4">
                    <CardTitle>Project Title 3</CardTitle>
                    <CardDescription className="mt-2 text-white">
                      A brief description of the project.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

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
