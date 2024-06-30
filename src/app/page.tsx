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
      <div className="min-h-screen container text-center mx-auto px-4 py-16">
        <h1 className="text-5xl text-bold font-extrabold tracking-tight lg:text-5xl">Welcome to Our Business Platform</h1>
        <p className="mb-16 mt-6 text-gray-500 text-xl text-muted-foreground">
          Manage your business with our comprehensive suite of applications.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {services.map(({ title, icon, description }) => (
            <IconCard
              title={title}
              icon={icon}
              description={description}
              key={title}
            />
          ))}
        </div>
      </div>
    </>
  );
};

const services = [
  {
    title: "ESS",
    description: "Manage employee self-service requests",
    icon: <User size={48} className="text-black dark:text-white m-auto" />,
  },
  {
    title: "Ticket",
    description: "Track and manage customer support tickets",
    icon: <Ticket size={48} className="text-black dark:text-white m-auto" />,
  },
  {
    title: "CRM",
    description: "Manage customer relationships and sales data",
    icon: <Home size={48} className="text-black dark:text-white m-auto" />,
  },
  {
    title: "Website Builder",
    description: "Create a professional website for your business",
    icon: <Laptop size={48} className="text-black dark:text-white m-auto" />,
  },
  {
    title: "E-commerce",
    description: "Sell products online with our e-commerce platform",
    icon: (
      <ShoppingCart size={48} className="text-black dark:text-white m-auto" />
    ),
  },
  {
    title: "Accounting",
    description: "Manage your finances with our accounting software",
    icon: (
      <CreditCard size={48} className="text-black dark:text-white m-auto" />
    ),
  },
  {
    title: "Inventory",
    description: "Track inventory levels and automate your supply chain",
    icon: <Box size={48} className="text-black dark:text-white m-auto" />,
  },
  {
    title: "Project",
    description:
      "Manage projects and tasks with our project management software",
    icon: <Check size={48} className="text-black dark:text-white m-auto" />,
  },
];
export default HomePage;
