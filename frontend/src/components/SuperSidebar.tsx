import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiMenu, 
  FiHome, 
  FiAlertCircle, 
  FiUserX, 
  FiLayout, 
  FiInbox,
  FiSend,
  FiPackage,
  FiThumbsUp
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const SuperSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  // const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const updateCounts = () => {
      const notifCount = localStorage.getItem('unreadNotificationCount');
      const msgCount = localStorage.getItem('unreadMessageCount');
      
      setUnreadNotifications(notifCount ? parseInt(notifCount, 10) : 0);
      setUnreadMessages(msgCount ? parseInt(msgCount, 10) : 0);
    };

    // Handle window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024) {
        setIsOpen(true); // Always open on desktop
      } else {
        setIsOpen(false); // Closed by default on mobile
      }
    };

    // Initialize sidebar state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    updateCounts();

    const intervalId = setInterval(updateCounts, 5000);

    const handleStorageChange = () => {
      updateCounts();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // // Toggle submenu
  // const toggleMenu = (menu: string) => {
  //   setExpandedMenus(prev => 
  //     prev.includes(menu) 
  //       ? prev.filter(item => item !== menu) 
  //       : [...prev, menu]
  //   );
  // };

  // const isMenuExpanded = (menu: string) => expandedMenus.includes(menu);
  
  const isActive = (path: string) => location.pathname === path;

  // Animation variants
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  // const submenuVariants = {
  //   hidden: { height: 0, opacity: 0, overflow: "hidden" },
  //   visible: { 
  //     height: "auto", 
  //     opacity: 1,
  //     transition: { 
  //       height: { type: "spring", stiffness: 300, damping: 30 },
  //       opacity: { duration: 0.2 } 
  //     } 
  //   }
  // };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && windowWidth < 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial={windowWidth >= 1024 ? "open" : "closed"}
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full bg-gray-900 text-white shadow-2xl z-60 w-72 pt-5"
      >
        {/* Add close button for mobile */}
        {windowWidth < 1024 && (
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute right-3 top-4 p-1 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
          >
            <FiMenu size={20} />
          </button>
        )}
        
        {/* Logo and Brand */}
        <div className="pt-4 pb-6 px-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-md">
              <FiLayout className="text-white text-xl" />
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-bold text-white">Furniture Store</h2>
              <p className="text-xs text-teal-300">Moderator Panel</p>
            </div>
          </div>
        </div>
        
        <div className="px-3 mb-3">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-[calc(100%-140px)] overflow-y-auto custom-scrollbar">
          {/* Navigation */}
          <div className="px-4 mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block ml-2">
              Dashboard
            </span>
            
            <ul className="space-y-1">
              <li>
                <Link
                  to="/superadmin/dashboard"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/superadmin/dashboard")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiHome className={`w-5 h-5 ${isActive("/superadmin/dashboard") ? "text-white" : "text-teal-400"}`} />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* User Management Section */}
          <div className="px-4 mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block ml-2">
              User Management
            </span>
            
            <ul className="space-y-1">
              <li>
                <Link
                  to="/superadmin/banned-users"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/superadmin/banned-users")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiUserX className={`w-5 h-5 ${isActive("/superadmin/banned-users") ? "text-white" : "text-indigo-400"}`} />
                  <span className="font-medium">Banned Users</span>
                </Link>
              </li>
              
              <li>
                <Link
                  to="/superadmin/list-warning"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/superadmin/list-warning")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiAlertCircle className={`w-5 h-5 ${isActive("/superadmin/list-warning") ? "text-white" : "text-indigo-400"}`} />
                  <span className="font-medium">Warnings</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Communication Section */}
          <div className="px-4 mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block ml-2">
              Messages
            </span>
            
            <ul className="space-y-1">
              <li>
                <Link
                  to="/superadmin/send-message"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/superadmin/send-message")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiSend className={`w-5 h-5 ${isActive("/superadmin/send-message") ? "text-white" : "text-sky-400"}`} />
                  <span className="font-medium">Send Message</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/superadmin/recieve-message"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/superadmin/recieve-message")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FiInbox className={`w-5 h-5 ${isActive("/superadmin/recieve-message") ? "text-white" : "text-sky-400"}`} />
                    <span className="font-medium">Inbox</span>
                  </div>
                  {unreadMessages > 0 && (
                    <span className="flex items-center justify-center text-xs font-medium rounded-full h-5 min-w-[20px] px-1 bg-rose-500 text-white">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Approval Management Section */}
          <div className="px-4 mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block ml-2">
              Approval Management
            </span>
            
            <ul className="space-y-1">
              <li>
                <Link
                  to="/superadmin/approved"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/superadmin/approved")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiPackage className={`w-5 h-5 ${isActive("/superadmin/approved") ? "text-white" : "text-amber-400"}`} />
                  <span className="font-medium">Seller Furniture</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/superadmin/approved-rejected"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/superadmin/approved-rejected")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiThumbsUp className={`w-5 h-5 ${isActive("/superadmin/approved-rejected") ? "text-white" : "text-green-400"}`} />
                  <span className="font-medium">Approved Or Rejected</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Settings Section
          <div className="px-4 mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block ml-2">
              System
            </span>
            
            <ul className="space-y-1">
              <li>
                <Link
                  to="/superadmin/notifications"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/superadmin/notifications")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FiAlertCircle className={`w-5 h-5 ${isActive("/superadmin/notifications") ? "text-white" : "text-amber-400"}`} />
                    <span className="font-medium">Notifications</span>
                  </div>
                  {unreadNotifications > 0 && (
                    <span className="flex items-center justify-center text-xs font-medium rounded-full h-5 min-w-[20px] px-1 bg-amber-500 text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
              </li>
              
              <li>
                <Link
                  to="/superadmin/settings"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/superadmin/settings")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiSettings className={`w-5 h-5 ${isActive("/superadmin/settings") ? "text-white" : "text-slate-400"}`} />
                  <span className="font-medium">Settings</span>
                </Link>
              </li>
            </ul>
          </div> */}
        </div>
      </motion.div>
      
      {/* Toggle Button for Mobile (outside sidebar) */}
      {!isOpen && windowWidth < 1024 && (
        <button
          className="fixed top-4 left-4 p-3 bg-teal-600 rounded-full text-white z-60 shadow-lg shadow-teal-900/50 hover:bg-teal-500 transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <FiMenu size={24} />
        </button>
      )}
    </>
  );
};

export default SuperSidebar;