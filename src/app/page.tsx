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
import Portfolio from "./home/portfolio/page";
import Question from "./home/ques/page";
import ContactForm from "./home/contact/page";
import ProjectCard from "@/dashboard/card/page";
import Footer from "./home/footer/page";

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
      <div className="container text-center max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-5xl text-bold">Unlock Your Freelancing Potential</h1>
        <p className="mb-16 mt-6 text-gray-500">
          Discover a world of opportunities and connect with talented freelancers to bring your projects to life.
        </p>
        <Button>Get Start</Button>
        </div>

        <section className="about-section">
          <AboutFreelancingPlatform/>
        </section>
        <section className="testimonials-section">
          <Testimonials />
        </section>
        <section className="portfolio-section">
            <Portfolio/>
        </section>
        <section className="ques-section">
           <Question/>
        </section>
        <section className="contact-section">
           <ContactForm/>
        </section>
        
       <section className="card-section">
       <div>
      <ProjectCard
        title="Pending Projects"
        content="This is a list of pending projects"
        buttonText="View All"
        padding="p-6"
      />
      <ProjectCard
        title="Completed Projects"
        content="This is a list of completed projects"
        buttonText="See More"
        padding="p-4"
      />
    </div>
       </section>
       <section className="footer-section">
          <Footer/>
        </section>
      </div>
    </>
  );
};
export default HomePage;