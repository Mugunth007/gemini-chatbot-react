import React from 'react';
import type { Message } from '../types';
import { UserIcon, BotIcon } from './icons';

interface ChatMessageProps {
  message: Message;
}

const TypingIndicator: React.FC = () => (
  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-pulse"></div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { sender, parts, sources } = message;
  const isUser = sender === 'user';
  const content = parts.map(part => part.text).join('');
  const isEmptyModelMessage = sender === 'model' && content.length === 0;

  const wrapperClasses = `flex items-start gap-4 p-5 ${
    isUser ? 'bg-gray-800' : 'bg-gray-700/50'
  }`;

  const iconWrapperClasses = `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
    isUser ? 'bg-indigo-500' : 'bg-teal-500'
  }`;

  return (
    <div className={wrapperClasses}>
      <div className={iconWrapperClasses}>
        {isUser ? (
          <UserIcon className="w-5 h-5 text-white" />
        ) : (
          <BotIcon className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex-grow pt-1 text-gray-200 whitespace-pre-wrap">
        {isEmptyModelMessage ? <TypingIndicator /> : content}
        {sources && sources.length > 0 && (
          <div className="mt-4 border-t border-gray-600 pt-3">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">SOURCES</h4>
            <ul className="space-y-1">
              {sources.map((source, index) => (
                <li key={index} className="text-sm">
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={source.title}
                    className="text-blue-400 hover:text-blue-300 hover:underline break-all"
                  >
                    {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
