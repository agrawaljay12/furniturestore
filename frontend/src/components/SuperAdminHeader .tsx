import React, { useState, useEffect, useRef } from "react";
import { FiBell, FiUser, FiLogOut,  FiLock} from "react-icons/fi";
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../pages/superadmin/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminHeader: React.FC = () => {
  const [profilePicture, setProfilePicture] = useState<string>('/path/to/default-profile-picture.jpg'); 
  const [username, setUsername] = useState<string>(''); 
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false); 
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  
  // Use the notification context instead of local state
  const { notificationCount, fetchNotificationCount } = useNotification();

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`https://furnspace.onrender.com/api/v1/auth/user/fetch/${token}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const result = await response.json();
        setUsername(result.data.first_name + " " + result.data.last_name);
        setProfilePicture(result.data.profile_picture);
      } catch (error) {
        console.error(error);
        navigate("/login");
      }
    };

    fetchProfileData();
    // Fetch notification count from context
    fetchNotificationCount();
    
    // Set up interval to refresh notifications every 30 seconds
    const intervalId = setInterval(fetchNotificationCount, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [navigate, fetchNotificationCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setIsNotificationMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef, notificationMenuRef]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleNotificationClick = () => {
    setIsNotificationMenuOpen(!isNotificationMenuOpen);
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 bg-gray-900 shadow-sm border-b border-gray-800">
      <div className="flex justify-end items-center px-4 py-3 lg:px-6">
        <div className="flex items-center space-x-4">
          {/* Notifications Icon */}
          <div className="relative notification-menu" ref={notificationMenuRef}>
            <button 
              onClick={handleNotificationClick}
              className="p-2 rounded-full text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 hover:shadow-md hover:shadow-gray-900/20 transform hover:scale-105"
            >
              <FiBell size={20} className={notificationCount > 0 ? "text-teal-500" : ""} />
              {notificationCount > 0 && (
                <motion.span 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 text-xs bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {notificationCount}
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
                    {notificationCount > 0 && (
                      <span className="bg-white text-teal-600 text-xs rounded-full px-2 py-0.5 font-semibold">
                        {notificationCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                      Click to view all notifications
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-700/30 text-center">
                    <button 
                      onClick={() => {
                        setIsNotificationMenuOpen(false);
                        navigate("/superadmin/notifications");
                      }}
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
          <div className="relative profile-menu" ref={profileMenuRef}>
            <button 
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsNotificationMenuOpen(false);
              }}
              className="flex items-center space-x-2 cursor-pointer group transition-all duration-200 hover:opacity-90 transform hover:scale-105"
            >
              <div className="overflow-hidden rounded-full border-2 border-teal-400 p-[1px] transition-all duration-200 group-hover:border-teal-300 group-hover:shadow-md group-hover:shadow-teal-400/20">
                <img
                  src={profilePicture || "https://via.placeholder.com/40"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover transition-opacity"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                  }}
                />
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-sm font-medium text-white group-hover:text-teal-300 transition-colors">
                  {username}
                </p>
                <p className="text-xs text-gray-400">
                  Moderator
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
                        src={profilePicture || "https://via.placeholder.com/40"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                        }}
                      />
                      <div>
                        <p className="font-medium">{username}</p>
                        <p className="text-xs text-teal-100 mt-1">{localStorage.getItem("email") || "superadmin@example.com"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      to="/superadmin/profile"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-200 hover:text-teal-600 dark:hover:text-teal-300"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiUser className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
                      Edit Profile
                    </Link>
                    
                    <Link
                      to="/superadmin/password"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-200 hover:text-teal-600 dark:hover:text-teal-300"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiLock className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
                      Change Password
                    </Link>
{/*                     
                    <Link
                      to="/superadmin/settings"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-200 hover:text-teal-600 dark:hover:text-teal-300"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiSettings className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
                      Settings
                    </Link> */}
                    
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200 hover:text-rose-700 dark:hover:text-rose-300" >
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
    </header>
  );
};

export default SuperAdminHeader;