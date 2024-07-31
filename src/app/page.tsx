'use client';

import { Pencil, Code, Type } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import FAQAccordion from '@/components/accordian/faqAccordian';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/shared/themeToggle';

const leftNavItems = [
  { label: 'Home', link: '/' },
  { label: 'About', link: '/' },
  { label: 'Contact', link: '/' },
];

const rightNavItems = [
  { label: 'Login', link: '/auth/login', isButton: true },
  { label: 'Register', link: '/auth/sign-up/freelancer', isButton: true },
];

const HomePage = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/auth/login');
  }, []);

  return (
    <>
      <div className="fixed right-10 bottom-10">
        <ThemeToggle />
      </div>
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Navbar items={leftNavItems} />
          <div className="ml-auto flex items-center space-x-4">
            <Navbar items={rightNavItems} />
          </div>
        </div>
      </div>
      <div className="bg-black text-white">
        <section className="px-4 py-20 md:px-6 lg:py-32 min-h-screen">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="sm:text-5xl md:text-6xl">
              Unlock Your Freelancing Potential
            </h1>
            <p className="mt-4 text-white md:text-xl">
              Discover a world of opportunities and connect with talented
              freelancers to bring your projects to life.
            </p>
            <Button className="mt-8 px-8 py-3 rounded-md text-lg font-medium bg-white text-black">
              Get Started
            </Button>
          </div>
        </section>
        <section className="px-4 py-20 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className=" sm:text-3xl">About Our Freelancing Platform</h2>
            <p className="mt-4 text-white md:text-xl">
              Our platform connects you with talented freelancers from around
              the world, empowering you to bring your projects to life.
              We&apos;re dedicated to providing a seamless experience and
              helping you find the perfect fit for your needs.
            </p>
            <div className="grid gap-8 mt-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-[#1a1a1a] p-6 text-left">
                <Pencil className="h-8 w-8 " />
                <h3 className="mt-4 ">Content Creation</h3>
                <p className="mt-2 text-white">
                  Bring your ideas to life with our talented content creators.
                </p>
              </div>
              <div className="rounded-lg bg-[#1a1a1a] p-6 text-left">
                <Code className="h-8 w-8 " />
                <h3 className="mt-4 ">Web Development</h3>
                <p className="mt-2 text-white">
                  Elevate your online presence with our expert web developers.
                </p>
              </div>
              <div className="rounded-lg bg-[#1a1a1a] p-6 text-left">
                <Type className="h-8 w-8 " />
                <h3 className="mt-4 ">Graphic Design</h3>
                <p className="mt-2 text-white">
                  Bring your brand to life with our talented graphic designers.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="px-4 py-20 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className=" sm:text-3xl">What Our Clients Say</h2>
            <div className="grid gap-8 mt-10 sm:grid-cols-2">
              <div className="rounded-lg bg-[#1a1a1a] p-6 text-left">
                <blockquote className="text-lg font-medium text-white">
                  &ldquo;The freelancers on this platform are truly exceptional.
                  They delivered high-quality work that exceeded my
                  expectations.&rdquo;
                </blockquote>
                <div className="mt-4">
                  <p className=" font-bold">John Doe</p>
                  <p className="text-white">CEO, Acme Inc.</p>
                </div>
              </div>
              <div className="rounded-lg bg-[#1a1a1a] p-6 text-left">
                <blockquote className="text-lg font-medium text-white">
                  &ldquo;I&apos;ve been using this freelancing platform for
                  years, and it&apos;s been a game-changer for my business.
                  Highly recommended!&rdquo;
                </blockquote>
                <div className="mt-4">
                  <p className=" font-bold">Jane Smith</p>
                  <p className="text-white">Founder, XYZ Company</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="px-4 py-20 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className=" sm:text-3xl">Our Portfolio</h2>
            <div className="grid gap-8 mt-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="overflow-hidden rounded-lg">
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
                <div className="bg-[#1a1a1a] p-4">
                  <h3 className="">Project Title 1</h3>
                  <p className="mt-2 text-white">
                    A brief description of the project.
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg">
                <Image
                  alt="Portfolio Item 2"
                  className="object-cover w-full h-auto"
                  height={300}
                  src="/placeholder.svg"
                  style={{
                    aspectRatio: '400/300',
                    objectFit: 'cover',
                  }}
                  width={400}
                />
                <div className="bg-[#1a1a1a] p-4">
                  <h3 className="">Project Title 2</h3>
                  <p className="mt-2 text-white">
                    A brief description of the project.
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg">
                <Image
                  alt="Portfolio Item 3"
                  className="object-cover w-full h-auto"
                  height={300}
                  src="/placeholder.svg"
                  style={{
                    aspectRatio: '400/300',
                    objectFit: 'cover',
                  }}
                  width={400}
                />
                <div className="bg-[#1a1a1a] p-4">
                  <h3 className="">Project Title 3</h3>
                  <p className="mt-2 text-white">
                    A brief description of the project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="px-4 pt-20 md:px-6">
          <FAQAccordion />
        </section>
        <section className="px-4 py-20 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            {/* FaqQuestions component to be implemented */}
          </div>
        </section>
        <section className="px-4 py-20 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className=" sm:text-3xl">Get in Touch</h2>
            <p className="mt-4 text-white md:text-xl">
              Have a project in mind? Let&apos;s discuss how we can help.
            </p>
            <form className="mt-8 space-y-4 text-left">
              <div>
                <label
                  className="block text-base font-medium text-white"
                  htmlFor="name"
                >
                  Name
                </label>
                <Input
                  className="mt-2 w-full rounded-md bg-[#1a1a1a] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
                  id="name"
                  placeholder="Enter your name"
                  type="text"
                />
              </div>
              <div>
                <label
                  className="block text-base font-medium text-white"
                  htmlFor="email"
                >
                  Email
                </label>
                <Input
                  className="mt-2 w-full rounded-md bg-[#1a1a1a] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                />
              </div>
              <div>
                <label
                  className="block text-base font-medium text-white"
                  htmlFor="message"
                >
                  Message
                </label>
                <Textarea
                  className="mt-2 w-full rounded-md bg-[#1a1a1a] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
                  id="message"
                  placeholder="Enter your message"
                />
              </div>
              <Button
                type="submit"
                className="bg-white text-black px-8 py-3 rounded-md text-lg font-medium"
              >
                Send Message
              </Button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
