import React, { useState, useEffect } from "react";
import {  FiUser, FiLock, FiLogOut, FiBell, FiShield } from "react-icons/fi";
import { Link, useNavigate} from "react-router-dom";
import { useAdmin } from "../../pages/admin/Admincontext";
import { useNotification } from "../../pages/admin/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const AdminHeader: React.FC = () => {
  const { admin, setAdmin } = useAdmin();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const { markNotificationsAsRead } = useNotification();
  
  // Add state for banned users notifications
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem('readNotifications') || '[]'))
  );
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing");
          return;
        }
        const response = await axios.get(
          `https://furnspace.onrender.com/api/v1/auth/user/fetch/${token}`
        );
        if (response.data && response.data.data) {
          setAdmin(response.data.data);
        } else {
          console.error("No admin data returned from server.");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.response?.data || error.message);
        } else {
          console.error("Unexpected error:", error);
        }
      }
    };
  
    if (!admin) {
      fetchAdminDetails();
    }
    
    // Fetch banned users notifications
    fetchBannedUsers();
    
    // Set up interval to check for new banned users periodically
    const intervalId = setInterval(fetchBannedUsers, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [admin, setAdmin]);
  
  // Save read notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify([...readNotifications]));
  }, [readNotifications]);

  // Function to fetch banned users and count unread notifications
  const fetchBannedUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token is missing");
      return;
    }

    try {
      const response = await axios.get("https://furnspace.onrender.com/api/v1/banned/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        // Process banned users and create a unique list
        const uniqueBannedUsers = new Map();
        response.data.data.forEach((user: any) => {
          if (!uniqueBannedUsers.has(user.user_id)) {
            uniqueBannedUsers.set(user.user_id, user);
          }
        });
        
        const bannedUsersList = Array.from(uniqueBannedUsers.values());
        setBannedUsers(bannedUsersList);
        
        // Count unread notifications
        const unread = bannedUsersList.filter(user => !readNotifications.has(user.user_id.toString())).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to fetch banned users:", error);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleNotificationClick = () => {
    // Mark all current notifications as read
    const newReadNotifications = new Set(readNotifications);
    bannedUsers.forEach(user => {
      newReadNotifications.add(user.user_id.toString());
    });
    
    setReadNotifications(newReadNotifications);
    setUnreadCount(0);
    
    markNotificationsAsRead();
    setIsNotificationMenuOpen(false);
    navigate("/admin/banned-users");
  };

  const closeMenus = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".profile-menu") && !target.closest(".notification-menu")) {
      setIsProfileMenuOpen(false);
      setIsNotificationMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeMenus);
    return () => {
      document.removeEventListener("mousedown", closeMenus);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-gray-900 shadow-sm border-b border-gray-800">
      <div className="flex justify-end items-center px-4 py-3 lg:px-6">
        {/* Removed: Page Title Section */}
        {/* Removed: Search Section */}

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-4">
          {/* Removed: Theme Toggle */}

          {/* Notifications Icon */}
          <div className="relative notification-menu">
            <button 
              onClick={() => {
                setIsNotificationMenuOpen(!isNotificationMenuOpen);
                setIsProfileMenuOpen(false);
              }}
              className="p-2 rounded-full text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <FiBell size={20} className={unreadCount > 0 ? "text-teal-500" : ""} />
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 text-xs bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>
            
            <AnimatePresence>
              {isNotificationMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-1 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                >
                  <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium flex justify-between items-center">
                    <span className="flex items-center">
                      <FiBell className="mr-2" /> Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-white text-teal-600 text-xs rounded-full px-2 py-0.5 font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {bannedUsers.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {bannedUsers.map((user) => (
                          <div 
                            key={user.user_id}
                            className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-200 ${
                              !readNotifications.has(user.user_id.toString()) ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                            }`}
                            onClick={handleNotificationClick}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 bg-rose-100 dark:bg-rose-500/20 rounded-full p-2">
                                <FiShield className="text-rose-600 dark:text-rose-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-slate-800 dark:text-white">
                                  User Banned: {user.email || "Unknown"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  Reason: {user.reason || "No reason provided"}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                  {new Date(user.created_at || Date.now()).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                        No notifications available
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/30 text-center">
                    <button 
                      onClick={handleNotificationClick}
                      className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium"
                    >
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative profile-menu">
            <button 
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsNotificationMenuOpen(false);
              }}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="overflow-hidden rounded-full border-2 border-teal-400 p-[1px]">
                <img
                  src={admin?.profile_picture || "https://via.placeholder.com/40"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover group-hover:opacity-90 transition-opacity"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                  }}
                />
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-sm font-medium text-white">
                  {admin?.first_name} {admin?.last_name}
                </p>
                <p className="text-xs text-gray-400">
                  Administrator
                </p>
              </div>
            </button>
            
            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                >
                  <div className="p-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
                    <div className="flex items-center space-x-3">
                      <img
                        src={admin?.profile_picture || "https://via.placeholder.com/40"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                        }}
                      />
                      <div>
                        <p className="font-medium">{admin?.first_name} {admin?.last_name}</p>
                        <p className="text-xs text-teal-100 mt-1">{admin?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      to="/admin/view-profile"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiUser className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
                      Edit Profile
                    </Link>
                    
                    <Link
                      to="/admin/change-password"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiLock className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
                      Change Password
                    </Link>
                    
                   
                    
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors duration-200" >
                      <FiLogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Removed: Mobile Search Section */}
    </header>
  );
};

export default AdminHeader;