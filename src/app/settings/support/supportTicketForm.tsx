import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CopyIcon, LayoutGrid, Loader2, Table } from 'lucide-react';

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
import { Card } from '@/components/ui/card';
import { useAuth } from '@/app/AuthContext';

// const allowedFileFormats = [
//   'image/png',
//   'image/jpeg',
//   'image/gif',
//   'application/pdf',
// ];

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
  const { user } = useAuth();
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [customerID] = useState<string>(user?.uid || ''); // generate customer Id accordinly ......?????
  const [customerType, setCustomerType] = useState<string>('BUSINESS');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState<boolean>(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<string>('card');
  const [ticketDetails, setTicketDetails] = useState<Ticket | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axiosInstance.get(`/ticket?customerID=${user?.uid}`);

        // Filter tickets based on the current freelancer's ID
        const filteredTickets = response.data.data.filter(
          (ticket: Ticket) => ticket.customerID === user?.uid,
        );

        // Set the state with the filtered tickets
        setTickets(filteredTickets);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'An error occurred while fetching tickets.',
        });
      }
    };

    fetchTickets();
  }, [user?.uid]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      // Check for file size limit (e.g., 5MB)
      if (selectedFile.size > maxFileSize) {
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description:
            'The selected file exceeds the size limit of 5MB. Please select a smaller file.',
        });
        return;
      }

      // Check for supported file types (e.g., image or PDF)
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          variant: 'destructive',
          title: 'Unsupported File Type',
          description:
            'The selected file type is not supported. Please upload an image or PDF.',
        });
        return;
      }

      setFile(selectedFile);
      const fileUrl = URL.createObjectURL(selectedFile); // Create a preview URL for the file
      setFilePreview(fileUrl); // Store the preview URL
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Failed to load the file. Please try again.',
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
      customerID: user?.uid,
      customerType,
      description,
      status: 'CREATED',
      subject,
      filesAttached: fileUrl,
    };
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (ticket: Ticket) => {
    setEditingTicketId(ticket._id);
    setSubject(ticket.subject);
    setDescription(ticket.description);
    setIsEditDialogOpen(true);
  };
  const resetForm = () => {
    setSubject('');
    setDescription('');
    setCustomerType('BUSINESS');
    setFile(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicketId || !subject || !description) return;
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const openDetailDialog = (ticket: Ticket) => {
    setTicketDetails(ticket);
    setIsDetailDialogOpen(true); // Open the details dialog
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        toast({
          title: 'ID Copied',
          description: `Ticket ID has been copied to your clipboard.`,
          duration: 1500,
        });
      })
      .catch(() => {
        toast({
          variant: 'destructive',
          title: 'Copy Failed',
          description: 'Failed to copy the Ticket ID.',
        });
      });
  };
  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  return (
    <div className="max-w-8xl mx-auto bg-background p-6 rounded shadow-sm">
      {/* Create Ticket Button */}
      <h1 className=" mt-3 sm:text-3xl">Submit a Support Ticket</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className='flex justify-between items-center'>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)} className="mt-6">
              Create Ticket
            </Button>
          </DialogTrigger>
          <div className="my-4">
            <Button
              onClick={() =>
                setViewMode(viewMode === 'cards' ? 'table' : 'cards')
              }
            >
              {viewMode === 'cards' ? (
                <Table className="w-5 h-5" />
              ) : (
                <LayoutGrid className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
        <DialogContent>
          <DialogTitle>Create a New Ticket</DialogTitle>
          <DialogDescription>
            Fill out the form to submit a support ticket.
          </DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
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
            <div className="file-upload-container w-80 mx-auto mt-6">
              <div
                className="file-upload p-4 border-2 border-dashed border-gray-400 rounded-lg text-center"
                style={{ cursor: 'pointer' }}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {!file ? (
                  <>
                    <p className="text-lg text-gray-500">
                      Click or drag to upload a file
                    </p>
                    <p className="text-sm text-gray-400">
                      Supported formats: Images, PDFs, etc.
                    </p>
                  </>
                ) : (
                  <>
                    {file.type.startsWith('image/') ? (
                      filePreview ? (
                        <Image
                          src={filePreview} // Use the filePreview string directly
                          alt="File Preview"
                          width={200}
                          height={200}
                          className="rounded border mt-4"
                        />
                      ) : (
                        <div className="text-center">
                          <p>Loading preview...</p>
                        </div>
                      )
                    ) : (
                      <div className="p-4 border rounded bg-gray-100">
                        <p className="text-sm">
                          Preview not available for this file type
                        </p>
                        <p className="text-xs text-gray-500">{file.name}</p>
                      </div>
                    )}
                    <button
                      onClick={removeFile}
                      className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove File
                    </button>
                  </>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
              />
            </div>
            <Button disabled={isLoading} type="submit">
              {
                isLoading ?
                  <Loader2 className='animate-spin w-8 h-8' />
                  :
                  'Submit Ticket'
              }
            </Button>
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
            <Button disabled={isLoading} type="submit">
              {
                isLoading ?
                  <Loader2 className='animate-spin w-8 h-8' />
                  :
                  'Update Ticket'
              }
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent>
          <DialogTitle>Ticket Details</DialogTitle>
          <DialogDescription>
            View and edit the details of the ticket.
          </DialogDescription>

          <Card className="p-6 space-y-4 rounded-md shadow-md">
            {/* Ticket Subject */}
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                <strong>Subject: </strong>
                {ticketDetails?.subject}
              </p>
            </div>

            {/* Ticket Description */}
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Description: </strong>
                {ticketDetails?.description}
              </p>
            </div>
            {/* Ticket Status */}
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Status: </strong>
                {ticketDetails?.status}
              </p>
            </div>

            {/* Ticket Files */}
            {ticketDetails?.filesAttached && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  <strong>Attached File:</strong>
                </p>
                <div className="flex flex-col items-start space-y-2">
                  {ticketDetails.filesAttached.match(
                    /\.(jpeg|jpg|gif|png)$/,
                  ) ? (
                    <Image
                      src={ticketDetails.filesAttached}
                      alt="Attached file"
                      width={200}
                      height={200}
                      className="object-cover rounded-md shadow-md"
                    />
                  ) : (
                    <a
                      href={ticketDetails.filesAttached}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View/Download File
                    </a>
                  )}
                </div>
              </div>
            )}
          </Card>
        </DialogContent>
      </Dialog>

      {/* Display Tickets in Card View */}
      {viewMode === 'cards' ? (
        // Card View
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <Card
                key={ticket._id}
                className="p-4 shadow-md rounded-lg border"
              >
                {/* Ticket Subject */}
                <h2 className="text-lg font-semibold">{ticket.subject}</h2>

                {/* Ticket ID with Copy Button */}
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600">{ticket._id}</span>
                  <Button
                    variant="outline"
                    onClick={() => handleCopyId(ticket._id)}
                    size="icon"
                    className="p-1"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Ticket Description */}
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Description:</strong> {ticket.description}
                </p>

                {/* Ticket Status */}
                <p className="text-sm font-medium mt-2">
                  <strong>Status:</strong> {ticket.status}
                </p>

                {/* Ticket Files */}
                {ticket.filesAttached && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Attached File:</p>
                    {ticket.filesAttached.match(/\.(jpeg|jpg|gif|png)$/) ? (
                      <Image
                        src={ticket.filesAttached}
                        alt="Attached file"
                        width={80}
                        height={80}
                        className="rounded-md object-cover mt-2"
                      />
                    ) : (
                      <a
                        href={ticket.filesAttached}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        View/Download File
                      </a>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex justify-between items-center">
                  <Button onClick={() => openEditDialog(ticket)} size="sm">
                    Edit
                  </Button>
                  <Button onClick={() => openDetailDialog(ticket)} size="sm">
                    Open Ticket
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500">No tickets available.</p>
          )}
        </div>
      ) : (
        // Table View
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-white text-black">
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Ticket ID</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td className="px-4 py-2 text-sm border-gray-300">
                      {ticket.subject.length > 45 ? (
                        <>
                          {ticket.description.substring(0, 45)}{' '}
                          <span
                            onClick={() => alert(ticket.subject)}
                            className="text-white-500 cursor-pointer"
                          >
                            ...
                          </span>
                        </>
                      ) : (
                        ticket.subject
                      )}
                    </td>
                    <td className="px-4 py-2">{ticket._id}</td>
                    <td className="px-4 py-2 text-sm border-gray-300">
                      {ticket.description.length > 45 ? (
                        <>
                          {ticket.description.substring(0, 45)}{' '}
                          <span
                            onClick={() => alert(ticket.description)}
                            className="text-white-500 cursor-pointer"
                          >
                            ...
                          </span>
                        </>
                      ) : (
                        ticket.description
                      )}
                    </td>
                    <td className="px-4 py-2">{ticket.status}</td>
                    <td className="px-4 py-2 flex justify-between">
                      <Button
                        onClick={() => openEditDialog(ticket)}
                        size="sm"
                        className="mr-2 mt-2"
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => openDetailDialog(ticket)}
                        size="sm"
                        className="ml-2 mt-2"
                        variant="outline"
                      >
                        Open Ticket
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-2 text-center text-gray-500"
                  >
                    No tickets available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TicketForm;
