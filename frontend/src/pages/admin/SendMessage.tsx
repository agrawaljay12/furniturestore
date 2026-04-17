import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";

const Message = () => {
  const [admins, setAdmins] = useState<{ id: string; email: string }[]>([]);
  const [adminId, setAdminId] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

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
        const adminsData = data.data.filter((user: any) => user.type === "moderator");
        setAdmins(adminsData);
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
      sender_role: type,
    };

    setLoading(true); // Show loader

    try {
      const response = await fetch("https://furnspace.onrender.com/api/v1/message/send_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Message Sent Successfully");
        alert(`Message Sent Successfully: ${message}`);
        // setTimeout(() => window.location.reload(), 100);
      } else {
        toast.error(result.message || "Failed to send message");
      }
    } catch (error) {
      toast.error("Error connecting to the server");
    } finally {
      setLoading(false); // Hide loader
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="fixed top-0 left-0 h-full">
        <Sidebar />
      </div>

      <div className="flex-1 ml-72 flex flex-col">
        <AdminHeader />

        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-slate-800 dark:to-slate-800">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Message
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Communicate with moderators through the internal messaging system</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Admin ID Dropdown with Better Styling */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recipient Admin
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <select
                      className="pl-10 w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white appearance-none bg-none"
                      value={adminId}
                      onChange={handleAdminChange}
                      required
                    >
                      <option value="">Select Admin</option>
                      {admins.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          Admin ID: {admin.id}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Auto-filled Email Field with Better Styling */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      className="pl-10 w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400"
                      value={email}
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email is automatically filled based on selected admin</p>
                </div>

                {/* Message Input with Better Styling */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <textarea
                      className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={6}
                      placeholder="Type your message here..."
                    />
                  </div>
                </div>

                {/* Submit Button with Loading State */}
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <span>Send Message</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Message;