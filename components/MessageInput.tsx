
import React, { useRef, useEffect } from 'react';
import { SendIcon } from './icons';

interface MessageInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  input,
  setInput,
  handleSendMessage,
  isLoading,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSendMessage(e as any);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
        <form
            onSubmit={handleSendMessage}
            className="relative flex items-center bg-gray-800 border border-gray-600 rounded-2xl shadow-lg"
        >
            <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Gemini..."
            rows={1}
            disabled={isLoading}
            className="w-full bg-transparent text-gray-200 placeholder-gray-500 py-3 pl-4 pr-12 resize-none focus:outline-none disabled:opacity-50 max-h-48"
            />
            <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
            aria-label="Send message"
            >
            <SendIcon className="w-5 h-5" />
            </button>
      </form>
    </div>
  );
};
