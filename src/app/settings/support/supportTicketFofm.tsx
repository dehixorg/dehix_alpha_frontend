import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

const allowedFileFormats = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'application/pdf',
];
const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes

interface Ticket {
  subject: string;
  _id: string;
  customerID: string;
  customerType: string;
  description: string;
  status: string;
  filesAttached: string;
}

const TicketForm = () => {
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [customerID, setCustomerID] = useState<string>(''); // generate customer Id accordinly ......?????
  const [customerType, setCustomerType] = useState<string>('business');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<Ticket | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axiosInstance.get('/ticket'); /////here may be ticket id need
        setTickets(response.data.data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An error occurred while fetching tickets.',
        });
      }
    };
    fetchTickets();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (
      selectedFile &&
      allowedFileFormats.includes(selectedFile.type) &&
      selectedFile.size <= maxFileSize
    ) {
      setFile(selectedFile);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Upload a PNG, JPEG, GIF, or PDF file smaller than 5MB',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description || !customerID) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }
    let fileUrl = '';
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const postResponse = await axiosInstance.post(
          '/register/upload-image',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        const { Location } = postResponse.data.data;
        fileUrl = Location;
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'Failed to upload the file. Please try again.',
        });
        return;
      }
    }
    const ticketData = {
      customerID,
      customerType,
      description,
      status: 'created',
      subject,
      filesAttached: fileUrl,
    };

    try {
      // Create a new ticket using POST
      const response = await axiosInstance.post('/ticket', ticketData);
      toast({
        title: 'Ticket Submitted',
        description: 'Ticket created successfully.',
      });
      setTickets((prevTickets) => [...prevTickets, response.data.data]);
      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit ticket.',
      });
    }
  };
  const resetForm = () => {
    setSubject('');
    setDescription('');
    setCustomerID('');
    setCustomerType('business');
    // setFile(null);
  };

  const openEditDialog = (ticket: Ticket) => {
    setEditingTicketId(ticket._id);
    setSubject(ticket.subject);
    setDescription(ticket.description);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicketId || !subject || !description) return;

    let fileUrl = ticketDetails?.filesAttached || '';
    if (file) {
      // Upload the new file if provided
      try {
        const formData = new FormData();
        formData.append('file', file);

        const postResponse = await axiosInstance.post(
          '/register/upload-image',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        const { Location } = postResponse.data.data;
        fileUrl = Location;
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'Failed to upload the file. Please try again.',
        });
        return;
      }
    }

    try {
      const response = await axiosInstance.put(`/ticket/${editingTicketId}`, {
        subject,
        description,
        filesAttached: fileUrl,
      });

      if (response.status === 200) {
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket._id === editingTicketId
              ? { ...ticket, subject, description, filesAttached: fileUrl }
              : ticket,
          ),
        );
        toast({
          title: 'Ticket Updated',
          description: 'The ticket has been successfully updated.',
        });
        setIsEditDialogOpen(false);
        resetForm();
      } else {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not update the ticket.',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while updating the ticket.',
      });
    }
  };

  const openDetailDialog = (ticket: Ticket) => {
    setTicketDetails(ticket);
    setIsDetailDialogOpen(true); // Open the details dialog
  };

  return (
    <div className="max-w-7xl mx-auto bg-background p-6 rounded shadow-md">
      {/* Create Ticket Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsDialogOpen(true)} className="mt-8">
            Create Ticket
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Create a New Ticket</DialogTitle>
          <DialogDescription>
            Fill out the form to submit a support ticket.
          </DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
            <Input
              id="customerID"
              placeholder="Customer ID"
              value={customerID}
              onChange={(e) => setCustomerID(e.target.value)}
              required
            />
            <Input
              id="subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <Textarea
              id="description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
            <Input
              id="file"
              type="file"
              accept={allowedFileFormats.join(',')}
              onChange={handleFileChange}
            />
            {/* <ProfilePictureUpload user_id={''} profile={''}/> */}
            <Button type="submit">Submit Ticket</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Ticket Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogTitle>Edit Ticket</DialogTitle>
          <DialogDescription>
            Update the subject and description of the ticket.
          </DialogDescription>
          <form onSubmit={handleEditSubmit} className="space-y-4 flex flex-col">
            <Input
              id="edit-subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <Textarea
              id="edit-description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />

            <Button type="submit">Update Ticket</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent>
          <DialogTitle>Ticket Details</DialogTitle>
          <DialogDescription>
            View the full details of the ticket.
          </DialogDescription>
          {ticketDetails && (
            <>
              <div>Subject: {ticketDetails.subject}</div>
              <div>Customer ID: {ticketDetails.customerID}</div>
              <div>Status: {ticketDetails.status}</div>
              <div>Customer Type: {ticketDetails.customerType}</div>
              <div>Description: {ticketDetails.description}</div>
              <div>
                Files Attached:{' '}
                {ticketDetails.filesAttached ? (
                  allowedFileFormats.includes(
                    ticketDetails.filesAttached.split('.').pop() || '',
                  ) ? (
                    <div className="flex flex-col items-center">
                      <Image
                        src={ticketDetails.filesAttached}
                        alt="Attached file"
                        width={300} // Set the width based on your design
                        height={300} // Set the height based on your design
                        className="object-contain mb-4"
                      />
                      <span className="text-gray-500 text-sm">
                        {ticketDetails.filesAttached.split('/').pop()}
                      </span>
                    </div>
                  ) : (
                    <a
                      href={ticketDetails.filesAttached}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {ticketDetails.filesAttached.split('/').pop()}
                    </a>
                  )
                ) : (
                  'None'
                )}
              </div>
            </>
          )}
          <Button onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Display Tickets Table */}
      <div className="mt-2">
        <Card className="h-[65.4vh] overflow-auto no-scrollbar">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>File Attached</TableHead>
                <TableHead>Actions</TableHead> {/* New column for buttons */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>{ticket.status}</TableCell>
                    <TableCell>
                      {ticket.filesAttached ? (
                        allowedFileFormats.includes(
                          ticket.filesAttached.split('.').pop() || '',
                        ) ? (
                          <Image
                            src={ticket.filesAttached}
                            alt="Attached file"
                            width={80} // Adjust according to your design
                            height={80} // Adjust according to your design
                            className="object-cover"
                          />
                        ) : (
                          <a
                            href={ticket.filesAttached}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            {ticket.filesAttached.split('/').pop()}
                          </a>
                        )
                      ) : (
                        'None'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-row">
                        <Button onClick={() => openEditDialog(ticket)}>
                          Edit
                        </Button>
                        <Button
                          onClick={() => openDetailDialog(ticket)}
                          className="mx-2"
                        >
                          Open Ticket
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No tickets available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default TicketForm;
