import React from "react";
const Portfolio: React.FC = () => {
    return (
        <div className="container max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-[#00ffff] sm:text-3xl">
                Our Portfolio</h2>
            <div className="grid grid-cols-1 gap-8 mt-10 sm:grid-cols-2 lg:grid-cols-3">
                <div className="overflow-hidden rounded-lg">
                    <img alt="Portfolio Item 1" className="object-cover w-full h-auto" height={300} src="/placeholder.svg" width={400} style={{ aspectRatio: "400/300", objectFit: "cover" }} />
                    <div className="bg-[#1a1a1a] p-4">
                        <h3 className="text-xl font-bold text-[#00ffff]">Project Title 1</h3>
                        <p className="mt-2 text-base text-white">A brief description of the project.</p>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg">
                    <img alt="Portfolio Item 2" className="object-cover w-full h-auto" height={300} src="/placeholder.svg" width={400} style={{ aspectRatio: "400/300", objectFit: "cover" }} />
                    <div className="bg-[#1a1a1a] p-4">
                        <h3 className="text-xl font-bold text-[#00ffff]">Project Title 2</h3>
                        <p className="mt-2 text-base text-white">A brief description of the project.</p>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg">
                    <img alt="Portfolio Item 3" className="object-cover w-full h-auto" height={300} src="\portfolio.jpg" width={400} style={{ aspectRatio: "400/300", objectFit: "cover" }} />
                    <div className="bg-[#1a1a1a] p-4">
                        <h3 className="text-xl font-bold text-[#00ffff]">Project Title 3</h3>
                        <p className="mt-2 text-base text-white">A brief description of the project.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;