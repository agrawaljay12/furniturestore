import React, { useState, useEffect } from "react";
import AdminFooter from "../../components/admin/AdminFooter";
import axios from "axios";
import SuperAdminHeader from "../../components/admin/AdminHeader";
import SuperSidebar from "../../components/admin/Sidebar";

const List_Banned_User: React.FC = () => {
  const [banned, setBanned] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [markingAsRead, setMarkingAsRead] = useState<{[key: string]: boolean}>({});
  const [readNotifications, setReadNotifications] = useState<Set<string>>(() => 
    new Set(JSON.parse(localStorage.getItem('readNotifications') || '[]'))
  );
  const [userNames, setUserNames] = useState<{[key: string]: string}>({});

  const fetchBannedUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.get("http://127.0.0.1:10007/api/v1/banned/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      console.log(response.data.data);

      const uniqueBannedUsers = new Map();
      response.data.data.forEach((user: any) => {
        if (!uniqueBannedUsers.has(user.user_id)) {
          uniqueBannedUsers.set(user.user_id, user);
        }
      });
      
      const bannedUsersList = Array.from(uniqueBannedUsers.values());
      setBanned(bannedUsersList);
      
      // Fetch user names for each banned user
      bannedUsersList.forEach((user: any) => {
        fetchUserName(user.user_id);
      });
    } catch (error) {
      setError("Failed to fetch banned users.");
    }
  };

  const fetchUserName = async (userId: string) => {
    try {
      const headersList = { 
        "Accept": "/", 
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      };

      const response = await fetch(`http://127.0.0.1:10007/api/v1/auth/user/fetch/${userId}`, { 
        method: "GET", 
        headers: headersList 
      });

      if (!response.ok) {
        throw new Error(`Error fetching user data: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.data) {
        const fullName = `${data.data.first_name} ${data.data.last_name}`;
        setUserNames(prev => ({
          ...prev,
          [userId]: fullName
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch username for ID ${userId}:`, error);
    }
  };

  useEffect(() => {
    fetchBannedUser();
  }, []);

  const handleMarkAsRead = (userId: string) => {
    try {
      // Set loading state for this specific notification
      setMarkingAsRead(prev => ({ ...prev, [userId]: true }));
      
      // Update local storage tracking
      const newReadNotifications = new Set(readNotifications);
      newReadNotifications.add(userId.toString());
      setReadNotifications(newReadNotifications);
      
      // Update localStorage
      localStorage.setItem('readNotifications', JSON.stringify([...newReadNotifications]));
      
    } catch (err) {
      setError("An error occurred while updating notification");
    } finally {
      // Clear loading state
      setMarkingAsRead(prev => ({ ...prev, [userId]: false }));
    }
  };

  const isNotificationRead = (userId: string) => {
    return readNotifications.has(userId.toString());
  };

  const filteredUsers = banned.filter((user) => {
    if (filterType === "all") return true;
    return user.ban_type.toLowerCase() === filterType;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="fixed top-0 left-0 h-full">
        <SuperSidebar />
      </div>
      <div className="flex-1 ml-72 flex flex-col">
        <SuperAdminHeader />
        <main className="flex-1 p-6">
          {error && (
            <div className="bg-rose-100 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-400 p-4 mb-6 rounded-md">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Banned Users
            </h1>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden flex">
              <select
                className="border-none bg-transparent py-2 pl-3 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Ban Types</option>
                <option value="permanent">Permanent Ban</option>
                <option value="temporary">Temporary Ban</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center h-60 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">No banned users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.user_id}
                  className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${!isNotificationRead(user.user_id) ? 'border-l-4 border-red-500 dark:border-red-500' : ''}`}
                >
                  <div className={`p-4 ${user.ban_type.toLowerCase() === "permanent" ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/20' : 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/20'}`}>
                    <div className="flex justify-between items-center">
                      <h2 className="flex items-center font-bold text-slate-800 dark:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1.5 ${user.ban_type.toLowerCase() === "permanent" ? 'text-red-500' : 'text-amber-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        {user.ban_type.toLowerCase() === "permanent" ? 'Permanent Ban' : 'Temporary Ban'}
                      </h2>
                      {!isNotificationRead(user.user_id) && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">User:</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white">
                          {userNames[user.user_id] || 'Loading...'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID:</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white">{user.user_id}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white">{user.email}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Banned at:</span>
                        <span className="text-sm font-bold text-gray-800 dark:text-white">{new Date(user.banned_at).toLocaleDateString()}</span>
                      </div>
                      
                      {user.ban_type.toLowerCase() !== "permanent" && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration:</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">{user.duration}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires at:</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">{new Date(user.expires_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Warnings:</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">{user.warnings}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      {!isNotificationRead(user.user_id) ? (
                        <button
                          onClick={() => handleMarkAsRead(user.user_id)}
                          disabled={markingAsRead[user.user_id]}
                          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                            markingAsRead[user.user_id] 
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' 
                              : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'
                          }`}
                        >
                          {markingAsRead[user.user_id] ? (
                            <span>Processing...</span>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Mark as Read
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center justify-center text-green-600 font-medium px-3 py-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Read
                        </div>
                      )}
                    </div>
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

export default List_Banned_User;
