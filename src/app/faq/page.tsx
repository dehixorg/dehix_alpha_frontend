'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  ThumbsUp,
  Clock,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { faqService, FAQ } from '@/services/faqService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FaqDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editData, setEditData] = useState<Partial<FAQ>>({});
  const faqId = searchParams.get('id');

  useEffect(() => {
    if (faqId) {
      loadFAQ(faqId);
    } else {
      setIsLoading(false);
    }
  }, [faqId]);

  const loadFAQ = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await faqService.getFAQById(id);
      setFaq(data);
      setEditData({ ...data });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load FAQ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FAQ, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUrlChange = (
    index: number,
    field: 'url' | 'urlName',
    value: string,
  ) => {
    if (!editData.importantUrl) return;

    const updatedUrls = [...editData.importantUrl];
    updatedUrls[index] = {
      ...updatedUrls[index],
      [field]: value,
    };

    handleInputChange('importantUrl', updatedUrls);
  };

  const addUrl = () => {
    handleInputChange('importantUrl', [
      ...(editData.importantUrl || []),
      { urlName: '', url: '' },
    ]);
  };

  const removeUrl = (index: number) => {
    if (!editData.importantUrl) return;

    const updatedUrls = [...editData.importantUrl];
    updatedUrls.splice(index, 1);
    handleInputChange('importantUrl', updatedUrls);
  };

  const handleSave = async () => {
    if (!faq?.id) return;

    try {
      await faqService.updateFAQ(faq.id, editData);
      await loadFAQ(faq.id);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'FAQ updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update FAQ',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!faq?.id) return;

    try {
      await faqService.deleteFAQ(faq.id);
      toast({
        title: 'Success',
        description: 'FAQ deleted successfully',
      });
      router.push('/faqs');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete FAQ',
        variant: 'destructive',
      });
    }
  };

  const markAsHelpful = async () => {
    if (!faq?.id) return;

    try {
      await faqService.markAsHelpful(faq.id);
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been recorded',
      });
      if (faq) {
        setFaq({
          ...faq,
          helpfulVotes: (faq.helpfulVotes || 0) + 1,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record feedback',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!faq) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">FAQ not found</h2>
        <p className="text-muted-foreground mt-2">
          The requested FAQ could not be found.
        </p>
        <Button className="mt-4" onClick={() => router.push('/faqs')}>
          Back to FAQs
        </Button>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: 'The text has been copied to your clipboard.',
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">FAQ Details</h1>
        <div className="flex gap-2">
          <Badge variant={faq.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {faq.status}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {faq.type.toLowerCase()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="ml-2"
          >
            <Pencil className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete FAQ</DialogTitle>
              </DialogHeader>
              <p>
                Are you sure you want to delete this FAQ? This action cannot be
                undone.
              </p>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="question"
                  className="text-sm font-medium mb-1 block"
                >
                  Question
                </label>
                <Input
                  id="question"
                  value={editData.question || ''}
                  onChange={(e) =>
                    handleInputChange('question', e.target.value)
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="text-sm font-medium mb-1 block"
                >
                  Status
                </label>
                <Select
                  value={editData.status}
                  onValueChange={(value: 'ACTIVE' | 'INACTIVE') =>
                    handleInputChange('status', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="text-sm font-medium mb-1 block"
                >
                  Type
                </label>
                <Select
                  value={editData.type}
                  onValueChange={(value: 'BUSINESS' | 'FREELANCER') =>
                    handleInputChange('type', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="FREELANCER">Freelancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <CardTitle className="text-2xl">{faq.question}</CardTitle>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="mb-6">
              <label
                htmlFor="answer"
                className="text-sm font-medium mb-1 block"
              >
                Answer
              </label>
              <Textarea
                id="answer"
                value={editData.answer || ''}
                onChange={(e) => handleInputChange('answer', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          ) : (
            <p className="text-lg mb-6">{faq.answer}</p>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-muted-foreground mb-2">
                Related URLs
              </h3>
              {isEditing ? (
                <div className="space-y-4">
                  {editData.importantUrl?.map((url, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label
                          htmlFor={`url-name-${index}`}
                          className="text-xs text-muted-foreground block mb-1"
                        >
                          URL Name
                        </label>
                        <Input
                          id={`url-name-${index}`}
                          value={url.urlName}
                          onChange={(e) =>
                            handleUrlChange(index, 'urlName', e.target.value)
                          }
                          placeholder="e.g. Documentation"
                        />
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor={`url-${index}`}
                          className="text-xs text-muted-foreground block mb-1"
                        >
                          URL
                        </label>
                        <div className="flex gap-2">
                          <Input
                            id={`url-${index}`}
                            value={url.url}
                            onChange={(e) =>
                              handleUrlChange(index, 'url', e.target.value)
                            }
                            placeholder="https://example.com"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeUrl(index)}
                            disabled={editData.importantUrl?.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addUrl}
                  >
                    Add URL
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {faq.importantUrl?.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <a
                        href={url.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {url.urlName || 'View Link'}{' '}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(url.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground mb-2">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {faq.badges?.length ? (
                  faq.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary">
                      {badge}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No badges assigned
                  </span>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>FAQ Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {(faq.views || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Helpful Votes</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{faq.helpfulVotes || 0}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={markAsHelpful}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Helpful
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(faq.lastUpdated)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel Editing' : 'Edit FAQ'}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => copyToClipboard(window.location.href)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={markAsHelpful}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Mark as Helpful
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FaqDetail;
