import React, { useState, useEffect } from "react";
import AdminFooter from "../../components/admin/AdminFooter";
import axios from "axios";
import SuperAdminHeader from "../../components/SuperAdminHeader ";
import SuperSidebar from "../../components/SuperSidebar";

const ListWarning: React.FC = () => {
  const [warnings, setWarnings] = useState<any[]>([]); // Store the list of warnings
  const [error, setError] = useState<string>(""); // Error message state
  const [totalWarnings, setTotalWarnings] = useState<number>(0); // Store the total number of warnings
  const [userWarningsCount, setUserWarningsCount] = useState<{ [key: string]: number }>({}); // Store the total number of warnings for each user
  const [bannedUsers, setBannedUsers] = useState<string[]>([]); // Track banned users

  const fetchWarnings = async () => {
    const token = localStorage.getItem("token"); // Assuming the auth token is stored in localStorage.

    if (!token) {
      setError("Token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.get("https://furnspace.onrender.com/api/v1/warning/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      console.log(response.data.data);

      // Fetch banned users to exclude them from warnings
      const bannedResponse = await axios.get("https://furnspace.onrender.com/api/v1/banned/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const bannedUserIds = bannedResponse.data.data.map((bannedUser: any) => bannedUser.user_id);
      setBannedUsers(bannedUserIds);

      // Filter out any warnings for users who are already banned
      const filteredData = response.data.data.filter(
        (warning: any) => !bannedUserIds.includes(warning.user_id)
      );

      const uniqueWarnings = new Map();
      filteredData.forEach((warning: any) => {
        if (!uniqueWarnings.has(warning.user_id)) {
          uniqueWarnings.set(warning.user_id, warning);
        }
      });
      const filteredWarnings = Array.from(uniqueWarnings.values());

      setWarnings(filteredWarnings); // Set the list of warnings
      setTotalWarnings(filteredWarnings.length); // Set the total number of warnings

      // Count warnings for each user
      const userWarnings: { [key: string]: number } = {};
      filteredData.forEach((warning: any) => {
        userWarnings[warning.user_id] = (userWarnings[warning.user_id] || 0) + 1;
      });
      setUserWarningsCount(userWarnings);
    } catch (error) {
      setError("Failed to fetch warnings.");
    }
  };

  const handleTemporaryBan = async (userId: string, email: string) => {
    if (userWarningsCount[userId] <= 2) {
      setError("User must have more than 2 warnings for a temporary ban.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Assuming the auth token is stored in localStorage.
      if (!token) {
        setError("Token is missing. Please log in again.");
        return;
      }

      const response = await axios.post(
        "https://furnspace.onrender.com/api/v1/banned/ban/temporary",
        {
          user_id: userId,
          email: email,
          reason: "Violation of terms",
          duration: 7, // Duration in days
          warnings: userWarningsCount[userId],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log(`Temporary ban for user: ${userId}`);
        
        // Add to banned users list
        setBannedUsers([...bannedUsers, userId]);
        
        // Remove user from warnings list
        const updatedWarnings = warnings.filter(warning => warning.user_id !== userId);
        setWarnings(updatedWarnings);
        setTotalWarnings(updatedWarnings.length);
        
        alert("User has been temporarily banned.");
      } else {
        setError("Failed to temporarily ban user.");
      }
    } catch (error) {
      setError("Failed to temporarily ban user.");
    }
  };

  const handlePermanentBan = async (userId: string, email: string) => {
    if (userWarningsCount[userId] <= 3) {
      setError("User must have more than 3 warnings for a permanent ban.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Assuming the auth token is stored in localStorage.
      if (!token) {
        setError("Token is missing. Please log in again.");
        return;
      }

      // First apply permanent ban
      const response = await axios.post(
        "https://furnspace.onrender.com/api/v1/banned/ban/permanent",
        {
          user_id: userId,
          email: email,
          reason: "Violation of terms",
          warnings: userWarningsCount[userId],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log(`Permanent ban for user: ${userId}`);
        
        // Add to banned users list
        setBannedUsers([...bannedUsers, userId]);
        
        // Then delete the user
        try {
          const headersList = {
            "Content-Type": "application/json"
          };
          
          const bodyContent = JSON.stringify({});
          
          const deleteResponse = await fetch(`https://furnspace.onrender.com/api/v1/auth/delete_user/${userId}`, { 
            method: "POST",
            body: bodyContent,
            headers: headersList
          });
          
          const data = await deleteResponse.text();
          console.log(data);
          
          // Remove user from warnings list
          const updatedWarnings = warnings.filter(warning => warning.user_id !== userId);
          setWarnings(updatedWarnings);
          setTotalWarnings(updatedWarnings.length);
          
          alert("User has been permanently banned and deleted from the system.");
        } catch (deleteError) {
          // Even if user deletion fails, still remove from warnings display
          const updatedWarnings = warnings.filter(warning => warning.user_id !== userId);
          setWarnings(updatedWarnings);
          setTotalWarnings(updatedWarnings.length);
          
          console.error("Failed to delete user:", deleteError);
          alert("User has been permanently banned but could not be deleted.");
        }
      } else {
        setError("Failed to permanently ban user.");
      }
    } catch (error) {
      setError("Failed to permanently ban user.");
    }
  };

  useEffect(() => {
    fetchWarnings();
  }, []);

  const refreshWarnings = () => {
    fetchWarnings();
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
        <main className="flex-grow mt-16 p-6 bg-gray-900 text-gray-100">
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-100">Warning Management</h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-400">Total Warnings: {totalWarnings}</p>
              <button 
                onClick={refreshWarnings}
                className="bg-blue-700 text-white px-4 py-2 rounded font-medium hover:bg-blue-800 transition-all duration-300 border border-blue-600"
              >
                Refresh List
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {warnings.length === 0 ? (
              <p className="text-gray-400">No warnings found.</p>
            ) : (
              warnings.map((warning) => (
                <div
                  key={warning.id}
                  className="bg-gray-800 rounded-xl border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">User ID:</span>
                        <span className="text-gray-200">{warning.user_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-gray-200">{warning.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Message:</span>
                        <span className="text-gray-200 text-right max-w-[70%]">{warning.message}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-gray-200">{warning.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Timestamp:</span>
                        <span className="text-gray-200">{warning.created_at}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Warnings:</span>
                        <span className="text-gray-200">{userWarningsCount[warning.user_id]}</span>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => handleTemporaryBan(warning.user_id, warning.email)}
                        className="bg-yellow-700 hover:bg-yellow-800 text-white px-3 py-2 rounded font-medium text-sm transition-colors border border-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                      >
                        Temporary Ban
                      </button>
                      <button
                        onClick={() => handlePermanentBan(warning.user_id, warning.email)}
                        className="bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded font-medium text-sm transition-colors border border-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        Permanent Ban
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
        
        {/* Footer */}
        <div className="mt-auto">
          <AdminFooter />
        </div>
      </div>
    </div>
  );
};

export default ListWarning;