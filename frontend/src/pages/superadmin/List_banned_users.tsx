import React, { useState, useEffect } from "react";
import AdminFooter from "../../components/admin/AdminFooter";
import axios from "axios";
import SuperAdminHeader from "../../components/SuperAdminHeader ";
import SuperSidebar from "../../components/SuperSidebar";
import { motion } from "framer-motion";
import { FaBan, FaFilter, FaUserSlash } from "react-icons/fa";

const Banned_User: React.FC = () => {
  const [banned, setBanned] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsername = async (userId: string) => {
    try {
      const response = await fetch(`https://furnspace.onrender.com/api/v1/auth/user/fetch/${userId}`, {
        method: "GET",
        headers: {
          "Accept": "*/*",
          "User-Agent": "Thunder Client (https://www.thunderclient.com)"
        }
      });
      const data = await response.json();
      return data.data.first_name + " " + data.data.last_name;
    } catch (error) {
      console.error("Failed to fetch username", error);
      return "N/A";
    }
  };

  const fetchBannedUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token is missing. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get("https://furnspace.onrender.com/api/v1/banned/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const uniqueBannedUsers = new Map();
      const bannedUsersData = await Promise.all(
        response.data.data.map(async (user: any) => {
          const username = await fetchUsername(user.user_id);
          return { ...user, username };
        })
      );

      bannedUsersData.forEach((user: any) => {
        if (!uniqueBannedUsers.has(user.user_id)) {
          uniqueBannedUsers.set(user.user_id, user);
        }
      });

      setBanned(Array.from(uniqueBannedUsers.values()));
      setIsLoading(false);
    } catch (error) {
      setError("Failed to fetch banned users.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBannedUser();
  }, []);

  const filteredUsers = banned.filter((user) => {
    if (filterType === "all") return true;
    return user.ban_type.toLowerCase() === filterType;
  });

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
      <div className="flex-1 ml-0 lg:ml-72 flex flex-col min-h-screen">
        {/* Fixed Header */}
        <div className="fixed top-0 right-0 left-0 lg:left-72 z-20 bg-gray-900 border-b border-gray-700">
          <SuperAdminHeader />
        </div>

        {/* Main content with padding for fixed header */}
        <main className="flex-grow mt-16 p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-100">Banned Users</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Manage all banned users in the system
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center">
                <FaFilter className="text-gray-400 mr-2" />
                <select
                  className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Bans</option>
                  <option value="permanent">Permanent Bans</option>
                  <option value="temporary">Temporary Bans</option>
                </select>
              </div>
            </div>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-900 border border-red-800 text-red-200 rounded-lg p-4 mb-6"
            >
              <p>{error}</p>
            </motion.div>
          )}

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
              {filteredUsers.length === 0 ? (
                <motion.div 
                  variants={item}
                  className="col-span-full flex flex-col items-center justify-center p-12 bg-gray-800 rounded-xl border border-gray-700"
                >
                  <FaUserSlash className="text-5xl text-gray-600 mb-4" />
                  <p className="text-gray-400 text-xl">No banned users found</p>
                </motion.div>
              ) : (
                filteredUsers.map((user) => (
                  <motion.div
                    key={user.user_id}
                    variants={item}
                    className="bg-gray-800 rounded-xl border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-200">{user.username || "Banned User"}</h2>
                        <div className={`p-2 rounded-full ${user.ban_type.toLowerCase() === "permanent" ? "bg-red-900" : "bg-amber-900"}`}>
                          <FaBan className={`${user.ban_type.toLowerCase() === "permanent" ? "text-red-300" : "text-amber-300"} text-lg`} />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="text-gray-200">{user.email || "N/A"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ban Type:</span>
                          <span className={user.ban_type.toLowerCase() === "permanent" ? "text-red-400 font-medium" : "text-amber-400 font-medium"}>
                            {user.ban_type}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Banned at:</span>
                          <span className="text-gray-200">{new Date(user.banned_at).toLocaleDateString()}</span>
                        </div>
                        
                        {user.ban_type.toLowerCase() !== "permanent" && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Duration:</span>
                              <span className="text-gray-200">{user.duration}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-400">Expires at:</span>
                              <span className="text-gray-200">{new Date(user.expires_at).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-gray-400">Warnings:</span>
                              <span className="text-gray-200">{user.warnings || 0}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={`bg-gradient-to-r ${user.ban_type.toLowerCase() === "permanent" ? "from-red-600 to-red-800" : "from-amber-600 to-amber-800"} h-1 rounded-b-xl`}></div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </main>
        
        {/* Footer */}
        <div className="mt-auto">
          <AdminFooter />
        </div>
      </div>
    </div>
  );
};

export default Banned_User;