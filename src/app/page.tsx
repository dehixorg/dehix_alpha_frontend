import {
  User,
  Ticket,
  Home,
  Laptop,
  ShoppingCart,
  CreditCard,
  Box,
  Check,
} from "lucide-react";
import { IconCard } from "../components/shared/iconCard";
import { NavMenu } from "../components/navbar";
import { Search } from "../components/search";
import { UserNav } from "../components/userNav";
import { Button } from "@/components/ui/button";
import Testimonials from "./home/testimonial/page";
import AboutFreelancingPlatform from "./home/about/page";
import Portfolio from "../components/home-comp/portfolio/page";
import Question from "../components/home-comp/ques/page";
import ContactForm from "./home/contact/page";
import ProjectCard from "@/components/dash-comp/card/page";
import Footer from "./home/footer/page";

const portfolioItems = [
  {
    image: "/placeholder.svg",
    title: "Project Title 1",
    description: "A brief description of the project.",
  },
  {
    image: "/placeholder.svg",
    title: "Project Title 2",
    description: "A brief description of the project.",
  },
  {
    image: "/portfolio.jpg",
    title: "Project Title 3",
    description: "A brief description of the project.",
  },
];

const HomePage = () => {
  return (
    <>
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <NavMenu />
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <UserNav />
          </div>
        </div>
      </div>
      <div className="container text-center mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold">Unlock Your Freelancing Potential</h1>
          <p className="mb-16 mt-6 text-gray-500">
            Discover a world of opportunities and connect with talented freelancers to bring your projects to life.
          </p>
          <Button>Get Started</Button>
        </div>

        <section className="about-section">
          <AboutFreelancingPlatform />
        </section>
        <section className="testimonials-section">
          <Testimonials />
        </section>
        <section className="portfolio-section">
          <Portfolio items={portfolioItems} />
        </section>
        <section className="ques-section">
          <Question />
        </section>
        <section className="contact-section">
          <ContactForm />
        </section>
        <section className="card-section">
          <div className="flex justify-center items-center space-x-2">
            <ProjectCard
              title="Pending Projects"
              content="This is a list of pending projects"
              buttonText="View All"
            />
            <ProjectCard
              title="Completed Projects"
              content="This is a list of completed projects"
              buttonText="See More"
            />
          </div>
        </section>
        <section className="footer-section">
          <Footer />
        </section>
      </div>
    </>
  );
};

export default HomePage;
