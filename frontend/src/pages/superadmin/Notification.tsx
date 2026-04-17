import React, { useState, useEffect } from "react";
import AdminFooter from "../../components/admin/AdminFooter";
import axios from "axios";
import SuperAdminHeader from "../../components/SuperAdminHeader ";
import SuperSidebar from "../../components/SuperSidebar";
import { useNavigate } from "react-router-dom";
import { useNotification } from "./NotificationContext";

const Notification: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();
  const [markingAsRead, setMarkingAsRead] = useState<{[key: string]: boolean}>({});
  // New state variables for user filtering
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  
  // Use notification context to update header count
  const { fetchNotificationCount } = useNotification();
  
  // Track read notifications in localStorage
  const [readNotifications, setReadNotifications] = useState<Set<string>>(() => 
    new Set(JSON.parse(localStorage.getItem('readNotifications') || '[]'))
  );

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:10007/api/v1/auth/user/fetch/${userId}`, {
        method: "GET",
        headers: {
          "Accept": "*/*",
          "User-Agent": "Thunder Client (https://www.thunderclient.com)"
        }
      });
      const data = await response.json();
      return {
        username: data.data.first_name + " " + data.data.last_name,
        email: data.data.email
      };
    } catch (error) {
      console.error("Failed to fetch user details", error);
      return { username: "N/A", email: "N/A" };
    }
  };

  // Function to fetch all users
  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing. Please log in again.");
        return;
      }

      // First get all user activities to extract unique user IDs
      const response = await axios.post("http://localhost:10007/api/v1/useractivity/list", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const activitiesData = response.data.data;
      
      // Extract unique user IDs from activities and ensure they're strings
      const uniqueUserIds = [...new Set(activitiesData.map((activity: any) => activity.user_id))] as string[];
      
      // Fetch user details for each unique user ID
      const usersPromises = uniqueUserIds.map(async (userId: string) => {
        try {
          const response = await fetch(`http://127.0.0.1:10007/api/v1/auth/user/fetch/${userId}`, {
            method: "GET",
            headers: {
              "Accept": "*/*",
              "User-Agent": "Thunder Client (https://www.thunderclient.com)"
            }
          });
          const data = await response.json();
          
          // Check if data exists and type is exactly "user" 
          if (data && data.data && data.data.type === "user") {
            // Only return users with type "user"
            return {
              id: userId,
              name: `${data.data.first_name} ${data.data.last_name}`
            };
          }
          // Skip this user if not of type "user"
          return null;
        } catch (error) {
          console.error(`Failed to fetch user details for ID: ${userId}`, error);
          return null;
        }
      });
      
      const userResults = await Promise.all(usersPromises);
      
      // Filter out null values (failed requests or non-user types)
      const usersList = userResults.filter(user => user !== null);
      
      setUsers(usersList);
    } catch (error) {
      console.error("Failed to fetch users list", error);
      setError("Failed to load users for filtering.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserActivities = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:10007/api/v1/useractivity/list", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const activitiesData = response.data.data;

      // Fetch usernames and emails for each activity
      const activitiesWithUserDetails = await Promise.all(
        activitiesData.map(async (activity: any) => {
          const userDetails = await fetchUserDetails(activity.user_id);
          return { ...activity, ...userDetails };
        })
      );

      // Sort activities by timestamp in descending order (newest first)
      const sortedActivities = [...activitiesWithUserDetails].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(sortedActivities);
      setNotificationCount(sortedActivities.length);
      
      // Calculate unread notifications
      const unreadActivities = sortedActivities.filter(
        (activity: any) => !readNotifications.has(activity.id.toString())
      );
      setUnreadCount(unreadActivities.length);
      
      // Update global notification count in context
      updateGlobalNotificationCount(unreadActivities.length);
      
    } catch (error) {
      setError("Failed to fetch user activities.");
    }
  };

  // Function to update global notification count for the bell icon
  const updateGlobalNotificationCount = (count: number) => {
    // Store the unread count in localStorage so header can access it
    localStorage.setItem('unreadNotificationCount', count.toString());
    
    // Update the context to refresh the header
    fetchNotificationCount();
  };

  useEffect(() => {
    fetchUserActivities();
    fetchAllUsers(); // Fetch users for dropdown
  }, [readNotifications]);

  const handleGiveWarning = (userId: string) => {
    navigate(`/superadmin/add-warning?userId=${userId}`);
  };

  const handleMarkAsRead = (notificationId: string) => {
    try {
      // Set loading state for this specific notification
      setMarkingAsRead(prev => ({ ...prev, [notificationId]: true }));
      
      // Update local storage tracking
      const newReadNotifications = new Set(readNotifications);
      newReadNotifications.add(notificationId.toString());
      setReadNotifications(newReadNotifications);
      
      // Update localStorage
      localStorage.setItem('readNotifications', JSON.stringify([...newReadNotifications]));
      
      // Calculate and update new unread count
      const newUnreadCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newUnreadCount);
      
      // Update global notification count for the header
      updateGlobalNotificationCount(newUnreadCount);
      
    } catch (err) {
      setError("An error occurred while updating notification");
    } finally {
      // Clear loading state
      setMarkingAsRead(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const isNotificationRead = (notificationId: string) => {
    return readNotifications.has(notificationId.toString());
  };

  // Filter activities based on selected user
  const filteredActivities = selectedUser === "all" 
    ? activities 
    : activities.filter(activity => activity.username === selectedUser);

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
        <main className="flex-grow mt-16 p-6 bg-gray-900 text-gray-100">
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-100">User Activity Management</h1>
            <p className="text-gray-400">
              <span className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
                Total: {notificationCount} | Unread: <span className="text-blue-400 font-bold">{unreadCount}</span>
              </span>
            </p>
          </div>

          {/* User filter dropdown */}
          <div className="mb-6">
            <label htmlFor="userFilter" className="block text-sm font-medium text-gray-400 mb-2">
              Filter by User:
            </label>
            <select
              id="userFilter"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-80 p-2.5"
              disabled={loadingUsers}
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.name}>{user.name}</option>
              ))}
            </select>
            {loadingUsers && <p className="mt-2 text-sm text-gray-400">Loading users...</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {filteredActivities.length === 0 ? (
              <p className="text-gray-400">No user activities found.</p>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`bg-gray-800 rounded-xl ${
                    !isNotificationRead(activity.id) 
                      ? 'border-l-4 border-blue-500' 
                      : 'border border-gray-700'
                  } shadow-md hover:shadow-lg transition-all duration-300`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-200">Activity</h2>
                      {!isNotificationRead(activity.id) && (
                        <span className="bg-blue-900 text-blue-200 text-xs px-3 py-1 rounded-full">
                          Unread
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Username:</span>
                        <span className="text-gray-200">{activity.username || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-gray-200">{activity.email || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Activity:</span>
                        <span className="text-gray-200 text-right max-w-[70%]">{activity.activity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Timestamp:</span>
                        <span className="text-gray-200">{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => handleGiveWarning(activity.user_id)}
                        className="bg-yellow-700 hover:bg-yellow-800 text-white px-3 py-2 rounded font-medium text-sm transition-colors border border-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                      >
                        Give Warning
                      </button>
                      
                      {!isNotificationRead(activity.id) && (
                        <button
                          onClick={() => handleMarkAsRead(activity.id)}
                          disabled={markingAsRead[activity.id]}
                          className={`${
                            markingAsRead[activity.id] 
                              ? 'bg-gray-600 cursor-not-allowed' 
                              : 'bg-blue-700 hover:bg-blue-800 border border-blue-600'
                          } text-white px-3 py-2 rounded font-medium text-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        >
                          {markingAsRead[activity.id] ? 'Processing...' : 'Mark as Read'}
                        </button>
                      )}
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

export default Notification;