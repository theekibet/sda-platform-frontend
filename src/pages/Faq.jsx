import React, { useState } from 'react';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is SDA Platform?",
      answer: "SDA Platform is a Christian community platform for youth fellowship, Bible reading, prayer sharing, and meaningful discussions."
    },
    {
      question: "Is it free to use?",
      answer: "Yes, SDA Platform is completely free for all users."
    },
    {
      question: "How do I create an account?",
      answer: "Click on the 'Sign Up' button on the homepage and fill in your details to create an account."
    },
    {
      question: "Can I share prayer requests?",
      answer: "Yes, you can share prayer requests on the Prayer Wall and pray for others in the community."
    },
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page and follow the instructions to reset your password."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security seriously and use industry-standard encryption to protect your information."
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">Frequently Asked Questions</h1>
      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div key={index} className="mb-4 border rounded-lg">
            <button
              onClick={() => toggleFaq(index)}
              className="w-full text-left px-6 py-4 font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none"
            >
              <span className="flex justify-between items-center">
                {faq.question}
                <span>{openIndex === index ? '▲' : '▼'}</span>
              </span>
            </button>
            {openIndex === index && (
              <div className="px-6 py-4 text-gray-600 border-t">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
