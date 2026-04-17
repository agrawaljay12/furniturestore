import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SuperSidebar from "../../components/SuperSidebar";
import SuperAdminHeader from "../../components/SuperAdminHeader ";
import AdminFooter from "../../components/admin/AdminFooter";
import { useLocation, useNavigate } from "react-router-dom";

const AddWarning = () => {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  
  // Get URL search parameters
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const userIdFromUrl = queryParams.get("userId");

  useEffect(() => {
    if (!userIdFromUrl) {
      toast.error("User ID is required. Please select a user first.");
      // Redirect back or to a user list page after a short delay
      setTimeout(() => {
        navigate("/superadmin/users"); // Change this to your user list page
      }, 2000);
      return;
    }

    setUserId(userIdFromUrl);
    fetchUserEmail(userIdFromUrl);
  }, [userIdFromUrl, navigate]);

  const fetchUserEmail = async (uid: string) => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:10007/api/v1/auth/get_users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data && data.data && Array.isArray(data.data)) {
        const selectedUser = data.data.find((user: {id: string, email: string}) => user.id === uid);
        if (selectedUser) {
          setEmail(selectedUser.email);
        } else {
          toast.error("User not found with the provided ID");
          navigate("/superadmin/users"); // Redirect if user not found
        }
      } else {
        console.error("Unexpected API response format:", data);
        toast.error("Invalid API response format");
      }
    } catch (error) {
      console.error("Error fetching user email:", error);
      toast.error("Error fetching user email");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId || !email || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    const requestBody = {
      user_id: userId,
      email: email,
      message: message,
      status: status,
    };

    try {
      const response = await fetch("http://localhost:10007/api/v1/warning/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Warning Sent Successfully");
        alert("Warning Sent Successfully");
        setTimeout(() => window.location.reload(), 500);
        navigate('/superadmin/list-warning');
      } else {
        toast.error(result.message || "Failed to add warning");
      }
    } catch (error) {
      toast.error("Error connecting to the server");
    }
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
        <main className="mt-16 p-6 bg-gray-900 text-gray-100">
          <div className="max-w-md mx-auto mt-10 bg-gray-800 rounded-xl border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-100 mb-6">Add Warning</h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-1">User ID</label>
                    <input
                      type="text"
                      className="w-full p-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={userId}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full p-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={email}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Message</label>
                    <input
                      type="text"
                      className="w-full p-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Status</label>
                    <select
                      className="w-full p-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none mt-6"
                  >
                    Submit Warning
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AddWarning;
