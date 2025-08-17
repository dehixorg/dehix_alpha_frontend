'use client';
import type React from 'react';
import { useState, useEffect } from 'react';
import { PackageOpen } from 'lucide-react';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface ProjectRequest {
  id: string;
  projectName: string;
  projectDomain: string;
  monthlyPay: number;
  status: 'pending' | 'accepted' | 'rejected';
  clientName: string;
  startDate: string;
  duration: string;
}

const RequestManagementTable: React.FC = () => {
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dummy data
        const dummyData: ProjectRequest[] = [
          {
            id: '1',
            projectName: 'E-commerce Platform',
            projectDomain: 'Web Development',
            monthlyPay: 5000,
            status: 'pending',
            clientName: 'TechCorp Inc.',
            startDate: '2023-11-01',
            duration: '6 months'
          },
          {
            id: '2',
            projectName: 'Mobile Banking App',
            projectDomain: 'FinTech',
            monthlyPay: 7500,
            status: 'pending',
            clientName: 'Global Bank',
            startDate: '2023-12-15',
            duration: '9 months'
          },
          {
            id: '3',
            projectName: 'AI Chatbot',
            projectDomain: 'Artificial Intelligence',
            monthlyPay: 6500,
            status: 'pending',
            clientName: 'InnovateAI',
            startDate: '2024-01-10',
            duration: '4 months'
          },
          {
            id: '4',
            projectName: 'Supply Chain Optimization',
            projectDomain: 'Logistics',
            monthlyPay: 8000,
            status: 'pending',
            clientName: 'LogiSolutions',
            startDate: '2023-11-20',
            duration: '12 months'
          },
          {
            id: '5',
            projectName: 'Healthcare Analytics Dashboard',
            projectDomain: 'Healthcare IT',
            monthlyPay: 7000,
            status: 'pending',
            clientName: 'MediTech Systems',
            startDate: '2024-02-01',
            duration: '8 months'
          }
        ];
        
        setRequests(dummyData);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load project requests. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === id ? { ...request, status: 'accepted' } : request
        )
      );
      
      toast({
        title: 'Project Accepted',
        description: 'You have successfully accepted this project request.',
      });
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to accept the project request. Please try again.',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === id ? { ...request, status: 'rejected' } : request
        )
      );
      
      toast({
        title: 'Project Rejected',
        description: 'You have declined this project request.',
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject the project request. Please try again.',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 mt-2">
      <div className="mb-8 mt-1 ml-2">
        <h1 className="text-3xl font-bold">Project Requests</h1>
        <p className="text-gray-400 mt-2">
          Manage incoming project requests from clients. Accept or reject based on your availability.
        </p>
      </div>
      <div className="px-4">
        <div className="mb-8 mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead className="text-center">Monthly Pay ($)</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-6 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="mx-auto h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Skeleton className="h-9 w-16" />
                          <Skeleton className="h-9 w-16" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.projectName}</TableCell>
                      <TableCell>{request.clientName}</TableCell>
                      <TableCell>{request.projectDomain}</TableCell>
                      <TableCell className="text-center">{request.monthlyPay.toLocaleString()}</TableCell>
                      <TableCell>{request.duration}</TableCell>
                      <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleAccept(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleReject(request.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-500">Action completed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      <div className="text-center py-10 w-[90vw] h-[30vw] mt-10">
                        <PackageOpen
                          className="mx-auto text-gray-500"
                          size="100"
                        />
                        <p className="text-gray-500">
                          No project requests available.
                          <br /> When clients send you project requests, they will appear here.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequestManagementTable;