import React from "react";
import { FaPaperPlane, FaSignInAlt } from "react-icons/fa";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  userType: 'user' | 'guest';
  messageLimitReached?: boolean;
  onLoginClick?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  message, 
  setMessage, 
  handleSendMessage,
  userType,
  messageLimitReached = false,
  onLoginClick
}) => {
  return (
    <div className="p-4 border-t border-gray-200 flex items-center space-x-2 bg-white">
      <input
        type="text"
        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        placeholder={messageLimitReached && userType === 'guest' ? "Login to send more messages" : "Type a message..."}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && !messageLimitReached && handleSendMessage()}
        disabled={messageLimitReached && userType === 'guest'}
      />
      {(messageLimitReached && userType === 'guest') ? (
        <button
          onClick={onLoginClick}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition duration-200 flex items-center justify-center"
          title="Login to continue chatting"
        >
          <FaSignInAlt />
        </button>
      ) : (
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition duration-200 flex items-center justify-center"
          disabled={messageLimitReached && userType === 'guest'}
        >
          <FaPaperPlane />
        </button>
      )}
    </div>
  );
};

export default ChatInput;