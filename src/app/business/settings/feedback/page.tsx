'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import Header from '@/components/header/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/ui/star-rating';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import {
  menuItemsTop,
  menuItemsBottom,
} from '@/config/menuItems/business/settingsMenuItems';
import { Skeleton } from '@/components/ui/skeleton';

interface Question {
  questionId: string;
  questionText: string;
  type: 'RATING_5_STAR' | 'TEXT_AREA' | 'MULTIPLE_CHOICE';
  isRequired: boolean;
  options?: string[];
}

interface Campaign {
  campaignId: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function FeedbackPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{
    [campaignId: string]: { [questionId: string]: string | number };
  }>({});

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/feedback/pending');
      const transformedCampaigns = (response.data.data || []).map(
        (campaign: any) => ({
          campaignId: campaign._id,
          title: campaign.title,
          description: campaign.description,
          questions: campaign.questions.map((q: any) => ({
            questionId: q._id,
            questionText: q.questionText,
            type: q.type,
            isRequired: q.isRequired,
            options: q.options,
          })),
        }),
      );
      setCampaigns(transformedCampaigns);
    } catch (error: any) {
      notifyError(
        error?.response?.data?.message || 'Failed to fetch feedback campaigns',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleAnswerChange = (
    campaignId: string,
    questionId: string,
    value: string | number,
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [campaignId]: {
        ...(prev[campaignId] || {}),
        [questionId]: value,
      },
    }));
  };

  const validateCampaign = (campaign: Campaign): boolean => {
    const campaignAnswers = answers[campaign.campaignId] || {};

    for (const question of campaign.questions) {
      if (question.isRequired) {
        const answer = campaignAnswers[question.questionId];
        if (answer === undefined || answer === null || answer === '') {
          return false;
        }
        // For text area, check if it's not just whitespace
        if (question.type === 'TEXT_AREA' && typeof answer === 'string') {
          if (answer.trim() === '') {
            return false;
          }
        }
        // For rating, validate range
        if (question.type === 'RATING_5_STAR' && typeof answer === 'number') {
          if (answer < 1 || answer > 5) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmit = async (campaign: Campaign) => {
    if (!validateCampaign(campaign)) {
      notifyError('Please answer all required questions');
      return;
    }

    setSubmitting(campaign.campaignId);

    try {
      const campaignAnswers = answers[campaign.campaignId] || {};
      const answersArray = Object.entries(campaignAnswers).map(
        ([questionId, response]) => {
          // Find the question to check its type
          const question = campaign.questions.find(
            (q) => q.questionId === questionId,
          );

          return {
            questionId,
            response:
              question?.type === 'RATING_5_STAR'
                ? Number(response)
                : String(response),
          };
        },
      );

      await axiosInstance.post('/feedback/submit', {
        campaignId: campaign.campaignId,
        answers: answersArray,
      });

      notifySuccess('Feedback submitted successfully!');

      // Clean up answers for this campaign
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[campaign.campaignId];
        return newAnswers;
      });

      // Refetch pending campaigns to update the list
      await fetchCampaigns();
    } catch (error: any) {
      notifyError(
        error?.response?.data?.message || 'Failed to submit feedback',
      );
    } finally {
      setSubmitting(null);
    }
  };

  const renderQuestion = (campaign: Campaign, question: Question) => {
    const answer = answers[campaign.campaignId]?.[question.questionId];

    return (
      <div key={question.questionId} className="space-y-2">
        <Label className="text-sm font-medium">
          {question.questionText}
          {question.isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>

        {question.type === 'RATING_5_STAR' && (
          <StarRating
            rating={typeof answer === 'number' ? answer : 0}
            onRatingChange={(rating) =>
              handleAnswerChange(
                campaign.campaignId,
                question.questionId,
                rating,
              )
            }
          />
        )}

        {question.type === 'TEXT_AREA' && (
          <Textarea
            value={typeof answer === 'string' ? answer : ''}
            onChange={(e) =>
              handleAnswerChange(
                campaign.campaignId,
                question.questionId,
                e.target.value,
              )
            }
            placeholder="Enter your response..."
            className="min-h-[100px]"
          />
        )}

        {question.type === 'MULTIPLE_CHOICE' && question.options && (
          <RadioGroup
            value={typeof answer === 'string' ? answer : ''}
            onValueChange={(value) =>
              handleAnswerChange(
                campaign.campaignId,
                question.questionId,
                value,
              )
            }
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`${question.questionId}-${index}`}
                />
                <Label
                  htmlFor={`${question.questionId}-${index}`}
                  className="font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Feedback"
        isKycCheck={true}
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Feedback"
          breadcrumbItems={[
            { label: 'Settings', link: '#' },
            { label: 'Feedback', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Internal Feedback
              </CardTitle>
              <CardDescription>
                Help us improve by sharing your thoughts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    No feedback campaigns available
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check back later for new feedback opportunities
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.campaignId}>
                      <CardHeader>
                        <CardTitle>{campaign.title}</CardTitle>
                        <CardDescription>
                          {campaign.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          {campaign.questions.map((question) =>
                            renderQuestion(campaign, question),
                          )}
                        </div>
                        <Button
                          onClick={() => handleSubmit(campaign)}
                          disabled={
                            submitting === campaign.campaignId ||
                            !validateCampaign(campaign)
                          }
                          className="w-full sm:w-auto"
                        >
                          {submitting === campaign.campaignId ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Feedback'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
