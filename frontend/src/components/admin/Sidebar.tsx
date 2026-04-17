import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiHome,
  FiUsers,
  FiAlignJustify,
  FiSend,
  FiInbox,
  FiBox,
  FiGrid,
  FiCoffee,
  FiTv,
  FiTable,
  FiChevronDown,
  FiLayout,
  FiShield,
  FiBookOpen,
  FiCheckCircle,
  FiShoppingBag,
  FiTruck,
  FiShoppingCart,
} from "react-icons/fi";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Load message counts from localStorage
  useEffect(() => {
    const updateCounts = () => {
      const msgCount = localStorage.getItem('adminUnreadMessageCount');
      setUnreadMessages(msgCount ? parseInt(msgCount, 10) : 0);
    };

    // Initial load
    updateCounts();

    // Set up interval to check periodically
    const intervalId = setInterval(updateCounts, 5000);

    // Set up storage event listener to update when localStorage changes
    const handleStorageChange = () => {
      updateCounts();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminMessageCountUpdated', handleCustomStorageChange);
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminMessageCountUpdated', handleCustomStorageChange);
    };
  }, []);

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

  const handleCustomStorageChange = () => {
    const msgCount = localStorage.getItem('adminUnreadMessageCount');
    setUnreadMessages(msgCount ? parseInt(msgCount, 10) : 0);
  };

  // Toggle submenu
  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(item => item !== menu) 
        : [...prev, menu]
    );
  };

  const isMenuExpanded = (menu: string) => expandedMenus.includes(menu);
  
  const isActive = (path: string) => location.pathname === path;

  // Animation variants
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const submenuVariants = {
    hidden: { height: 0, opacity: 0, overflow: "hidden" },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        height: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 } 
      } 
    }
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
              {/* <p className="text-xs text-teal-300">Admin Dashboard</p> */}
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
                  to="/admin/dashboard"
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
          
          {/* User Management Section */}
          <div className="px-4 mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block ml-2">
              User Management
            </span>
            
            <ul className="space-y-1">
              <li>
                <Link
                  to="/admin/show-user"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/admin/show-user")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiUsers className={`w-5 h-5 ${isActive("/admin/show-user") ? "text-white" : "text-indigo-400"}`} />
                  <span className="font-medium">Users</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/list-deliveryboy"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/admin/list-deliveryboy")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiTruck className={`w-5 h-5 ${isActive("/admin/list-deliveryboy") ? "text-white" : "text-indigo-400"}`} />
                  <span className="font-medium">Delivery Boy </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/list-seller"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/admin/list-seller")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiShoppingBag className={`w-5 h-5 ${isActive("/admin/list-seller") ? "text-white" : "text-indigo-400"}`} />
                  <span className="font-medium"> Retailer </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/show-moderator"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/admin/show-moderator")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiShield className={`w-5 h-5 ${isActive("/admin/show-moderator") ? "text-white" : "text-indigo-400"}`} />
                  <span className="font-medium">Moderators</span>
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
                  to="/admin/list-furniture"
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
              
              <li>
                <button
                  onClick={() => toggleMenu('furniture')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isMenuExpanded('furniture')
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FiGrid className="w-5 h-5 text-purple-400" />
                    <span className="font-medium">Catalog</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isMenuExpanded('furniture') ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isMenuExpanded('furniture') && (
                    <motion.div
                      variants={submenuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <ul className="pl-10 pt-1 pb-1 space-y-1">
                        <li>
                          <Link
                            to="/admin/chairs"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive("/admin/chairs")
                                ? "bg-teal-500/20 text-teal-300"
                                : "text-slate-400 hover:text-teal-300 hover:bg-white/5"
                            }`}
                          >
                            <FiGrid className="w-4 h-4" />
                            <span>Chairs</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/admin/living"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive("/admin/chairs")
                                ? "bg-teal-500/20 text-teal-300"
                                : "text-slate-400 hover:text-teal-300 hover:bg-white/5"
                            }`}
                          >
                            <FiGrid className="w-4 h-4" />
                            <span> Living room </span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/admin/tables"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive("/admin/tables")
                                ? "bg-teal-500/20 text-teal-300"
                                : "text-slate-400 hover:text-teal-300 hover:bg-white/5"
                            }`}
                          >
                            <FiTable className="w-4 h-4" />
                            <span>Tables</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/admin/bedroom"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive("/admin/bedroom")
                                ? "bg-teal-500/20 text-teal-300"
                                : "text-slate-400 hover:text-teal-300 hover:bg-white/5"
                            }`}
                          >
                            <FiBookOpen className="w-4 h-4" />
                            <span>Bedroom</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/admin/matt"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive("/admin/matt")
                                ? "bg-teal-500/20 text-teal-300"
                                : "text-slate-400 hover:text-teal-300 hover:bg-white/5"
                            }`}
                          >
                            <FiTv className="w-4 h-4" />
                            <span>Mattress</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/admin/din"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive("/admin/din")
                                ? "bg-teal-500/20 text-teal-300"
                                : "text-slate-400 hover:text-teal-300 hover:bg-white/5"
                            }`}
                          >
                            <FiCoffee className="w-4 h-4" />
                            <span>Dining Room</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/admin/store"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive("/admin/store")
                                ? "bg-teal-500/20 text-teal-300"
                                : "text-slate-400 hover:text-teal-300 hover:bg-white/5"
                            }`}
                          >
                            <FiBox className="w-4 h-4" />
                            <span>Storage</span>
                          </Link>
                        </li>
                        {/* <li>
                          <Link
                            to="/admin/list-discounts"
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive("/admin/list-discounts")
                                ? "bg-teal-500/20 text-teal-300"
                                : "text-slate-400 hover:text-teal-300 hover:bg-white/5"
                            }`}
                          >
                            <FiTag className="w-4 h-4" />
                            <span>Deals</span>
                          </Link>
                        </li> */}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>          
            </ul>
          </div>
          
          {/* Orders Management Section */}
          <div className="px-4 mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block ml-2">
              Orders
            </span>
            
            <ul className="space-y-1">
              <li>
                <Link
                  to="/admin/orders"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/admin/returns")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiShoppingCart className={`w-5 h-5 ${isActive("/admin/returns") ? "text-white" : "text-rose-400"}`} />
                  <span className="font-medium"> Orders </span>
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
                  to="/admin/send-message"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/admin/send-message")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiSend className={`w-5 h-5 ${isActive("/admin/send-message") ? "text-white" : "text-sky-400"}`} />
                  <span className="font-medium">Send Message</span>
                </Link>
              </li>
              
              <li>
                <Link
                  to="/admin/recieve-message"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/admin/recieve-message")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FiInbox className={`w-5 h-5 ${isActive("/admin/recieve-message") ? "text-white" : "text-sky-400"}`} />
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
          
          {/* Approval Section */}
          <div className="px-4 mb-6">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block ml-2">
              Approval Management
            </span>
            
            <ul className="space-y-1">
              <li>
                <Link
                  to="/admin/approved-rejected"
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive("/admin/approved-rejected")
                      ? "bg-gradient-to-tr from-teal-600/80 to-emerald-500/80 text-white shadow-md shadow-teal-900/20"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <FiCheckCircle className={`w-5 h-5 ${isActive("/admin/approved-rejected") ? "text-white" : "text-green-400"}`} />
                  <span className="font-medium">Approved Or Rejected</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Reports Section */}
          
        </div>
        
        {/* Footer Section
        <div className="absolute bottom-0 w-full p-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-xs text-slate-400">
            <div className="font-medium text-white mb-1">FurnitureHub Admin</div>
            <div>© 2023 FurnitureHub Inc.</div>
          </div>
        </div> */}
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

export default Sidebar;