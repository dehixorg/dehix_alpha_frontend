"use client";
import * as React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface CompanyCardProps {
    heading: string;
    checkboxLabels: string[];
}

const CompanyCard: React.FC<CompanyCardProps> = ({ heading, checkboxLabels }) => {
    const [checkboxStates, setCheckboxStates] = React.useState<boolean[]>(new Array(checkboxLabels.length).fill(false));

    const handleCheckboxChange = (index: number) => {
        setCheckboxStates((prevStates) => {
            const newStates = new Array(prevStates.length).fill(false); // Reset all to false
            newStates[index] = true; // Set the clicked checkbox to true
            return newStates;
        });
    };

    return (
        <Card className="w-[250px] h-[120px]">
            <CardContent>
                <h1 className="mt-2">{heading}</h1>
                <div className="items-center p-2">
                    {checkboxLabels.map((label, index) => (
                        <div key={index} className="flex items-center mb-1">
                            <input 
                                type="checkbox" 
                                checked={checkboxStates[index]} 
                                onChange={() => handleCheckboxChange(index)} 
                                className="mr-2" 
                            />
                            <label className="text-sm">{label}</label>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default CompanyCard;
