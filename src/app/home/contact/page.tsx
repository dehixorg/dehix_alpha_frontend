"use client";
import React, { useState } from 'react';

const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ name, email, message });
  };

  return (
    <div className="min-h-screen flex items-center justify-center  text-white">
      <form className="w-full max-w-4xl p-8 space-y-6  rounded-lg" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-bold text-center text-[#00ffff]">Get in Touch</h2>
        <p className="text-center mb-6">Have a project in mind? Let's discuss how we can help.</p>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col">
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">Name</label>
              <span className="text-gray-500 text-sm">{name}</span>
            </div>
            <input
              type="text"
              className="p-2 w-full rounded bg-[#2b2b2b] text-white placeholder-gray-500"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">Email</label>
              <span className="text-gray-500 text-sm">{email}</span>
            </div>
            <input
              type="email"
              className="p-2 w-full rounded bg-[#2b2b2b] text-white placeholder-gray-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">Message</label>
              <span className="text-gray-500 text-sm">{message}</span>
            </div>
            <textarea
              className="p-2 w-full h-32 rounded bg-[#2b2b2b] text-white placeholder-gray-500"
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-6 p-3 rounded bg-[#00ffff] text-black font-bold hover:bg-[#00e6e6]"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ContactForm;