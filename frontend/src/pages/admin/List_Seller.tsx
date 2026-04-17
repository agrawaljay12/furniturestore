import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminFooter from "../../components/admin/AdminFooter";
import axios from "axios";
import { FiUsers, FiMail, FiPhone, FiMapPin, FiTrash2 } from "react-icons/fi";

const ListSeller: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]); // Store the list of users
  const [error, setError] = useState<string>(""); // Error message state
  // Success message state (removed as it was unused)

  const fetchUsers = async () => {
    const token = localStorage.getItem("token"); // Assuming the auth token is stored in localStorage.

    if (!token) {
      setError("Token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.post("https://furnspace.onrender.com/api/v1/auth/get_users", {}, {

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allUsers = response.data.data; 
      const filteredUsers = allUsers.filter((user: any) => user.type === "retailer"); // filter user based on type ==="user"
      setUsers(filteredUsers);
      console.log(filteredUsers);
    } catch (error) {
      setError("Failed to fetch users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  // delete user functionality 
  const deleteUser = async (userId: string) => {
    const token = localStorage.getItem("token");
    // alert(userId);
    if (!token) {
      setError("Token is missing. Please log in again.");
      return;
    }
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) {
      return;
    }
    let headersList = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    let bodyContent = JSON.stringify({}); // Empty body content

    try {
      let response = await fetch(`https://furnspace.onrender.com/api/v1/auth/delete_user/${userId}`, {
        method: "POST",
        body: bodyContent,
        headers: headersList
      });

      if (response.ok) {

        // setSuccess("User deleted successfully.");
        // setUsers(users.filter(user => user._id !== userId));
        fetchUsers();
      } else {
        setError("Failed to delete user.");
      }
    } catch (error) {
      setError("Failed to delete user.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="fixed top-0 left-0 h-full">
        <Sidebar />
      </div>
      <div className="flex-1 ml-72 flex flex-col">
        <AdminHeader />
        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          {error && (
            <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-4 mb-6 rounded-md">
              <p className="font-medium">{error}</p>
            </div>
          )}
          {/* Success message section removed as it was unused */}

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
              <FiUsers className="mr-2 text-indigo-600 dark:text-indigo-400" />
              User Management
            </h1>
          </div>

          {/* User Cards - Enhanced Version */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-60 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  <span className="block text-5xl mb-3 opacity-30">👥</span>
                  No users found
                </p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user._id || user.email}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-20 relative">
                    <div className="absolute left-6 top-5 right-6 flex justify-between items-start">
                      <div className="bg-white dark:bg-slate-700 rounded-full p-1 shadow-md transform -translate-y-2 group-hover:scale-110 transition-transform">
                        <img
                          src={user.profile_picture || "https://via.placeholder.com/80?text=User"}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 pt-10 pb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                      {user.first_name} {user.last_name}
                    </h2>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start text-sm">
                        <FiMail className="mt-0.5 mr-2 text-indigo-500 dark:text-indigo-400" />
                        <span className="text-gray-600 dark:text-gray-300 break-all">{user.email}</span>
                      </div>
                      
                      <div className="flex items-start text-sm">
                        <FiPhone className="mt-0.5 mr-2 text-indigo-500 dark:text-indigo-400" />
                        <div className="text-gray-600 dark:text-gray-300">
                          <div>{user.phone || 'No phone'}</div>
                          {user.phone2 && <div className="text-gray-500">{user.phone2}</div>}
                        </div>
                      </div>
                      
                      <div className="flex items-start text-sm">
                        <FiMapPin className="mt-0.5 mr-2 text-indigo-500 dark:text-indigo-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {user.address}, {user.city}, {user.state}, {user.country}, {user.pin_code}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="w-full mt-2 flex items-center justify-center px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                    >
                      <FiTrash2 className="mr-1.5" />
                      Delete User
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default ListSeller;