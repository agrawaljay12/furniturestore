import React, { useEffect, useState, useRef } from "react";
import { FaHeadphones } from "react-icons/fa";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatHistory from "./ChatHistory";

interface Message {
  role: string;
  content: string;
  userId?: string;
  userName?: string;
  timestamp?: Date;
}

interface ChatWidgetProps {
  currentSystemMessage: string;
  currentUser?: {
    id?: string;
    name?: string;
    isLoggedIn: boolean;
  };
  onLoginRedirect?: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  currentSystemMessage, 
  currentUser: propUser,
  onLoginRedirect 
}) => {
  // Enhanced localStorage user management
  const getUserFromStorage = (): { id?: string; name?: string; isLoggedIn: boolean } => {
    try {
      const appAuthUser = localStorage.getItem('user');
      if (appAuthUser) {
        const parsedUser = JSON.parse(appAuthUser);
        if (parsedUser) {
          return {
            id: parsedUser.id || parsedUser._id || parsedUser.userId,
            name: parsedUser.name || parsedUser.username || parsedUser.displayName,
            isLoggedIn: true
          };
        }
      }
      
      const authToken = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      if (authToken) {
        return {
          isLoggedIn: true
        };
      }
      
      const chatUser = localStorage.getItem('chatUser');
      if (chatUser) {
        return JSON.parse(chatUser);
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
    }
    
    return propUser || { isLoggedIn: false };
  };

  const [currentUser, setCurrentUser] = useState(getUserFromStorage);
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Message[]>(() => {
    try {
      const userFromStorage = getUserFromStorage();
      const isLoggedIn = userFromStorage.isLoggedIn;
      const userId = userFromStorage.id;
      
      if (isLoggedIn && userId) {
        const userHistoryKey = `chatHistory_${userId}`;
        const savedUserHistory = localStorage.getItem(userHistoryKey);
        
        if (savedUserHistory) {
          const parsedHistory = JSON.parse(savedUserHistory);
          return parsedHistory.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
          }));
        }
      } else if (isLoggedIn) {
        const savedUserHistory = localStorage.getItem('chatHistory_user');
        
        if (savedUserHistory) {
          const parsedHistory = JSON.parse(savedUserHistory);
          return parsedHistory.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
          }));
        }
      } else {
        const savedGuestHistory = localStorage.getItem('chatHistory_guest');
        
        if (savedGuestHistory) {
          const parsedHistory = JSON.parse(savedGuestHistory);
          return parsedHistory.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
          }));
        }
      }
      
      // Check if day has changed
      const lastChatDay = localStorage.getItem('lastChatDay');
      const today = new Date().toDateString();
      
      if (lastChatDay && lastChatDay !== today) {
        // Day has changed, reset history
        localStorage.setItem('lastChatDay', today);
        return getDefaultChatHistory();
      }

      // Set today as the last chat day if not already set
      if (!lastChatDay) {
        localStorage.setItem('lastChatDay', today);
      }
    } catch (error) {
      console.error('Error reading chat history from localStorage:', error);
    }
    
    return [
      { 
        role: 'system', 
        content: 'You are a Furniture Store Website Helping Assistant for Users to get info about products, services, and answer their queries. Keep your responses concise. Here are important links (port 5173): \n\n' + 
        '- Main Routes: login: http://localhost:5173/login, register: http://localhost:5173/signup\n' +
        '- Buy Routes: http://localhost:5173/buy, /living, /storage, /bedroom, /dining, /chairs, /tables, /mattress, /best-deals\n' + 
        '- Rent Routes: http://localhost:5173/rent, /rent-living, /rent-storage, /rent-bedroom, /rent-dining, /rent-chairs, /rent-tables, /rent-mattress, /rent-best-deals\n' + 
        '- Account: http://localhost:5173/profile, /cart, /wishlist, /order-history, /payment-history, /booking-confirmation\n' +
        '- Info: http://localhost:5173/about-us, /contact-us, /term-condition, /privacy\n' +
        '- User Pages: http://localhost:5173/user/pages/frontend\n'
      },
      {
        role: "assistant",
        content: "Hi! I'm your Furniture Store Assistant. How can I help you today?",
        timestamp: new Date()
      }
    ];
  });

  const [streamedResponse, setStreamedResponse] = useState<string>('');
  const [isMinimized, setIsMinimized] = useState(() => {
    // Always start minimized by default
    const today = new Date().toDateString();
    const lastChatDay = localStorage.getItem('lastChatDay');
    
    // If day has changed, ensure it starts minimized
    if (lastChatDay !== today) {
      localStorage.setItem('chatMinimized', 'true');
      return true;
    }
    
    // Otherwise use stored state, but default to minimized
    const storedState = localStorage.getItem('chatMinimized');
    return storedState ? storedState === 'true' : true;
  });
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [messageLimitReached, setMessageLimitReached] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const MAX_GUEST_MESSAGES = 5;
  const userMessageCount = chatHistory.filter(msg => msg.role === 'user').length;
  const userType = currentUser.isLoggedIn ? 'user' : 'guest';

  useEffect(() => {
    try {
      if (currentUser.isLoggedIn) {
        if (currentUser.id) {
          const userHistoryKey = `chatHistory_${currentUser.id}`;
          localStorage.setItem(userHistoryKey, JSON.stringify(chatHistory));
        } else {
          localStorage.setItem('chatHistory_user', JSON.stringify(chatHistory));
        }
      } else {
        localStorage.setItem('chatHistory_guest', JSON.stringify(chatHistory));
      }
      
      // Update the last chat day
      localStorage.setItem('lastChatDay', new Date().toDateString());
    } catch (error) {
      console.error('Error saving chat history to localStorage:', error);
    }
  }, [chatHistory, currentUser.isLoggedIn, currentUser.id]);

  useEffect(() => {
    localStorage.setItem('chatMinimized', isMinimized.toString());
  }, [isMinimized]);

  useEffect(() => {
    const refreshUserAuth = () => {
      const freshUser = getUserFromStorage();
      if (
        freshUser.isLoggedIn !== currentUser.isLoggedIn || 
        freshUser.id !== currentUser.id || 
        freshUser.name !== currentUser.name
      ) {
        setCurrentUser(freshUser);
      }
    };
    
    refreshUserAuth();
    const authInterval = setInterval(refreshUserAuth, 5000);
    
    return () => clearInterval(authInterval);
  }, []);

  useEffect(() => {
    if (propUser && (propUser.isLoggedIn !== currentUser.isLoggedIn || 
        propUser.id !== currentUser.id || 
        propUser.name !== currentUser.name)) {
      setCurrentUser(propUser);
      localStorage.setItem('chatUser', JSON.stringify(propUser));
    }
  }, [propUser]);

  useEffect(() => {
    if (!currentUser.isLoggedIn && userMessageCount >= MAX_GUEST_MESSAGES) {
      setMessageLimitReached(true);
    } else {
      setMessageLimitReached(false);
    }
  }, [userMessageCount, currentUser.isLoggedIn]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, streamedResponse, isAiTyping]);

  useEffect(() => {
    const storedUser = getUserFromStorage();
    if (storedUser.isLoggedIn !== currentUser.isLoggedIn) {
      setCurrentUser(storedUser);
      
      let newHistory: Message[];
      
      try {
        if (storedUser.isLoggedIn) {
          const historyKey = storedUser.id 
            ? `chatHistory_${storedUser.id}`
            : 'chatHistory_user';
            
          const savedHistory = localStorage.getItem(historyKey);
          if (savedHistory) {
            newHistory = JSON.parse(savedHistory).map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
            }));
          } else {
            newHistory = getDefaultChatHistory();
          }
        } else {
          const savedGuestHistory = localStorage.getItem('chatHistory_guest');
          if (savedGuestHistory) {
            newHistory = JSON.parse(savedGuestHistory).map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
            }));
          } else {
            newHistory = getDefaultChatHistory();
          }
        }
        
        setChatHistory(newHistory);
      } catch (error) {
        console.error('Error resetting chat history on auth change:', error);
        setChatHistory(getDefaultChatHistory());
      }
    }
  }, [currentUser.isLoggedIn]);

  const getDefaultChatHistory = (): Message[] => {
    return [
      { 
        role: 'system', 
        content: 'You are a Furniture Store Website Helping Assistant for Users to get info about products, services, and answer their queries. Keep your responses concise. Here are important links (port 5173): \n\n' + 
        '- Main Routes: login: http://localhost:5173/login, register: http://localhost:5173/signup\n' +
        '- Buy Routes: http://localhost:5173/buy, /living, /storage, /bedroom, /dining, /chairs, /tables, /mattress, /best-deals\n' + 
        '- Rent Routes: http://localhost:5173/rent, /rent-living, /rent-storage, /rent-bedroom, /rent-dining, /rent-chairs, /rent-tables, /rent-mattress, /rent-best-deals\n' + 
        '- Account: http://localhost:5173/profile, /cart, /wishlist, /order-history, /payment-history, /booking-confirmation\n' +
        '- Info: http://localhost:5173/about-us, /contact-us, /term-condition, /privacy\n' +
        '- User Pages: http://localhost:5173/user/pages/frontend\n'
      },
      {
        role: "assistant",
        content: "Hi! I'm your Furniture Store Assistant. How can I help you today?",
        timestamp: new Date()
      }
    ];
  };

  const handleSendMessage = () => {
    if (message.trim() === "" || (messageLimitReached && userType === 'guest')) return;
    
    const timestamp = new Date();
    const userMessage: Message = { 
      role: "user", 
      content: message,
      userId: currentUser.id,
      userName: userType === 'user' ? 'User' : 'Guest',
      timestamp 
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setMessage("");
    
    handleKeyDownAiChat(userMessage);
  };

  const handleKeyDownAiChat = async (userMessage: Message) => {
    let current = [...chatHistory, userMessage];
    setIsAiTyping(true);
    setStreamedResponse('');
    let bufferedResponse = '';

    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'stablelm-zephyr:latest',
          messages: current.map(msg => ({ role: msg.role, content: msg.content }))
        })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          bufferedResponse += chunk;

          const jsonChunks = bufferedResponse.split('\n');

          for (let jsonString of jsonChunks) {
            jsonString = jsonString.trim();

            if (!jsonString) continue;

            try {
              const message = JSON.parse(jsonString);

              setStreamedResponse(prevResponse => {
                const updatedResponse = prevResponse + message.message.content;
                return updatedResponse;
              });

              if (message.done) {
                setStreamedResponse(finalResponse => {
                  const assistantMessage: Message = { 
                    role: 'assistant', 
                    content: finalResponse,
                    timestamp: new Date()
                  };
                  
                  setChatHistory(prev => [...prev, assistantMessage]);
                  return '';
                });

                setIsAiTyping(false);
              }
            } catch (error) {
              console.error('Failed to parse JSON:', jsonString, error);
            }
          }

          bufferedResponse = '';
        }
      }
    } catch (error) {
      console.error('Error sending command to AI:', error);
      setIsAiTyping(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleLoginRedirect = () => {
    if (onLoginRedirect) {
      onLoginRedirect();
    } else {
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    if (currentSystemMessage) {
      const systemMessage = { role: "system", content: currentSystemMessage };
      setChatHistory(prev => [...prev, systemMessage]);
    }
  }, [currentSystemMessage]);

  return (
    <div className={`fixed bottom-4 right-4 ${isMinimized ? 'w-14 h-14 rounded-full' : 'h-[500px] w-[350px] rounded-lg'} bg-white shadow-2xl flex flex-col transition-all duration-300 z-50 border border-gray-200 overflow-hidden`}>
      {isMinimized ? (
        <div 
          className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-800 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={handleMinimize}
        >
          <FaHeadphones className="text-white" size={22} />
        </div>
      ) : (
        <>
          <ChatHeader 
            isMinimized={isMinimized}
            handleMinimize={handleMinimize}
            userType={userType}
            userName={currentUser.name}
            userId={currentUser.id}
          />

          <div 
            ref={chatContainerRef} 
            className="flex-1 overflow-y-auto"
            style={{ scrollBehavior: 'smooth' }}
          >
            <ChatHistory 
              chatHistory={chatHistory}
              streamedResponse={streamedResponse}
              userType={userType}
              currentUserName={currentUser.name}
              isAiTyping={isAiTyping}
            />
          </div>

          <ChatInput 
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            userType={userType}
            messageLimitReached={messageLimitReached}
            onLoginClick={handleLoginRedirect}
          />
        </>
      )}
    </div>
  );
};

export default ChatWidget;