import * as React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Activity } from 'lucide-react';
interface CustomCardProps {
    heading: string;
    icon?: React.ElementType; // Assuming `icon` is a component
    content?: string;
}

const CustomCard: React.FC<CustomCardProps> = ({ heading, icon: IconComponent, content }) => {
    return (
        <Card className="w-[350px] h-[199px]">
            <CardHeader>
                <div className="grid grid-cols-[auto,auto] items-center">
                    <CardTitle className="text-white text-3xl font-bold"> {heading}</CardTitle>
                    <div>
                        {IconComponent && <IconComponent />} {/* Render icon if provided */}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div>
                    <h1>{content}</h1>
                </div>
            </CardContent>
        </Card>
    );
};

export default CustomCard;
