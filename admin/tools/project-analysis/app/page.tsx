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
        content: 'Hello! I\'m your KindFi assistant. I can help you understand our project and answer any questions you have about KindFi. What would you like to know?'
      }
    ],
    body: {
      readmeContent, // Pass README content to the API
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-zinc-800">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-white mb-2">KindFi Project Analysis</h1>
          <p className="text-zinc-600 dark:text-zinc-300">Ask me anything about KindFi's architecture, features, or implementation details.</p>
        </div>
        
        <div className="space-y-4 mb-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`p-4 rounded-lg ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white ml-auto max-w-[80%]'
                  : 'bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 max-w-[80%]'
              }`}
            >
              <div className="whitespace-pre-wrap">
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input
              className="flex-1 p-4 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              value={input}
              placeholder="Ask about KindFi..."
              onChange={handleInputChange}
            />
            <button
              type="submit"
              className="px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
