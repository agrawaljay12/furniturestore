import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiHome,
  FiPlusSquare,
  FiAlignJustify,
  FiLayout,
} from "react-icons/fi";

const UserSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    // Track window size for responsive behavior
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-open sidebar on large screens, close on small screens initially
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    // Initial call to set correct state based on screen size
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  // Animation variants
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && windowWidth < 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
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
        className="fixed top-0 left-0 h-full bg-gray-900 text-white shadow-2xl z-50 w-72"
      >
        {/* Add close button for mobile */}
        {windowWidth < 1024 && (
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute right-3 top-3 p-1 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
          >
            <FiMenu size={20} />
          </button>
        )}
        
        {/* Logo and Brand */}
        <div className="pt-8 pb-6 px-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-md">
              <FiLayout className="text-white text-xl" />
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-bold text-white">Furniture Store </h2>
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
                  to="/retailer/dashboard"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/admin/dashboard")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiHome className={`w-5 h-5 ${isActive("/admin/dashboard") ? "text-white" : "text-teal-400"}`} />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Inventory Section */}
          <div className="px-4 mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block ml-2">
              Inventory
            </span>
            
            <ul className="space-y-1">
              <li>
                <Link
                  to="/retailer/add-furniture"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/admin/add-furniture")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiPlusSquare className={`w-5 h-5 ${isActive("/admin/add-furniture") ? "text-white" : "text-purple-400"}`} />
                  <span className="font-medium">Add Furniture</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/retailer/list-furniture"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/admin/list-furniture")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiAlignJustify className={`w-5 h-5 ${isActive("/admin/list-furniture") ? "text-white" : "text-purple-400"}`} />
                  <span className="font-medium">List Furniture</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
      
      {/* Toggle Button for Mobile (outside sidebar) */}
      {!isOpen && windowWidth < 1024 && (
        <button
          className="fixed bottom-6 left-6 p-3 bg-teal-600 rounded-full text-white z-40 shadow-lg shadow-teal-900/50 hover:bg-teal-500 transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <FiMenu size={24} />
        </button>
      )}
    </>
  );
};

export default UserSidebar;