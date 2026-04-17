import React from "react";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { FaUser, FaUserSecret, FaHeadphones } from "react-icons/fa";

interface Message {
  role: string;
  content: string;
  userId?: string;
  userName?: string;
  timestamp?: Date;
}

interface ChatHistoryProps {
  chatHistory: Message[];
  streamedResponse: string;
  userType: 'user' | 'guest';
  currentUserName?: string;
  isAiTyping: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  chatHistory, 
  streamedResponse, 
  userType,
  isAiTyping
}) => {
  // Format timestamp to a human-readable format
  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    
    // Otherwise show date and time
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    }) + ', ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex space-x-2 items-center p-2">
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-150"></div>
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-300"></div>
    </div>
  );

  return (
    <div id="chatHistory" className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
      {chatHistory.filter(chat => chat.role !== 'system').length === 0 ? (
        <div className="text-gray-500 text-center mt-4">
          <p>Start the conversation!</p>
          {userType === 'guest' && (
            <p className="text-xs mt-2">
              Note: Guest users have limited messages. <span className="text-blue-500 cursor-pointer">Login</span> for full access.
            </p>
          )}
        </div>
      ) : (
        chatHistory.filter(chat => chat.role !== 'system').map((chat, index) => (
          <div
            key={index}
            className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex items-start">
              {chat.role !== "user" && (
                <div className="bg-blue-600 rounded-full p-2 mr-2">
                  <FaHeadphones className="text-white" size={12} />
                </div>
              )}
              
              <div
                className={`${chat.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
                  } p-3 rounded-lg max-w-xs shadow-md`}
              >
                {chat.userName && chat.role === "user" && (
                  <div className="text-xs opacity-80 mb-1 font-medium">
                    {chat.userName} {/* Will now always be "User" or "Guest" */}
                  </div>
                )}
                
                {chat.role === "user" ? (
                  <p className="text-sm">{chat.content}</p>
                ) : (
                  <div className="text-sm">
                    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {chat.content.replace(/(http:\/\/[^\s]+)/g, '$1*').replace(/(important|highlight)/gi, '$1*')}
                    </Markdown>
                  </div>
                )}
                
                {chat.timestamp && (
                  <div className="text-xs opacity-70 mt-1 text-right">
                    {formatTimestamp(chat.timestamp)}
                  </div>
                )}
              </div>
              
              {chat.role === "user" && (
                <div className="bg-gray-500 rounded-full p-2 ml-2">
                  {userType === 'user' ? (
                    <FaUser className="text-white" size={12} />
                  ) : (
                    <FaUserSecret className="text-white" size={12} />
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
      {
        streamedResponse && (
          <div className="flex justify-start">
            <div className="flex items-start">
              <div className="bg-blue-600 rounded-full p-2 mr-2">
                <FaHeadphones className="text-white" size={12} />
              </div>
              <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs shadow-md">
                <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {streamedResponse.replace(/(http:\/\/[^\s]+)/g, '$1*').replace(/(important|highlight)/gi, '$1*')}
                </Markdown>
              </div>
            </div>
          </div>
        )
      }
      {/* Show typing indicator when AI is thinking but no response is being streamed yet */}
      {isAiTyping && !streamedResponse && (
        <div className="flex justify-start">
          <div className="flex items-start">
            <div className="bg-blue-600 rounded-full p-2 mr-2">
              <FaHeadphones className="text-white" size={12} />
            </div>
            <div className="bg-gray-200 text-gray-800 p-2 rounded-lg max-w-xs shadow-md">
              <TypingIndicator />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;