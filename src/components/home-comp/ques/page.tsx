'use client';
import React, { useState } from 'react';

interface QuestionProps {
  question: string;
  answer: string;
}

const Question: React.FC<QuestionProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="mt-10 space-y-6 text-left">
      <div data-state={isOpen ? 'open' : 'closed'} className="mb-[10px]">
        <button
          type="button"
          aria-controls={`radix-${question.replace(/\s+/g, '')}`}
          aria-expanded={isOpen}
          data-state={isOpen ? 'open' : 'closed'}
          className="flex w-[700px] items-center justify-between rounded-lg bg-[#1a1a1a] px-6 py-4"
          onClick={toggle}
        >
          <h3 className="text-lg font-bold ">{question}</h3>
          <svg
            className={`h-6 w-6  transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {isOpen && (
          <div
            data-state="open"
            id={`radix-${question.replace(/\s+/g, '')}`}
            className="rounded-lg w-[700px] bg-[#1a1a1a] mt-[-15px] px-6 py-4"
          >
            <p className="text-base text-white">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Faq: React.FC = () => {
  const faqData = [
    {
      question: 'How do I hire a freelancer?',
      answer:
        'To hire a freelancer, simply browse our platform, review freelancer profiles, and send them a project proposal. Our secure payment system and communication tools make the process easy and efficient.',
    },
    {
      question: 'What is the pricing structure?',
      answer:
        'Our pricing is flexible and tailored to your specific needs. Freelancers set their own rates, and you can negotiate directly with them. We also offer various subscription plans to fit your budget and project requirements.',
    },
    {
      question: 'How do I ensure quality work?',
      answer:
        'We carefully vet and screen all freelancers on our platform to ensure they meet our high standards of quality and expertise. You can also review freelancer portfolios, ratings, and reviews to find the perfect fit for your project.',
    },
    // Add more FAQ items as needed
  ];

  return (
    <div className="max-w-2xl mx-auto mt-8">
      {faqData.map((item, index) => (
        <Question key={index} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
};

export default Faq;
