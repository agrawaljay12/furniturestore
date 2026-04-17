import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SuperSidebar from "../../components/SuperSidebar";
import SuperAdminHeader from "../../components/SuperAdminHeader ";
import AdminFooter from "../../components/admin/AdminFooter";
import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";

const SendMessage = () => {
  const [admins, setAdmins] = useState<{ id: string; email: string; first_name: string; last_name: string }[]>([]);
  const [adminId, setAdminId] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch admin IDs and emails
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch("https://furnspace.onrender.com/api/v1/auth/get_users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      console.log("Full API Response:", data); // Debugging

      if (data && data.data && Array.isArray(data.data)) {
        // Filter only admins
        const adminsData = data.data.filter((user: any) => user.type === "admin");
        
        // For each admin, fetch additional details
        const adminsWithDetails = await Promise.all(
          adminsData.map(async (admin: any) => {
            try {
              const detailsResponse = await fetch(`https://furnspace.onrender.com/api/v1/auth/user/fetch/${admin.id}`, {
                method: "GET",
                headers: { "Accept": "*/*" }
              });
              
              const userDetails = await detailsResponse.json();
              
              return {
                id: admin.id,
                email: admin.email,
                first_name: userDetails.data.first_name || '',
                last_name: userDetails.data.last_name || ''
              };
            } catch (error) {
              console.error(`Error fetching details for admin ${admin.id}:`, error);
              return {
                id: admin.id,
                email: admin.email,
                first_name: 'Admin',
                last_name: admin.id.substring(0, 6) // Use part of ID as fallback
              };
            }
          })
        );
        
        setAdmins(adminsWithDetails);
      } else {
        console.error("Unexpected API response format:", data);
        toast.error("Invalid API response format");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Error fetching admins");
    }
  };

  // Handle admin selection from dropdown
  const handleAdminChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setAdminId(selectedId);

    // Find selected admin's email
    const selectedAdmin = admins.find((admin) => admin.id === selectedId);
    setEmail(selectedAdmin ? selectedAdmin.email : "");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!adminId || !email || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    const moderatorId = localStorage.getItem("token");
    const type = localStorage.getItem("user_role");

    if (!moderatorId) {
      toast.error("Moderator ID not found in local storage");
      return;
    }

    const requestBody = {
      moderator_id: moderatorId,
      admin_id: adminId,
      email: email,
      message: message,
      sender_role: type
    };

    setIsLoading(true);

    try {
      const response = await fetch("https://furnspace.onrender.com/api/v1/message/send_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        // Clear form fields immediately
        setAdminId("");
        setEmail("");
        setMessage("");

        // Show alert box with a slight delay
        setTimeout(() => {
          alert(`Message Sent Successfully: ${message}`);
        }, 100);
      } else {
        toast.error(result.message || "Failed to send message");
      }
    } catch (error) {
      toast.error("Error connecting to the server");
    } finally {
      setIsLoading(false);
    }
  };

  // Spinner component for loading state
  const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <SuperSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col w-full ml-0 lg:ml-72">
        {/* Header */}
        <SuperAdminHeader />
        
        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-100">Admin Communication</h1>
              <FaPaperPlane className="ml-3 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Send messages to administrators
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md mx-auto p-6 bg-gray-800 shadow-lg rounded-xl border border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-200 flex items-center">
              <FaPaperPlane className="mr-2 text-blue-400" />
              Send Message
            </h2>
            <form onSubmit={handleSubmit}>

              {/* Admin Selection Dropdown */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Select Admin</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  value={adminId}
                  onChange={handleAdminChange}
                  required
                >
                  <option value="">Select Admin</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.first_name} {admin.last_name} ({admin.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-filled Email Field */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-2 rounded bg-gray-700 text-gray-300 border border-gray-600"
                  value={email}
                  readOnly
                />
              </div>

              {/* Message Input */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Message</label>
                <textarea
                  className="w-full p-2 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Submit Button with Loading State */}
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-blue-700 font-medium text-blue-100 p-2 rounded w-full transition-colors duration-300 flex items-center justify-center ${
                  isLoading ? "bg-blue-900 cursor-not-allowed" : "hover:bg-blue-800 border border-blue-600"
                }`}
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    <span>Sending...</span>
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </motion.div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default SendMessage;