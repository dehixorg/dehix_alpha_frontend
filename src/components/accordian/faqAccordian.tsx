import React from 'react';
import {
  HelpCircle,
  Zap,
  Globe,
  Shield,
  CreditCard,
  Search,
} from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const questions = [
  {
    question: 'How can I start freelancing on our platform?',
    answer:
      'To start freelancing, you can create an account and set up your profile. Once done, you can browse available projects or create your own listings.',
    icon: <Zap className="h-5 w-5 text-blue-500" />,
  },
  {
    question: 'What types of projects are available?',
    answer:
      'Our platform hosts a wide range of projects including content creation, web development, graphic design, marketing, and more. You can find projects that match your skills and interests.',
    icon: <Globe className="h-5 w-5 text-green-500" />,
  },
  {
    question: 'How are freelancers vetted on your platform?',
    answer:
      'We have a rigorous vetting process to ensure that freelancers have the necessary skills and experience. This includes reviewing portfolios, conducting interviews, and verifying credentials.',
    icon: <Shield className="h-5 w-5 text-amber-500" />,
  },
  {
    question: 'Can I hire freelancers from different countries?',
    answer:
      'Yes, our platform connects you with freelancers from around the world. You can choose freelancers based on their location, skills, and availability.',
    icon: <Globe className="h-5 w-5 text-purple-500" />,
  },
  {
    question: 'What payment methods are supported?',
    answer:
      'We support various payment methods including credit/debit cards, PayPal, and bank transfers. You can choose the payment method that is most convenient for you.',
    icon: <CreditCard className="h-5 w-5 text-emerald-500" />,
  },
  {
    question: 'How do I set my hourly rate?',
    answer:
      'You can set your hourly rate in your profile settings. We recommend researching market rates for your skills and experience level to remain competitive.',
    icon: <Zap className="h-5 w-5 text-rose-500" />,
  },
  {
    question: 'What are the service fees?',
    answer:
      'Our platform charges a service fee of 10% per project. This helps us maintain the platform, provide customer support, and continue improving our services.',
    icon: <CreditCard className="h-5 w-5 text-blue-500" />,
  },
];

const FAQAccordion = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredQuestions = questions.filter(
    (question) =>
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle input change with proper event type
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4 pb-2 sticky top-0 z-10 bg-background">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search help articles..."
            className="w-full pl-9 pr-4 py-2 h-10 rounded-lg bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/50 focus:outline-none text-sm"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <ScrollArea className="flex-1 w-full">
        <div className="px-6 pb-6">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-muted">
                        {item.icon}
                      </div>
                      <span className="text-left font-medium">
                        {item.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1 text-muted-foreground">
                    <div className="pl-10">{item.answer}</div>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <HelpCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p>No results found for &quot;{searchQuery}&quot;</p>
                <p className="text-sm mt-1">
                  Try different keywords or check back later
                </p>
              </div>
            )}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
};

export default FAQAccordion;
