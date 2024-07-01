import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  
  import React from "react";
  
  interface ProjectCardProps {
    title: string;
    content: string;
    buttonText: string;
    padding?: string;
  }
  
  const ProjectCard: React.FC<ProjectCardProps> = ({
    title,
    content,
    buttonText,
    padding,
  }) => {
    return (
      <div>
        <Card>
          <CardTitle className={padding}>{title}</CardTitle>
          <Button>{buttonText}</Button>
          <CardContent className={padding}>
            <p>{content}</p>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  export default ProjectCard;