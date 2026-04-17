import React, { useEffect, useState } from "react";
import { FaMinus, FaHeadphones, FaUser, FaUserSecret, FaIdBadge } from "react-icons/fa";

interface ChatHeaderProps {
  isMinimized: boolean;
  handleMinimize: () => void;
  userType: 'user' | 'guest';
  userName?: string;
  userId?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  isMinimized, 
  handleMinimize, 
  userType, 
  userName,
  userId
}) => {
  const [, setDisplayName] = useState<string | undefined>(userName);
  const [displayId, setDisplayId] = useState<string | undefined>(userId);

  // Check localStorage for user info when component mounts or props change
  useEffect(() => {
    // Get user data from localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        // Set display name, prioritizing props over localStorage
        if (userName) {
          setDisplayName(userName);
        } else if (parsedUser && (parsedUser.name || parsedUser.username || parsedUser.displayName)) {
          setDisplayName(parsedUser.name || parsedUser.firstname || parsedUser.displayName);
        } else {
          setDisplayName('User');  // Always show "User" for logged-in users
        }
        
        // Set user ID, prioritizing props over localStorage
        if (userId) {
          setDisplayId(userId);
        } else if (parsedUser && (parsedUser.id || parsedUser._id || parsedUser.userId)) {
          setDisplayId(parsedUser.id || parsedUser._id || parsedUser.userId);
        } else {
          setDisplayId(undefined);
        }
        
        return;
      }
      
      // Fall back to provided props or generic values
      setDisplayName(userName || (userType === 'user' ? 'User' : 'Guest'));
      setDisplayId(userId);
      
    } catch (error) {
      console.error('Error checking user in localStorage:', error);
      setDisplayName(userName || (userType === 'user' ? 'User' : 'Guest'));
      setDisplayId(userId);
    }
  }, [userName, userId, userType]);

  // Format user ID for display (show only last 6 chars)
  const formatUserId = (id?: string) => {
    if (!id) return '';
    if (id.length <= 6) return id;
    return '...' + id.slice(-6);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4 rounded-t-lg flex justify-between items-center">
      <div className="flex items-center space-x-2" onClick={handleMinimize}>
        <FaHeadphones size={20} />
        <span>Chat Assistant</span>
      </div>
      <div className="flex items-center">
        <div className="mr-3 flex items-center">
          {userType === 'user' ? (
            <div className="flex items-center">
              <FaUser className="mr-1" size={16} />
              <span className="text-sm font-medium">User</span>
              {displayId && (
                <div className="ml-1 bg-blue-800 rounded-full px-2 py-0.5 flex items-center text-xs">
                  <FaIdBadge className="mr-1" size={10} />
                  <span>{formatUserId(displayId)}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <FaUserSecret className="mr-1" size={16} />
              <span className="text-sm">Guest</span>
            </>
          )}
        </div>
        {!isMinimized && (
          <button
            onClick={handleMinimize}
            className="text-white hover:text-gray-200 transition duration-200"
          >
            <FaMinus size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;