import React, { useState, useEffect } from "react";
import { FiUser, FiLock, FiLogOut} from "react-icons/fi";
import { Link} from "react-router-dom";
import { useDeliveryBoy } from "../../pages/deliveryboy/DeliveryContexr";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const DeliveryHeader: React.FC = () => {
  const { deliveryBoy, setDeliveryBoy } = useDeliveryBoy();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchDeliveryBoyDetails = async () => {
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
          setDeliveryBoy(response.data.data);
        } else {
          console.error("No delivery boy data returned from server.");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.response?.data || error.message);
        } else {
          console.error("Unexpected error:", error);
        }
      }
    };
  
    if (!deliveryBoy) {
      fetchDeliveryBoyDetails();
    }
  }, [deliveryBoy, setDeliveryBoy]);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const closeMenus = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".profile-menu")) {
      setIsProfileMenuOpen(false);
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
        {/* Right Section - Actions */}
        <div className="flex items-center space-x-4">
          {/* Profile Menu */}
          <div className="relative profile-menu">
            <button 
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
              }}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="overflow-hidden rounded-full border-2 border-teal-400 p-[1px]">
                <img
                  src={deliveryBoy?.profile_picture || "https://via.placeholder.com/40"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover group-hover:opacity-90 transition-opacity"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                  }}
                />
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-sm font-medium text-white">
                  {deliveryBoy?.first_name} {deliveryBoy?.last_name}
                </p>
                <p className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full inline-block mt-1">
                  Delivery Boy
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
                        src={deliveryBoy?.profile_picture || "https://via.placeholder.com/40"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                        }}
                      />
                      <div>
                        <p className="font-medium">{deliveryBoy?.first_name} {deliveryBoy?.last_name}</p>
                        <p className="text-xs bg-white text-teal-700 px-2 py-0.5 rounded-full inline-block mt-1 font-medium">
                          Delivery Boy
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      to="/deliveryboy/profile"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiUser className="w-4 h-4 mr-3 text-slate-500 dark:text-slate-400" />
                      Edit Profile
                    </Link>
                    
                    <Link
                      to="/deliveryboy/password"
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
    </header>
  );
};

export default DeliveryHeader;