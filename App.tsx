import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Chat } from '@google/genai';
import { ChatMessage } from './components/ChatMessage';
import { MessageInput } from './components/MessageInput';
import { BotIcon } from './components/icons';
import type { Message } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY! }), []);

  // Use the more capable gemini-2.5-pro model for better reasoning and tool use.
  const chat: Chat = useMemo(() => ai.chats.create({
    model: 'gemini-2.5-pro',
    config: {
      tools: [{ googleSearch: {} }],
    },
  }), [ai]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      parts: [{ text: input }],
    };

    const modelMessageId = (Date.now() + 1).toString();
    const modelPlaceholderMessage: Message = {
        id: modelMessageId,
        sender: 'model',
        parts: [{ text: '' }],
        sources: [],
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage, modelPlaceholderMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Use sendMessageStream to get real-time responses.
      const responseStream = await chat.sendMessageStream({ message: input });

      let accumulatedText = '';
      const accumulatedSources = new Map<string, { uri: string; title: string }>();

      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        // FIX: Explicitly check for non-empty string to satisfy strict TypeScript boolean checks.
        if (chunkText) {
            accumulatedText += chunkText;
        }

        // Extract and deduplicate sources from grounding metadata in each chunk.
        const sources =
          chunk.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((c) => {
              if (c.web) {
                return {
                  uri: c.web.uri ?? '',
                  title: c.web.title ?? '',
                };
              }
              return null;
            })
            .filter((source): source is { uri: string; title: string } => source !== null && !!source.uri) ?? [];
        
        for (const source of sources) {
            if (!accumulatedSources.has(source.uri)) {
                accumulatedSources.set(source.uri, source);
            }
        }
        
        // Update the UI with the latest text and sources as they arrive.
        setMessages((prev) =>
            prev.map((msg) =>
            msg.id === modelMessageId
                ? { ...msg, parts: [{ text: accumulatedText }], sources: Array.from(accumulatedSources.values()) }
                : msg
            )
        );
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMessageId
            ? {
                ...msg,
                parts: [
                  {
                    text: 'Sorry, something went wrong. Please try again.',
                  },
                ],
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <header className="p-4 border-b border-gray-700 shadow-md">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <BotIcon className="w-8 h-8 text-teal-400" />
          <h1 className="text-xl font-semibold text-gray-200">Gemini Pro Chat</h1>
        </div>
      </header>
      <main className="flex-grow overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
          {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-400">
                  Start a conversation with Gemini. Try asking about recent events!
              </div>
          )}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="bg-gray-900 sticky bottom-0">
        <MessageInput
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </footer>
    </div>
  );
};

export default App;
