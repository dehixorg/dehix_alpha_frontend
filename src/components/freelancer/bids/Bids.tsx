import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const BidsPage = () => {
  const interviewData = [
    {
      interviewId: "f442ba83-cdfb-4cbe-bb66-3d76d8a6a5f6",
      interviewee: {
        id: "pQEiGtdi0vRR4gAsYHqHi5HbiSt2",
        name: "John Doe",
        role: "Software Engineer",
      },
      talentType: "SKILL",
      talentName: "React",
      interviewBids: [
        {
          bidId: "6eaaaf31-04b1-4d00-ab58-0f072683af81",
          interviewer: {
            id: "qcCAoNXxgFZyVyTxK8UZrHzxilz2",
            name: "Alice Smith",
            experience: "5 years",
            skills: ["React", "Node.js", "MongoDB"],
          },
          suggestedDateTime: "2025-01-27T06:04:40.512Z",
          fee: "1000",
          dateTimeAgreement: true,
          status: "pending",
        },
        {
          bidId: "6eaaaf31-04b1-4d003-ab58-0f072683af81",
          interviewer: {
            id: "qcCAoNXxgFZyVyTxK8UZrHzxilz2",
            name: "Alice Smith",
            experience: "5 years",
            skills: ["React", "Node.js", "MongoDB"],
          },
          suggestedDateTime: "2025-01-27T06:04:40.512Z",
          fee: "1000",
          dateTimeAgreement: true,
          status: "pending",
        },
        {
          bidId: "6eaaaf31-04b1-4d3200-ab58-0f072683af81",
          interviewer: {
            id: "qcCAoNXxgFZyVyTxK8UZrHzxilz2",
            name: "Alice Smith",
            experience: "5 years",
            skills: ["React", "Node.js", "MongoDB"],
          },
          suggestedDateTime: "2025-01-27T06:04:40.512Z",
          fee: "1000",
          dateTimeAgreement: true,
          status: "pending",
        },
      ],
    },
    {
      interviewId: "b882cb93-cdfb-4a7b-aa23-3d76d8a6a9f7",
      interviewee: {
        id: "xyz456",
        name: "Emma Watson",
        role: "Data Scientist",
      },
      talentType: "DOMAIN",
      talentName: "Machine learning",
      interviewBids: [
        {
          bidId: "d5f6g7h8-04b1-4dsdf00-ab58-0f072683af81",
          interviewer: {
            id: "lmn7s89",
            name: "David Johnson",
            experience: "6 years",
            skills: ["Python", "TensorFlow", "Deep Learning"],
          },
          suggestedDateTime: "2025-02-10T14:00:00.512Z",
          fee: "1500",
          dateTimeAgreement: false,
          status: "pending",
        },
        {
          bidId: "d5f6g7h8-04b1-4dfhg00-ab58-0f072683af81",
          interviewer: {
            id: "lmnd789",
            name: "David Johnson",
            experience: "6 years",
            skills: ["Python", "TensorFlow", "Deep Learning"],
          },
          suggestedDateTime: "2025-02-10T14:00:00.512Z",
          fee: "1500",
          dateTimeAgreement: false,
          status: "pending",
        },
        {
          bidId: "d5f6g7h8-04b1-4d0fh0-ab58-0f072683af81",
          interviewer: {
            id: "lmnsa789",
            name: "David Johnson",
            experience: "6 years",
            skills: ["Python", "TensorFlow", "Deep Learning"],
          },
          suggestedDateTime: "2025-02-10T14:00:00.512Z",
          fee: "1500",
          dateTimeAgreement: false,
          status: "pending",
        },
      ],
    },
  ];

  const [bidsData, setBidsData] = useState(interviewData);

  const handleAction = (interviewId: string, bidId: string, action: string) => {
    setBidsData((prevData) =>
      prevData.map((interview) => {
        if (interview.interviewId === interviewId) {
          return {
            ...interview,
            interviewBids: interview.interviewBids.map((bid) => {
              if (bid.bidId === bidId) {
                return { ...bid, status: action }; // Only update the clicked bid
              }
              // If one bid is accepted, reject all other bids
              if (action === "accepted") {
                return { ...bid, status: bid.status === "accepted" ? "accepted" : "rejected" };
              }
              return bid; // Keep other bids unchanged
            }),
          };
        }
        return interview;
      })
    );
  };
  
  return (
    <div className=" w-[84vw] mx-auto p-6">
      <Accordion type="single" collapsible  defaultValue={bidsData.length > 0 ? bidsData[0].interviewId : undefined}>
        {bidsData.map((interview) => (
          <AccordionItem key={interview.interviewId} value={interview.interviewId} >
            <AccordionTrigger className="text-xl w-full font-semibold hover:no-underline">
              {interview.talentName}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
                {interview.interviewBids.map((bid) => (
                  <Card key={bid.bidId} className="shadow-lg p-4 rounded-xl hover:shadow-xl transition-all">
                    <CardContent className="flex flex-col gap-3">
                      <p className="text-lg font-semibold">{bid.interviewer.name}</p>
                      <p className="text-sm">Experience: <span className="font-semibold">{bid.interviewer.experience}</span></p>
                      <p className="text-sm">Skills: <span className="font-semibold">{bid.interviewer.skills.join(", ")}</span></p>
                      <p className="text-sm">Suggested Time: <span className="font-semibold">{new Date(bid.suggestedDateTime).toLocaleString()}</span></p>
                      <p className="text-sm">Fee: <span className="font-semibold">${bid.fee}</span></p>
                      <p className={`text-sm font-semibold ${
                        bid.status === "accepted" ? "text-green-600" :
                        bid.status === "rejected" ? "text-red-600" :
                        "text-yellow-600"
                      }`}>
                        {bid.status.toUpperCase()}
                      </p>

                      {bid.status === "pending" && (
                        <div className="flex gap-3 mt-2">
                          <Button
                            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md"
                            onClick={() => handleAction(interview.interviewId, bid.bidId, "accepted")}
                          >
                            Accept
                          </Button>
                          <Button
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
                            onClick={() => handleAction(interview.interviewId, bid.bidId, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default BidsPage;