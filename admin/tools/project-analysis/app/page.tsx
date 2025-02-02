'use client';

import { useChat } from 'ai/react';
import { useEffect, useState } from 'react';

export default function Chat() {
  const [readmeContent, setReadmeContent] = useState('');

  useEffect(() => {
    // Fetch README content when component mounts
    fetch('/api/readme')
      .then(res => res.text())
      .then(content => {
        setReadmeContent(content);
      })
      .catch(console.error);
  }, []);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hi, here KindBot! I\'m your KindFi assistant. I can help you understand our project and answer any questions you have about KindFi. What would you like to know?'
      }
    ],
    body: {
      readmeContent, // Pass README content to the API
    },
  });

  return (
    <div className="min-h-screen from-zinc-100">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl primary-foreground">KindFi Project Analysis</h1>
          <p className="text-primary-600">Ask me anything about KindFi's architecture, features, or implementation details.</p>
        </div>
        
        <div className="space-y-4 mb-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`p-4 rounded-lg ${
                m.role === 'user'
                  ? 'bg-green-500 text-white ml-auto max-w-[80%]'
                  : 'border border-zinc-200 dark:border-zinc-600 max-w-[80%]'
              }`}
            >
              <div className="whitespace-pre-wrap">
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 p-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input
              className="flex-1 p-4 rounded-lg border border-zinc-300 dark:border-zinc-600 text-black focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
              value={input}
              placeholder="Ask about KindFi..."
              onChange={handleInputChange}
            />
            <button
              type="submit"
              className="px-6 py-4 bg-green-400 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

