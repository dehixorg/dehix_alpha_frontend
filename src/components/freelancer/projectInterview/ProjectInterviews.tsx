import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, ListFilter, Verified } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const dummyData = [
    {
        _id: "1",
        projectName: "E-commerce Platform",
        description: "A multi-vendor e-commerce platform with real-time tracking.",
        verified: true,
        githubLink: "https://github.com/user/ecommerce-platform",
        start: new Date("2023-01-10"),
        end: new Date("2023-06-15"),
        refer: "Client A",
        techUsed: ["React", "Node.js", "MongoDB", "Express"],
        role: "Full Stack Developer",
        projectType: "Freelance",
        projectInterview: "freelancer123",
        verificationStatus: "VERIFIED",
        verificationUpdateTime: new Date("2023-06-20"),
        comments: "Successfully delivered with all features.",
    },
    {
        _id: "2",
        projectName: "SaaS CRM",
        description: "A cloud-based CRM for managing customer interactions.",
        verified: false,
        githubLink: "https://github.com/user/saas-crm",
        start: new Date("2022-05-01"),
        end: new Date("2022-12-30"),
        refer: "Company X",
        techUsed: ["Vue.js", "Django", "PostgreSQL"],
        role: "Backend Developer",
        projectType: "Corporate",
        projectInterview: "freelancer456",
        verificationStatus: "REJECTED",
        verificationUpdateTime: new Date("2023-01-05"),
        comments: "Project rejected due to missing key features.",
    },
    {
        _id: "3",
        projectName: "Event Management App",
        description: "An application for event bookings and ticket sales.",
        verified: true,
        githubLink: "https://github.com/user/event-app",
        start: new Date("2023-03-01"),
        end: null,
        refer: "Self-Initiated",
        techUsed: ["Next.js", "Firebase", "TailwindCSS"],
        role: "Frontend Developer",
        projectType: "Personal",
        projectInterview: "freelancer789",
        verificationStatus: "ADDED",
        verificationUpdateTime: null,
        comments: "Ongoing personal project with great potential.",
    },
    {
        _id: "4",
        projectName: "AI Chatbot",
        description: "An AI-powered chatbot for customer support automation.",
        verified: true,
        githubLink: "https://github.com/user/ai-chatbot",
        start: new Date("2023-07-01"),
        end: new Date("2023-10-15"),
        refer: "Startup B",
        techUsed: ["Python", "TensorFlow", "Flask"],
        role: "Machine Learning Engineer",
        projectType: "Freelance",
        projectInterview: "freelancer987",
        verificationStatus: "VERIFIED",
        verificationUpdateTime: new Date("2023-10-20"),
        comments: "Highly optimized with NLP improvements.",
    },
    {
        _id: "5",
        projectName: "Portfolio Website",
        description: "A personal portfolio to showcase projects and skills.",
        verified: false,
        githubLink: "https://github.com/user/portfolio",
        start: new Date("2022-09-01"),
        end: new Date("2022-12-01"),
        refer: "Self",
        techUsed: ["HTML", "CSS", "JavaScript"],
        role: "Frontend Developer",
        projectType: "Personal",
        projectInterview: null,
        verificationStatus: "ADDED",
        verificationUpdateTime: null,
        comments: "Still making design improvements.",
    },
    {
        _id: "6",
        projectName: "Finance Tracker App",
        description: "An app to track daily expenses and investments.",
        verified: true,
        githubLink: "https://github.com/user/finance-tracker",
        start: new Date("2023-02-15"),
        end: new Date("2023-08-01"),
        refer: "Freelance Client",
        techUsed: ["Flutter", "Firebase"],
        role: "Mobile Developer",
        projectType: "Freelance",
        projectInterview: "freelancer654",
        verificationStatus: "VERIFIED",
        verificationUpdateTime: new Date("2023-08-05"),
        comments: "Completed with real-time analytics features.",
    },
    {
        _id: "7",
        projectName: "E-learning Platform",
        description: "An online platform for hosting and managing courses.",
        verified: false,
        githubLink: "https://github.com/user/e-learning",
        start: new Date("2021-10-01"),
        end: new Date("2022-06-30"),
        refer: "EdTech Company",
        techUsed: ["Angular", "Node.js", "MySQL"],
        role: "Full Stack Developer",
        projectType: "Corporate",
        projectInterview: "freelancer321",
        verificationStatus: "REJECTED",
        verificationUpdateTime: new Date("2022-07-10"),
        comments: "Project did not meet scalability requirements.",
    },
    {
        _id: "8",
        projectName: "Real Estate Listing Platform",
        description: "A real estate marketplace with AI-based recommendations.",
        verified: true,
        githubLink: "https://github.com/user/real-estate",
        start: new Date("2023-04-10"),
        end: null,
        refer: "Client Y",
        techUsed: ["React", "Spring Boot", "MongoDB"],
        role: "Backend Developer",
        projectType: "Freelance",
        projectInterview: "freelancer111",
        verificationStatus: "VERIFIED",
        verificationUpdateTime: new Date("2023-08-30"),
        comments: "Continuing to optimize recommendation engine.",
    },
    {
        _id: "9",
        projectName: "Food Delivery App",
        description: "A food delivery platform with real-time order tracking.",
        verified: true,
        githubLink: "https://github.com/user/food-delivery",
        start: new Date("2022-11-01"),
        end: new Date("2023-05-15"),
        refer: "Restaurant Chain Z",
        techUsed: ["Kotlin", "Firebase", "Node.js"],
        role: "Mobile App Developer",
        projectType: "Corporate",
        projectInterview: "freelancer999",
        verificationStatus: "VERIFIED",
        verificationUpdateTime: new Date("2023-05-20"),
        comments: "Successfully deployed across multiple cities.",
    },
    {
        _id: "10",
        projectName: "Health & Fitness App",
        description: "A mobile app for fitness tracking and health monitoring.",
        verified: false,
        githubLink: "https://github.com/user/fitness-app",
        start: new Date("2023-03-15"),
        end: null,
        refer: "Startup C",
        techUsed: ["React Native", "AWS Amplify"],
        role: "Mobile Developer",
        projectType: "Startup",
        projectInterview: "freelancer777",
        verificationStatus: "ADDED",
        verificationUpdateTime: null,
        comments: "Currently in beta testing.",
    },
    {
        _id: "11",
        projectName: "Cybersecurity Dashboard",
        description: "A cybersecurity monitoring system for threat detection.",
        verified: true,
        githubLink: "https://github.com/user/cyber-dashboard",
        start: new Date("2022-06-01"),
        end: new Date("2023-02-01"),
        refer: "Security Firm",
        techUsed: ["Go", "Kafka", "PostgreSQL"],
        role: "Security Engineer",
        projectType: "Corporate",
        projectInterview: "freelancer555",
        verificationStatus: "VERIFIED",
        verificationUpdateTime: new Date("2023-02-10"),
        comments: "Integrated with real-time analytics and alerts.",
    }
];

const Projects = ({ isTableView, searchQuery }: any) => {
    const [selectedFilter, setSelectedFilter] = useState("ALL");
    const uniqueProjectTypes = Array.from(new Set(dummyData.map((project) => project.projectType)));
    const projectTypes = ["ALL", ...uniqueProjectTypes];

    const filteredData = () => {
        return dummyData.filter((project) => {
            const matchesType = selectedFilter === "ALL" || project.projectType === selectedFilter;
            const matchesSearch = !searchQuery || project.projectName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesSearch;
        });
    };

    return (
        <div className="p-6 w-full">
            <div className="mb-8 ml-0 md:ml-5 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Project interview</h1>
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 gap-1 w-auto text-sm">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only">Filter</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {projectTypes.map((it, idx) => (
                                <DropdownMenuCheckboxItem
                                    key={idx}
                                    checked={selectedFilter === it}
                                    onSelect={() => setSelectedFilter(it)}
                                >
                                    {it}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className=" p-0 md:p-6 flex flex-col gap-4  sm:px-6 sm:py-0 md:gap-8  pt-2 pl-0 sm:pt-4 sm:pl-6 md:pt-6 md:pl-8  relative">
                <div className="">
                    {
                        filteredData().length === 0 ? (
                            <div className="text-center text-gray-500 py-6">
                                No related data found.
                            </div>
                        ) :
                            !isTableView ?
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredData().map((project) => (
                                        <Card key={project._id} className="hover:shadow-lg transition-shadow duration-300 p-5 border rounded-xl">
                                            <CardHeader>
                                                <div className="flex justify-start gap-3 items-center">
                                                    <CardTitle className="text-lg font-semibold">{project.projectName}</CardTitle>
                                                    {project.verified && <Verified className="text-green-500" />}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm mb-3">{project.description}</p>

                                                <div className="mb-3">
                                                    <p className="text-xs font-medium">Role: <span className="font-semibold">{project.role}</span></p>
                                                    <p className="text-xs font-medium">Type: <span className="font-semibold">{project.projectType}</span></p>
                                                </div>

                                                <p className="text-xs font-medium">Tech Used:</p>
                                                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                                    {project.techUsed.map((tech) => (
                                                        <Badge key={tech} className="bg-blue-500 hover:text-black text-white text-xs px-2 py-1">{tech}</Badge>
                                                    ))}
                                                </div>

                                                <div className="mb-3">
                                                    <p className="text-xs font-medium">Reference: <span className="font-semibold">{project.refer}</span></p>
                                                    <p className="text-xs font-medium">Comments: <span className="italic">{project.comments}</span></p>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex justify-between items-center mt-5">
                                                <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="outline" className="flex items-center gap-2 text-xs px-3 py-2">
                                                        <Github /> GitHub
                                                    </Button>
                                                </a>
                                                <Badge className={`px-3 hover:text-black py-1 text-xs text-white ${project.verificationStatus === "VERIFIED" ? "bg-green-500" :
                                                    project.verificationStatus === "REJECTED" ? "bg-red-500" : "bg-yellow-500"
                                                    }`}>
                                                    {project.verificationStatus}
                                                </Badge>
                                            </CardFooter>
                                        </Card>

                                    ))}
                                </div>
                                :
                                <div className="w-full bg-card  mx-auto px-4 md:px-10 py-6 border border-gray-200 rounded-xl shadow-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-">
                                                <TableCell>Project Name</TableCell>
                                                <TableCell>Role</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Tech Used</TableCell>
                                                <TableCell>Reference</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>GitHub</TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredData().map((project) => (
                                                <TableRow key={project._id}>
                                                    <TableCell>{project.projectName}</TableCell>
                                                    <TableCell>{project.role}</TableCell>
                                                    <TableCell>{project.projectType}</TableCell>
                                                    <TableCell>
                                                        <ScrollArea className="max-w-32 overflow-x-auto">
                                                            <div className="flex gap-1 mb-3">
                                                                {project.techUsed.map((tech, idx) => (
                                                                    <Badge key={idx} className="bg-blue-500 hover:text-black text-white text-xs px-2 py-1 whitespace-nowrap">
                                                                        {tech}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                            <ScrollBar orientation="horizontal" />
                                                        </ScrollArea>
                                                    </TableCell>
                                                    <TableCell>{project.refer}</TableCell>
                                                    <TableCell>
                                                        <Badge className={`px-3 py-1 text-xs text-white hover:text-black ${project.verificationStatus === "VERIFIED" ? "bg-green-500" : project.verificationStatus === "REJECTED" ? "bg-red-500" : "bg-yellow-500"}`}>
                                                            {project.verificationStatus}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                                                            <Button variant="outline" className="flex items-center gap-2 text-xs px-3 py-2">
                                                                <Github /> GitHub
                                                            </Button>
                                                        </a>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                    }
                </div>

            </div>
        </div>
    );
};

export default Projects;
