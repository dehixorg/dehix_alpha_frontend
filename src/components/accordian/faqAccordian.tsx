import React from 'react';

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
  },
  {
    question: 'What types of projects are available?',
    answer:
      'Our platform hosts a wide range of projects including content creation, web development, graphic design, marketing, and more. You can find projects that match your skills and interests.',
  },
  {
    question: 'How are freelancers vetted on your platform?',
    answer:
      'We have a rigorous vetting process to ensure that freelancers have the necessary skills and experience. This includes reviewing portfolios, conducting interviews, and verifying credentials.',
  },
  {
    question: 'Can I hire freelancers from different countries?',
    answer:
      'Yes, our platform connects you with freelancers from around the world. You can choose freelancers based on their location, skills, and availability.',
  },
  {
    question: 'What payment methods are supported?',
    answer:
      'We support various payment methods including credit/debit cards, PayPal, and bank transfers. You can choose the payment method that is most convenient for you.',
  },
];

const FAQAccordion = () => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full mx-auto max-w-2xl divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-md"
    >
      {questions.map((item, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="px-4 py-2">
          <AccordionTrigger className="text-left font-semibold text-lg hover:text-blue-600 transition-colors duration-200">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed pt-2 pb-4">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQAccordion;