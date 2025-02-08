"use client";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ListFilter } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Dummy data for interviewers
const dummyData = [
    {
        _id: "1",
        type: "SKILL",
        talentId: "t12345",
        talentName: "React",
        experience: "4 years",
        interviewFees: "$250",
        level: "Intermediate",
        status: "approved",
        interviews: ["React Basics", "Hooks & State Management"],
        activeStatus: true,
    },
    {
        _id: "2",
        type: "SKILL",
        talentId: "t67890",
        talentName: "React Native",
        experience: "6 years",
        interviewFees: "$350",
        level: "Senior",
        status: "pending",
        interviews: ["React Native Performance", "Expo vs CLI"],
        activeStatus: false,
    },
    {
        _id: "3",
        type: "DOMAIN",
        talentId: "t54321",
        talentName: "Full Stack",
        experience: "5 years",
        interviewFees: "$400",
        level: "Senior",
        status: "approved",
        interviews: ["Next.js & Server-side Rendering", "Database Integration"],
        activeStatus: true,
    },
    {
        _id: "4",
        type: "DOMAIN",
        talentId: "t98765",
        talentName: "Frontend",
        experience: "3 years",
        interviewFees: "$200",
        level: "Junior",
        status: "pending",
        interviews: ["CSS-in-JS with Styled Components", "Responsive UI"],
        activeStatus: true,
    },
    {
        _id: "5",
        type: "SKILL",
        talentId: "t24680",
        talentName: "React",
        experience: "7 years",
        interviewFees: "$500",
        level: "Expert",
        status: "approved",
        interviews: ["Advanced React Patterns", "Performance Optimization"],
        activeStatus: true,
    },
    {
        _id: "6",
        type: "DOMAIN",
        talentId: "t13579",
        talentName: "MERN Stack",
        experience: "4 years",
        interviewFees: "$280",
        level: "Intermediate",
        status: "pending",
        interviews: ["MongoDB & Express.js", "React with Node.js"],
        activeStatus: true,
    },
    {
        _id: "7",
        type: "SKILL",
        talentId: "t86420",
        talentName: "TypeScript",
        experience: "5 years",
        interviewFees: "$350",
        level: "Senior",
        status: "approved",
        interviews: ["TypeScript with React", "Error Handling & Debugging"],
        activeStatus: true,
    },
    {
        _id: "8",
        type: "DOMAIN",
        talentId: "t97531",
        talentName: "UI/UX",
        experience: "6 years",
        interviewFees: "$320",
        level: "Senior",
        status: "pending",
        interviews: ["UI/UX Principles", "User Testing with React Apps"],
        activeStatus: false,
    },
    {
        _id: "9",
        type: "SKILL",
        talentId: "t11223",
        talentName: "React Performance",
        experience: "8 years",
        interviewFees: "$600",
        level: "Expert",
        status: "approved",
        interviews: ["React Fiber Architecture", "Optimization Techniques"],
        activeStatus: true,
    },
    {
        _id: "10",
        type: "SKILL",
        talentId: "t44556",
        talentName: "Next.js",
        experience: "5 years",
        interviewFees: "$400",
        level: "Senior",
        status: "approved",
        interviews: ["Next.js Routing", "API Routes & Middleware"],
        activeStatus: true,
    },
];

const DehixInterviews = ({ filter, isTableView, searchQuery }: any) => {

    const [skillData, setSkillData] = useState(dummyData.filter((it) => it.type == "SKILL"));
    const [domainData, setDomainData] = useState(dummyData.filter((it) => it.type == "DOMAIN"));

    const filteredData = () => {
        let data = filter === 'All' ? [...skillData, ...domainData] :
            filter === 'Skills' ? skillData :
                filter === 'Domain' ? domainData : [];

        if (searchQuery) {
            data = data.filter((item) =>
                item.talentName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return data;
    };

    return (
        <div className="p-6 w-full">
            <div className="mb-8  ml-0 md:ml-5 ">
                <h1 className="text-2xl font-bold">Dehix-talent interview</h1>
            </div>
            <div className=" p-0 md:p-6 flex flex-col gap-4  sm:px-6 sm:py-0 md:gap-8  pt-2 pl-0 sm:pt-4 sm:pl-6 md:pt-6 md:pl-8  relative">
                <div >
                    {
                        filteredData().length === 0 ? (
                            <div className="text-center text-gray-500 py-6">
                                No related data found.
                            </div>
                        ) : isTableView ?
                            <div className="w-full bg-card  mx-auto px-4 md:px-10 py-6 border border-gray-200 rounded-xl shadow-md">
                                <Table >
                                    <TableHeader>
                                        <TableRow className="">
                                            <TableHead className="w-[180px] text-center font-medium">Talent Name</TableHead>
                                            <TableHead className=" font-medium text-center ">Experience</TableHead>
                                            <TableHead className=" font-medium text-center">Interview Fees</TableHead>
                                            <TableHead className=" font-medium text-center">Level</TableHead>
                                            <TableHead className=" font-medium text-center">Status</TableHead>
                                            <TableHead className="  font-medium text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredData()!.map((interview) => (
                                            <TableRow key={interview._id} className=" transition">
                                                <TableCell className="py-3 text-center">{interview.talentName}</TableCell>
                                                <TableCell className="py-3 text-center">{interview.experience}</TableCell>
                                                <TableCell className="py-3 text-center">{interview.interviewFees}</TableCell>
                                                <TableCell className="py-3 text-center">{interview.level}</TableCell>
                                                <TableCell className="py-3 text-center">
                                                    <Badge
                                                        variant={interview.status === "pending" ? "outline" : "default"}
                                                        className="px-2 py-1 text-sm"
                                                    >
                                                        {interview.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right py-3">
                                                    <Button variant="outline" size="sm" className="mr-3">
                                                        Edit
                                                    </Button>
                                                    <Button size="sm">View</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            :
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredData()!.map((interview) => (
                                    <Card key={interview._id} className="p-5 rounded-2xl shadow-lg ">
                                        <CardHeader className=" rounded-t-xl p-4">
                                            <CardTitle className="text-xl font-semibold">{interview.talentName}</CardTitle>
                                            <CardDescription className="text-sm">{interview.level}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                            <p className="text-sm flex items-center gap-2">
                                                <span className="font-medium">💼 Experience:</span> {interview.experience}
                                            </p>
                                            <p className="text-sm flex items-center gap-2">
                                                <span className="font-medium">💰 Interview Fees:</span> {interview.interviewFees}
                                            </p>
                                            <p className="text-sm flex items-center gap-2">
                                                <span className="font-medium">📌 Status:</span>{" "}
                                                <Badge variant={interview.status === "pending" ? "outline" : "default"} className="px-2 py-0.5 text-sm">
                                                    {interview.status}
                                                </Badge>
                                            </p>
                                        </CardContent>
                                        <CardFooter className="flex justify-between p-4  rounded-b-xl">
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button size="sm">View</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                    }
                </div>
            </div>
        </div>

    );
};

export default DehixInterviews;
