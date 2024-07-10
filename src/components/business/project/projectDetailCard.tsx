

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import { Badge } from "@/components/ui/badge"
function ProjectDetailCard() {
  return (
    <div>
        <Card className="" >
                <CardHeader className="pb-3">
                  <CardTitle>Project Name</CardTitle>
                  <CardDescription className="">
                  <div className='mt-4 grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-4 xl:grid-cols-4'>
                    <div className='grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3 border-r-2 pr-6 border-gray-300'>
                        Welcome to our project! This initiative aims to [briefly describe the main goal or purpose of the project]. Through this project, we intend to [mention key objectives or outcomes]. Our team is dedicated to [highlight any unique approaches or methodologies]. We believe this project will [state the expected impact or benefits]. Feel free to replace the placeholders with specific details about your project. If you need further customization or additional sections, let me know!
                        <br/><br/>
                        Welcome to our project! This initiative aims to [briefly describe the main goal or purpose of the project]. Through this project, we intend to [mention key objectives or outcomes]. Our team is dedicated to [highlight any unique approaches or methodologies]. We believe this project will [state the expected impact or benefits]. Feel free to replace the placeholders with specific details about your project. If you need further customization or additional sections, let me know!   
                        <div className=' ml-4' >
                          <ul className='flex flex-wrap gap-4'>
                            <li className="min-w-[45%] ">
                              <span className='text-gray-700 font-semibold '>Email- </span> arpit@xyz.com
                            </li>
                            <li className="min-w-[45%] ">
                              <span className='text-gray-700 font-semibold '>Staus- </span> Current
                            </li>
                            <li className="min-w-[45%] ">
                              <span className='text-gray-700 font-semibold '>Start Date- </span> 22/22/2222
                            </li>
                            <li className="min-w-[45%] ">
                              <span className='text-gray-700 font-semibold '>End date- </span> 24/22/2222
                            </li>
                          </ul>
                        </div>
                    </div>
                    <div className=" ">
                       
                        <div className='my-4'>
                        <h4 className="text-center scroll-m-20 text-xl font-semibold tracking-tight transition-colors first:mt-0">Project Domains</h4>
                          <div className='flex flex-wrap gap-x-4 gap-y-2 my-2'> 
                          <Badge>Frontend</Badge>
                          <Badge>Blackend</Badge>
                          <Badge>Graphic Designer</Badge>
                          <Badge>3D artist</Badge>
                          <Badge>Fullstack</Badge>
                          </div>
                        </div>
                        <div className='pt-4'>
                        <h4 className="text-center scroll-m-20 text-xl font-semibold tracking-tight transition-colors first:mt-0">Skills</h4>
                          <div className='flex flex-wrap gap-x-4 gap-y-2 my-4'> 
                          <Badge>React</Badge>
                          <Badge>Mongo</Badge>
                          <Badge>Golang</Badge>
                          <Badge>API integration</Badge>
                          <Badge>Figma</Badge>
                          </div>
                        </div>
                      
                    </div>
                  </div>
                  </CardDescription>
                </CardHeader>
              </Card>
    </div>
  )
}

export default ProjectDetailCard