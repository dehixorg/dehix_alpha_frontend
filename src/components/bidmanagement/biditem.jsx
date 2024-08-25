'use client';

import React, { useState, useEffect } from 'react';
import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BidItem = ({ bid, onAction }) => {
  const [projectName, setProjectname] = useState(''); 
  const [bidderName, setbiddername] = useState(''); 
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const { _id, current_price, project_id, bidder_id } = bid;
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const fetchProjectname = async () => {
      try {
        const response = await axiosInstance.get(`/business/${project_id}/project`);
        const name = response.data.data.projectName;
        setProjectname(name);
      } catch (error) {
        console.error('Error fetching project name:', error);
      }
    };

    fetchProjectname();
  }, [project_id]);

  useEffect(() => {
    const fetchbiddername = async () => {
      try {
        const response = await axiosInstance.get(`/freelancer/${bidder_id}`);
        const name = response.data.userName;
        setbiddername(name);
      } catch (error) {
        console.error('Error fetching bidder name:', error);
      }
    };

    fetchbiddername();
  }, [bidder_id]);

  const handleActionClick = async (actionType) => {
    try {
      await onAction(_id, actionType);
      if(actionType === 'Lobby') {
        setStatusMessage('Candidate shifted to Lobby');
      } else if (actionType === 'Schedule Interview') {
        setStatusMessage('Candidate is to be interviewed');
      } else {
        setStatusMessage('Candidate ${actionType}ed');
      }
      setButtonsVisible(false); 
    } catch (error) {
      setStatusMessage('Error performing ${actionType} action.');
      console.error('Error updating bid status:', error);
    }
  };

  return (
    <Card className="p-4 mb-4 rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Project: {projectName}</CardTitle>
        <CardDescription>Current Price: ${current_price}</CardDescription>
        <CardDescription>Bidder: {bidderName}</CardDescription>
      </CardHeader>
      <CardContent>
        {buttonsVisible && (
          <div className="actions mt-4">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={() => handleActionClick('Accept')}
            >
              Accept
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={() => handleActionClick('Reject')}
            >
              Reject
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={() => handleActionClick('Lobby')}
            >
              Lobby
            </Button>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={() => handleActionClick('Schedule Interview')}
            >
              Schedule Interview
            </Button>
          </div>
        )}
      </CardContent>
      {statusMessage && (
        <CardFooter>
          <p className="text-lg font-semibold text-green-400">{statusMessage}</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default BidItem;