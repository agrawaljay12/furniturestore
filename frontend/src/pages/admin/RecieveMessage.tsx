import React, { useState, useEffect } from "react";
import AdminFooter from "../../components/admin/AdminFooter";
import axios from "axios";
import SuperAdminHeader from "../../components/admin/AdminHeader";
import SuperSidebar from "../../components/admin/Sidebar";
import { FiInbox, FiMail, FiUser, FiCheck, FiClock, FiMessageSquare } from "react-icons/fi";

const RecieveMessage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [, setMessageCount] = useState<number>(0);
  const [markingAsRead, setMarkingAsRead] = useState<{[key: string]: boolean}>({});
  
  // Track read messages in localStorage
  const [readMessages, setReadMessages] = useState<Set<string>>(() => 
    new Set(JSON.parse(localStorage.getItem('adminReadMessages') || '[]'))
  );

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.get("http://127.0.0.1:10007/api/v1/message/get", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter messages where sender_role is "moderator"
      const moderatorMessages = response.data.data.filter((message: any) => message.sender_role === "moderator");
      setMessages(moderatorMessages);
      setMessageCount(moderatorMessages.length);
      
      // Filter out read messages
      const unreadMessages = moderatorMessages.filter(
        (message: any) => !readMessages.has(message._id.toString())
      );
      setFilteredMessages(unreadMessages);
      
      // Update global message count in localStorage
      updateGlobalMessageCount(unreadMessages.length);
      
    } catch (error) {
      setError("Failed to fetch messages.");
    }
  };

  // Function to update global message count
  const updateGlobalMessageCount = (count: number) => {
    localStorage.setItem('adminUnreadMessageCount', count.toString());
    window.dispatchEvent(new Event('adminMessageCountUpdated'));
  };

  useEffect(() => {
    fetchMessages();
  }, [readMessages]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      // Set loading state for this specific message
      setMarkingAsRead(prev => ({ ...prev, [messageId]: true }));
      
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing. Please log in again.");
        return;
      }
      
      // Find the message to verify it's from a moderator
      const message = messages.find(msg => msg._id === messageId);
      if (message && message.sender_role === "moderator") {
        // Delete the message from the backend
        await axios.post(`http://127.0.0.1:10007/api/v1/message/delete/${messageId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
      
      // Update local storage tracking
      const newReadMessages = new Set(readMessages);
      newReadMessages.add(messageId.toString());
      setReadMessages(newReadMessages);
      
      // Update localStorage
      localStorage.setItem('adminReadMessages', JSON.stringify([...newReadMessages]));
      
      // Remove this message from both message lists
      setFilteredMessages(prev => prev.filter(msg => msg._id !== messageId));
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      // Update global message count
      const newUnreadCount = Math.max(0, filteredMessages.length - 1);
      updateGlobalMessageCount(newUnreadCount);
      
      // Show success alert
      alert("Message has been marked as read");
      
    } catch (err) {
      setError("An error occurred while deleting the message");
      console.error("Error deleting message:", err);
      alert("Failed to mark message as read. Please try again.");
    } finally {
      // Clear loading state
      setMarkingAsRead(prev => ({ ...prev, [messageId]: false }));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="fixed top-0 left-0 h-full">
        <SuperSidebar />
      </div>
      <div className="flex-1 ml-72 flex flex-col">
        <SuperAdminHeader />
        <main className="flex-1 p-6">
          {error && (
            <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-4 mb-6 rounded-md">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
              <FiInbox className="mr-2 text-indigo-600 dark:text-indigo-400" />
              Messages from Moderators
            </h1>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full flex items-center">
              <FiMail className="mr-1.5" />
              <span>{filteredMessages.length} Unread Messages</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMessages.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center h-60 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <FiInbox className="text-5xl mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">All caught up! No unread messages</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message._id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border-l-4 border-indigo-500"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-bold text-slate-800 dark:text-white flex items-center">
                        <FiMessageSquare className="mr-1.5 text-indigo-500" />
                        New Message
                      </h2>
                      <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs px-2 py-1 rounded-full">
                        Unread
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start text-sm">
                        <FiUser className="mt-0.5 mr-2 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                        <div>
                          <div className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">From:</span> Moderator ID {message.moderator_id}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                            {message.email}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start text-sm">
                        <FiMessageSquare className="mt-0.5 mr-2 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                        <div className="text-gray-600 dark:text-gray-300">
                          <p className="whitespace-pre-wrap">{message.message}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <FiClock className="mr-1.5" />
                        <span>{message.timestamp}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleMarkAsRead(message._id)}
                      disabled={markingAsRead[message._id]}
                      className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                        markingAsRead[message._id] 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' 
                          : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'
                      }`}
                    >
                      {markingAsRead[message._id] ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          <FiCheck className="mr-1.5" />
                          Mark as Read
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default RecieveMessage;