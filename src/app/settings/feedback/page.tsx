'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  MessageSquare,
} from 'lucide-react';

import SettingsAppLayout from '@/components/layout/SettingsAppLayout';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';

type UserType = 'freelancer' | 'business';

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

const countRequiredQuestions = (campaign: Campaign) =>
  campaign.questions.filter((q) => q.isRequired).length;

const countAnsweredRequiredQuestions = (
  campaign: Campaign,
  answers: {
    [campaignId: string]: { [questionId: string]: string | number };
  },
) => {
  const campaignAnswers = answers[campaign.campaignId] || {};
  return campaign.questions.filter((q) => {
    if (!q.isRequired) return false;
    const answer = campaignAnswers[q.questionId];
    if (answer === undefined || answer === null || answer === '') return false;
    if (q.type === 'TEXT_AREA' && typeof answer === 'string') {
      return answer.trim() !== '';
    }
    if (q.type === 'RATING_5_STAR' && typeof answer === 'number') {
      return answer >= 1 && answer <= 5;
    }
    return true;
  }).length;
};

const readUserType = (): UserType | undefined => {
  const cookieType = Cookies.get('userType');
  if (cookieType === 'freelancer' || cookieType === 'business')
    return cookieType;

  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return undefined;
    const parsed = JSON.parse(storedUser);
    const type = parsed?.type;
    if (type === 'freelancer' || type === 'business') return type;
  } catch {
    return undefined;
  }

  return undefined;
};

export default function FeedbackPage() {
  const [userType, setUserType] = useState<UserType | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [expandedCampaignId, setExpandedCampaignId] = useState<
    string | undefined
  >(undefined);
  const [answers, setAnswers] = useState<{
    [campaignId: string]: { [questionId: string]: string | number };
  }>({});

  useEffect(() => {
    setUserType(readUserType());
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/feedback/pending');
      const transformedCampaigns = (response.data.data || []).map(
        (campaign: any) => ({
          campaignId: campaign._id,
          title: campaign.title,
          description: campaign.description,
          questions: (campaign.questions || []).map((q: any) => ({
            questionId: q._id,
            questionText: q.questionText,
            type: q.type,
            isRequired: q.isRequired,
            options: q.options || [],
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
        if (question.type === 'TEXT_AREA' && typeof answer === 'string') {
          if (answer.trim() === '') {
            return false;
          }
        }
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

      setAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[campaign.campaignId];
        return newAnswers;
      });

      await fetchCampaigns();

      setExpandedCampaignId((prev) => {
        if (prev !== campaign.campaignId) return prev;
        return undefined;
      });
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
        <div className="flex items-start justify-between gap-3">
          <Label className="text-sm font-medium leading-6">
            {question.questionText}
          </Label>
          {question.isRequired && (
            <Badge variant="secondary" className="shrink-0">
              Required
            </Badge>
          )}
        </div>

        {question.type === 'RATING_5_STAR' && (
          <div className="rounded-lg p-3">
            <StarRating
              rating={typeof answer === 'number' ? answer : 0}
              onRatingChange={(rating) =>
                handleAnswerChange(
                  campaign.campaignId,
                  question.questionId,
                  rating,
                )
              }
              size={22}
            />
          </div>
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
          <div className="rounded-lg p-3">
            <RadioGroup
              value={typeof answer === 'string' ? answer : ''}
              onValueChange={(value) =>
                handleAnswerChange(
                  campaign.campaignId,
                  question.questionId,
                  value,
                )
              }
              className="gap-3"
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
          </div>
        )}
      </div>
    );
  };

  return (
    <SettingsAppLayout
      active="Feedback"
      activeMenu="Feedback"
      userType={userType}
      isKycCheck={true}
      breadcrumbItems={[
        { label: 'Settings', link: '#' },
        { label: 'Feedback', link: '#' },
      ]}
      mainClassName="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-8"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Feedback
                </CardTitle>
                <CardDescription>
                  Your input helps us improve Dehix for everyone.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!userType ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading your account…
                </div>
              ) : loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="rounded-lg border p-4">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="mt-2 h-4 w-full" />
                      <Skeleton className="mt-4 h-8 w-full" />
                    </div>
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="rounded-lg border bg-muted/30 p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No pending feedback</p>
                      <p className="text-sm text-muted-foreground">
                        You’re all caught up. New campaigns will appear here.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  value={expandedCampaignId}
                  onValueChange={(v) =>
                    setExpandedCampaignId(v ? String(v) : undefined)
                  }
                  className="w-full space-y-4"
                >
                  {campaigns.map((campaign) => {
                    const requiredCount = countRequiredQuestions(campaign);
                    const answeredRequiredCount =
                      countAnsweredRequiredQuestions(campaign, answers);
                    const progress =
                      requiredCount === 0
                        ? 100
                        : Math.round(
                            (answeredRequiredCount / requiredCount) * 100,
                          );

                    return (
                      <AccordionItem
                        key={campaign.campaignId}
                        value={campaign.campaignId}
                        className="rounded-lg border px-4 card"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex w-full items-start justify-between gap-4 pr-2">
                            <div className="space-y-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {campaign.title}
                                </span>
                                <Badge variant="outline">
                                  {requiredCount} required
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {campaign.description}
                              </p>
                            </div>
                            <div className="hidden min-w-[140px] flex-col items-end gap-2 text-right sm:flex">
                              <span className="text-xs text-muted-foreground">
                                {answeredRequiredCount}/{requiredCount} required
                                answered
                              </span>
                              <Progress value={progress} className="h-2" />
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-6 pt-2">
                            <div className="sm:hidden">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {answeredRequiredCount}/{requiredCount}{' '}
                                  required answered
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {progress}%
                                </span>
                              </div>
                              <Progress value={progress} className="mt-2 h-2" />
                            </div>

                            <Separator />

                            <div className="space-y-5">
                              {campaign.questions.map((question) =>
                                renderQuestion(campaign, question),
                              )}
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-xs text-muted-foreground">
                                Fields marked as “Required” must be answered to
                                submit.
                              </p>
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
                                    Submitting…
                                  </>
                                ) : (
                                  'Submit'
                                )}
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Alert>
            <ClipboardList className="h-4 w-4" />
            <AlertTitle>How this works</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p className="text-sm">
                  When a campaign is available, you’ll see it listed here. Open
                  a campaign, answer the questions, and submit.
                </p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Only “Required” questions are mandatory.</li>
                  <li>You can edit answers before submitting.</li>
                  <li>After submission, the campaign disappears.</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Tips for great feedback
              </CardTitle>
              <CardDescription>
                Clear, specific feedback helps us act faster.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="font-medium">Be specific</p>
                <p className="text-muted-foreground">
                  Mention what you were trying to do and what happened.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="font-medium">Suggest improvements</p>
                <p className="text-muted-foreground">
                  If something felt confusing, tell us what you expected.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SettingsAppLayout>
  );
}
