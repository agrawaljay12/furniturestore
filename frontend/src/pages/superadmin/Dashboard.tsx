import React, { useEffect, useState } from 'react';
import SuperSidebar from '../../components/SuperSidebar';
import SuperAdminHeader from '../../components/SuperAdminHeader ';
import AdminFooter from '../../components/admin/AdminFooter';
import { FaUsers, FaExclamationTriangle, FaBan, FaCheck, FaTimes, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SuperDashboard: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalWarnings, setTotalWarnings] = useState(0);
  const [temporaryBans, setTemporaryBans] = useState(0);
  const [permanentBans, setPermanentBans] = useState(0);
  const [approvedFurniture, setApprovedFurniture] = useState(0);
  const [rejectedFurniture, setRejectedFurniture] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUsers(),
          fetchWarnings(),
          fetchBans(),
          fetchFurniture()
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchUsers = async () => {
    try {
      const headersList = {
        "Content-Type": "application/json"
      };

      const bodyContent = JSON.stringify({});

      const response = await fetch("https://furnspace.onrender.com/api/v1/auth/get_users", {
        method: "POST",
        body: bodyContent,
        headers: headersList
      });

      const data = await response.json();
      const userCount = data.data.filter((user: any) => user.type === "user").length;
      setTotalUsers(userCount);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchWarnings = async () => {
    try {
      const headersList = {
        "Content-Type": "application/json"
      };

        const response = await fetch("https://furnspace.onrender.com/api/v1/warning/list", {
          method: "GET",
        headers: headersList
      });

      const data = await response.json();
      const userWarnings = data.data.filter((warning: any) => warning.user_id).length;
      setTotalWarnings(userWarnings);
    } catch (error) {
      console.error("Error fetching warnings:", error);
    }
  };

  const fetchBans = async () => {
    try {
      const headersList = {
        "Content-Type": "application/json"
      };

      const response = await fetch("https://furnspace.onrender.com/api/v1/banned/list", {
        method: "GET",
        headers: headersList
      });

      const data = await response.json();
      const tempBans = data.data.filter((ban: any) => ban.ban_type === "temporary").length;
      setTemporaryBans(tempBans);

      const permBans = data.data.filter((ban: any) => ban.ban_type === "permanent").length;
      setPermanentBans(permBans);
    } catch (error) {
      console.error("Error fetching bans:", error);
    }
  };

  const fetchFurniture = async () => {
    try {
      const headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Content-Type": "application/json"
      };


      const response = await fetch("https://furnspace.onrender.com/api/v1/furniture/list_all_furniture", { 
        method: "GET",
        headers: headersList
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Furniture API error (${response.status}):`, errorText);
        setApprovedFurniture(0);
        setRejectedFurniture(0);
        return;
      }

      const data = await response.json();
      
      if (data && data.data && Array.isArray(data.data)) {
        const approved = data.data.filter((item: any) => 
          item.status === "approved"
        ).length;
        
        const rejected = data.data.filter((item: any) => 
          item.status === "rejected"
        ).length;
        
        setApprovedFurniture(approved);
        setRejectedFurniture(rejected);
      } else {
        setApprovedFurniture(0);
        setRejectedFurniture(0);
      }
    } catch (error) {
      setApprovedFurniture(0);
      setRejectedFurniture(0);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-full z-30">
        <SuperSidebar />
      </div>

      {/* Main content area with fixed header */}
      <div className="flex-1 ml-0 lg:ml-72">
        {/* Fixed Header */}
        <div className="fixed top-0 right-0 left-0 lg:left-72 z-20 bg-gray-900 border-b border-gray-700">
          <SuperAdminHeader />
        </div>

        {/* Main content with padding for fixed header */}
        <main className="mt-16 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Welcome to the Super Admin Dashboard
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <span className="bg-teal-900 text-teal-200 text-sm font-medium px-3 py-1 rounded-full">
                  Moderator Panel
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div 
                className="bg-gray-800 rounded-xl border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                variants={item}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-200">Total Users</h2>
                    <div className="p-3 bg-indigo-900 rounded-full">
                      <FaUsers className="text-indigo-300 text-xl" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold text-gray-100">{totalUsers}</p>
                    <p className="ml-2 text-sm text-gray-400">registered users</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-900 h-1 rounded-b-xl"></div>
              </motion.div>

              <motion.div 
                className="bg-gray-800 rounded-xl border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                variants={item}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-200">Warnings</h2>
                    <div className="p-3 bg-amber-900 rounded-full">
                      <FaExclamationTriangle className="text-amber-300 text-xl" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold text-gray-100">{totalWarnings}</p>
                    <p className="ml-2 text-sm text-gray-400">active warnings</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-amber-600 to-amber-800 h-1 rounded-b-xl"></div>
              </motion.div>

              <motion.div 
                className="bg-gray-800 rounded-xl border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                variants={item}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-200">Temporary Bans</h2>
                    <div className="p-3 bg-blue-900 rounded-full">
                      <FaBan className="text-blue-300 text-xl" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold text-gray-100">{temporaryBans}</p>
                    <p className="ml-2 text-sm text-gray-400">current bans</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-1 rounded-b-xl"></div>
              </motion.div>

              <motion.div 
                className="bg-gray-800 rounded-xl border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                variants={item}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-200">Permanent Bans</h2>
                    <div className="p-3 bg-red-900 rounded-full">
                      <FaBan className="text-red-300 text-xl" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold text-gray-100">{permanentBans}</p>
                    <p className="ml-2 text-sm text-gray-400">banned accounts</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-600 to-red-800 h-1 rounded-b-xl"></div>
              </motion.div>

              <motion.div 
                className="bg-gray-800 rounded-xl border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                variants={item}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-200">Approved Furniture</h2>
                    <div className="p-3 bg-green-900 rounded-full">
                      <FaCheck className="text-green-300 text-xl" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold text-gray-100">{approvedFurniture}</p>
                    <p className="ml-2 text-sm text-gray-400">approved items</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-600 to-green-800 h-1 rounded-b-xl"></div>
              </motion.div>

              <motion.div 
                className="bg-gray-800 rounded-xl border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                variants={item}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-200">Rejected Furniture</h2>
                    <div className="p-3 bg-orange-900 rounded-full">
                      <FaTimes className="text-orange-300 text-xl" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold text-gray-100">{rejectedFurniture}</p>
                    <p className="ml-2 text-sm text-gray-400">rejected items</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-600 to-orange-800 h-1 rounded-b-xl"></div>
              </motion.div>
            </motion.div>
          )}

          {/* Summary Section */}
          <motion.div
            variants={item}
            initial="hidden" 
            animate="show"
            className="mt-8 bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700"
          >
            <div className="flex items-center mb-4">
              <FaChartLine className="text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-200">Activity Summary</h2>
            </div>
            <p className="text-gray-400">
              Your platform currently has {totalUsers} users with {totalWarnings} warnings issued.
              There are {temporaryBans} temporary bans and {permanentBans} permanent bans active.
              {approvedFurniture} furniture items have been approved and {rejectedFurniture} have been rejected.
            </p>
          </motion.div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default SuperDashboard;