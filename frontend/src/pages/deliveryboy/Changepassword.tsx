import React, { useState } from "react";
import DeliveryHeader from "../../components/admin/DeliveryHeader";
import DeliverySidebar from "../../components/admin/DeliverySidebar";
import { motion } from 'framer-motion';
import { FaLock } from 'react-icons/fa';

const DeliveryBoyPassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      setMessageType("error");
      return;
    }
    
    try {
      const userid = localStorage.getItem("token");
      let headersList = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userid}`
      };

      let bodyContent = JSON.stringify({
        "old_password": currentPassword,
        "new_password": newPassword,
        "confirm_password": confirmPassword
      });

      let response = await fetch(`https://furnspace.onrender.com/api/v1/auth/change_password/${userid}`, { 
        method: "POST",
        body: bodyContent,
        headers: headersList
      });

      let data = await response.json();
      setMessage(data.data.message);
      setMessageType("success");

      // Clear form after submitting
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error) {
      setMessage("Error changing password. Please try again.");
      setMessageType("error");
      console.error("Error changing password:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar - properly integrated */}
      <div className="fixed top-0 left-0 h-full">
        <DeliverySidebar />
      </div>

      {/* Main content area - adjusted to match sidebar width */}
      <div className="flex-1 ml-72 flex flex-col">
        {/* Header */}
        <DeliveryHeader />
        
        {/* Content */}
        <main className="flex-1 p-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Account Security <span className="text-teal-600 dark:text-teal-500">Settings</span> 🔒
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Update your password to keep your account secure
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg mr-3">
                    <FaLock className="text-teal-600 dark:text-teal-400" />
                  </div>
                  Change Password
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 ml-11">
                  Update your password to keep your account secure
                </p>
              </div>
              
              <form onSubmit={handleChangePassword} className="p-6 space-y-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Current Password
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-700/50 dark:text-white"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-700/50 dark:text-white"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-700/50 dark:text-white"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${
                      messageType === "error" 
                        ? "bg-rose-100 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300" 
                        : "bg-emerald-100 dark:bg-emerald-900/20 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                    } p-4 rounded-md`}
                  >
                    <p className="font-medium">{message}</p>
                  </motion.div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-300"
                >
                  Update Password
                </motion.button>
              </form>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mt-8"
            >
              <div className="flex items-center mb-6">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg mr-3">
                  <FaLock className="text-amber-600 dark:text-amber-400 text-xl" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Password Security Tips</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <h3 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Use Strong Passwords
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Include uppercase letters, numbers, and special characters for stronger security.
                  </p>
                </div>
                
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <h3 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Regular Updates
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Change your password regularly to maintain account security.
                  </p>
                </div>
                
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <h3 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Don't Reuse Passwords
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Avoid using the same password for multiple accounts to enhance security.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DeliveryBoyPassword;