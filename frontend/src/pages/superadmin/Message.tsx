import React, { useState, useEffect } from "react";
import AdminFooter from "../../components/admin/AdminFooter";
import axios from "axios";
import SuperAdminHeader from "../../components/SuperAdminHeader ";
import SuperSidebar from "../../components/SuperSidebar";

const ComeMessage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [, setMessageCount] = useState<number>(0);
  const [markingAsRead, setMarkingAsRead] = useState<{[key: string]: boolean}>({});
  const [userDetails, setUserDetails] = useState<{[key: string]: {firstName: string, lastName: string}}>({});
  
  const [readMessages, setReadMessages] = useState<Set<string>>(() => 
    new Set(JSON.parse(localStorage.getItem('readMessages') || '[]'))
  );

  const fetchUserDetails = async (userId: string) => {
    if (!userId || userDetails[userId]) return;
    
    try {
      const response = await fetch(`https://furnspace.onrender.com/api/v1/auth/user/fetch/${userId}`, {
        method: "GET",
        headers: {
          "Accept": "*/*",
          "User-Agent": "Thunder Client (https://www.thunderclient.com)"
        }
      });
      
      const data = await response.json();
      
      if (data && data.data) {
        setUserDetails(prev => ({
          ...prev,
          [userId]: {
            firstName: data.data.first_name || "Unknown",
            lastName: data.data.last_name || "User"
          }
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch user details for ID: ${userId}`, error);
    }
  };

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.get("https://furnspace.onrender.com/api/v1/message/get", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const adminMessages = response.data.data.filter((message: any) => message.sender_role === "admin");
      setMessages(adminMessages);
      setMessageCount(adminMessages.length);
      
      const unreadMessages = adminMessages.filter(
        (message: any) => !readMessages.has(message._id.toString())
      );
      setFilteredMessages(unreadMessages);
      
      updateGlobalMessageCount(unreadMessages.length);
      
      adminMessages.forEach((message: { moderator_id?: string; admin_id?: string }) => {
        if (message.moderator_id) fetchUserDetails(message.moderator_id);
        if (message.admin_id) fetchUserDetails(message.admin_id);
      });
      
    } catch (error) {
      setError("Failed to fetch messages.");
    }
  };

  const updateGlobalMessageCount = (count: number) => {
    localStorage.setItem('unreadMessageCount', count.toString());
  };

  useEffect(() => {
    fetchMessages();
  }, [readMessages]);

  const getUserName = (userId: string) => {
    if (!userId) return "Unknown";
    if (!userDetails[userId]) return userId;
    
    const { firstName, lastName } = userDetails[userId];
    return `${firstName} ${lastName}`;
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      setMarkingAsRead(prev => ({ ...prev, [messageId]: true }));
      
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing. Please log in again.");
        return;
      }
      
      const message = messages.find(msg => msg._id === messageId);
      if (message && message.sender_role === "admin") {
        await axios.post(`https://furnspace.onrender.com/api/v1/message/delete/${messageId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
      
      const newReadMessages = new Set(readMessages);
      newReadMessages.add(messageId.toString());
      setReadMessages(newReadMessages);
      
      localStorage.setItem('readMessages', JSON.stringify([...newReadMessages]));
      
      setFilteredMessages(prev => prev.filter(msg => msg._id !== messageId));
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      const newUnreadCount = Math.max(0, filteredMessages.length - 1);
      updateGlobalMessageCount(newUnreadCount);
      
      alert("Message has been marked as read");
      
    } catch (err) {
      setError("An error occurred while deleting the message");
      console.error("Error deleting message:", err);
      alert("Failed to mark message as read. Please try again.");
    } finally {
      setMarkingAsRead(prev => ({ ...prev, [messageId]: false }));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-full z-30">
        <SuperSidebar />
      </div>

      {/* Main content area with fixed header */}
      <div className="flex-1 ml-0 lg:ml-72 flex flex-col min-h-screen">
        {/* Fixed Header */}
        <div className="fixed top-0 right-0 left-0 lg:left-72 z-20 bg-gray-900 border-b border-gray-700">
          <SuperAdminHeader />
        </div>

        {/* Main content with padding for fixed header */}
        <main className="flex-grow mt-16 p-6 overflow-y-auto">
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-100">Messages from Admin</h1>
            <p className="text-gray-400">Unread Messages: {filteredMessages.length}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {filteredMessages.length === 0 ? (
              <p className="text-gray-400">No unread messages found.</p>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message._id}
                  className="bg-gray-800 rounded-xl border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-200">Message</h2>
                      <span className="bg-red-900 text-red-200 text-xs px-3 py-1 rounded-full">
                        Unread
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Moderator:</span>
                        <span className="text-gray-200">{getUserName(message.moderator_id)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Admin:</span>
                        <span className="text-gray-200">{getUserName(message.admin_id)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-gray-200">{message.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Message:</span>
                        <span className="text-gray-200 text-right max-w-[70%]">{message.message}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Timestamp:</span>
                        <span className="text-gray-200">{message.timestamp}</span>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => handleMarkAsRead(message._id)}
                        disabled={markingAsRead[message._id]}
                        className={`${
                          markingAsRead[message._id] 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-blue-700 hover:bg-blue-800 border border-blue-600'
                        } text-white px-3 py-2 rounded font-medium text-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      >
                        {markingAsRead[message._id] ? 'Processing...' : 'Mark as Read'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
        
        {/* Footer */}
        <div className="mt-auto">
          <AdminFooter />
        </div>
      </div>
    </div>
  );
};

export default ComeMessage;