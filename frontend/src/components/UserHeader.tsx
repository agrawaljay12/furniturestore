import React, { useState, useEffect, useRef } from "react";
import { FiUser, FiLogOut, FiLock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useRetailer } from "../pages/retailer/RetailerContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const UserHeader: React.FC = () => {
  const { retailer, setRetailer } = useRetailer();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRetailerDetails = async () => {
      setIsLoading(true);
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
          setRetailer(response.data.data);
        } else {
          console.error("No retailer data returned from server.");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.response?.data || error.message);
        } else {
          console.error("Unexpected error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!retailer) {
      fetchRetailerDetails();
    }
  }, [retailer, setRetailer]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-20 bg-gray-900 shadow-sm border-b border-gray-800">
      <div className="flex justify-end items-center px-4 py-3 lg:px-6">
        <div className="flex items-center space-x-4">
          {/* Profile Menu */}
          <div className="relative profile-menu" ref={profileMenuRef}>
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2 cursor-pointer group transition-all duration-200 hover:opacity-90 transform hover:scale-105"
            >
              <div className="overflow-hidden rounded-full border-2 border-teal-400 p-[1px] transition-all duration-200 group-hover:border-teal-300 group-hover:shadow-md group-hover:shadow-teal-400/20">
                {isLoading ? (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse"></div>
                ) : (
                  <img
                    src={retailer?.profile_picture || "https://via.placeholder.com/40"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                    }}
                  />
                )}
              </div>
              <div className="hidden lg:block text-right">
                {isLoading ? (
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-2 w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-white group-hover:text-teal-300 transition-colors">
                      {retailer?.first_name} {retailer?.last_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Retailer
                    </p>
                  </>
                )}
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
                        src={retailer?.profile_picture || "https://via.placeholder.com/40"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                        }}
                      />
                      <div>
                        <p className="font-medium">{retailer?.first_name} {retailer?.last_name}</p>
                        <p className="text-xs text-teal-100 mt-1">{retailer?.email || 'retailer@example.com'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      to="/retailer/profile"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-200 hover:text-teal-600 dark:hover:text-teal-300"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiUser className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
                      Edit Profile
                    </Link>
                    
                    <Link
                      to="/retailer/change-password"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-200 hover:text-teal-600 dark:hover:text-teal-300"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiLock className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
                      Change Password
                    </Link>
                    
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200 hover:text-rose-700 dark:hover:text-rose-300"
                    >
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

export default UserHeader;