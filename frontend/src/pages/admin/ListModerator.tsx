import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminFooter from "../../components/admin/AdminFooter";
import axios from "axios";

const ListModerator: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]); // Store the list of users
  const [error, setError] = useState<string>(""); // Error message state
  const [success, ] = useState<string>(""); // Success message state

  const fetchUsers = async () => {
    const token = localStorage.getItem("token"); // Assuming the auth token is stored in localStorage.

    if (!token) {
      setError("Token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:10007/api/v1/auth/get_users", {}, {

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allUsers = response.data.data; 
      const filteredUsers = allUsers.filter((user: any) => user.type === "moderator"); // filter user based on type ==="user"
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
      let response = await fetch(`http://127.0.0.1:10007/api/v1/auth/delete_user/${userId}`, {
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
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md">
              <p className="font-medium">{success}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
              Moderator Management
            </h1>
          </div>

          {/* Moderator Cards - Enhanced Version */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-60 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  <span className="block text-5xl mb-3 opacity-30">👥</span>
                  No moderators found
                </p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user._id || user.email}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-20 relative">
                    <div className="absolute left-6 top-5 right-6 flex justify-between items-start">
                      <div className="bg-white dark:bg-slate-700 rounded-full p-1 shadow-md transform -translate-y-2 group-hover:scale-110 transition-transform">
                        <img
                          src={user.profile_picture || "https://via.placeholder.com/80?text=Mod"}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      </div>
                      <div className="bg-purple-200 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-xs font-bold px-2.5 py-1 rounded-full">
                        Moderator
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 pt-10 pb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                      {user.first_name} {user.last_name}
                    </h2>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 mr-2 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300 break-all">{user.email}</span>
                      </div>
                      
                      <div className="flex items-start text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 mr-2 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div className="text-gray-600 dark:text-gray-300">
                          <div>{user.phone || 'No phone'}</div>
                          {user.phone2 && <div className="text-gray-500">{user.phone2}</div>}
                        </div>
                      </div>
                      
                      <div className="flex items-start text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 mr-2 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">
                          {user.address}, {user.city}, {user.state}, {user.country}, {user.pin_code}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="w-full mt-2 flex items-center justify-center px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Moderator
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

export default ListModerator;