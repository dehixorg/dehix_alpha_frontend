import React from "react";
import ProfileCard from "../../../components/dash-comp/profilecard/page";
import ProjectCard from "@/components/dash-comp/card/page";


  const App = () => {
    return (
      <div className=" flex container mx-auto px-4 py-8">
        <div>
        <ProfileCard 
        name= "John Doe"
        email= "john.doe@example.com"
        />
        </div>
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
        
      </div>
    );
  };
  
  export default App;  