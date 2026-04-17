import React, { useState } from "react";
import SuperAdminHeader from "../../components/SuperAdminHeader ";
import SuperSidebar from "../../components/SuperSidebar";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import AdminFooter from "../../components/admin/AdminFooter";
import { motion } from "framer-motion";

const Password: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    try {
      const userid = localStorage.getItem("token");
      let headersList = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userid}`,
      };

      let bodyContent = JSON.stringify({
        old_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      let response = await fetch(
        `https://furnspace.onrender.com/api/v1/auth/change_password/${userid}`,
        {
          method: "POST",
          body: bodyContent,
          headers: headersList,
        }
      );

      let data = await response.json();
      alert(data.data.message);

      // Clear form after submitting
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage("Error changing password. Please try again.");
      console.error("Error changing password:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Sidebar - properly integrated */}
      <SuperSidebar />

      {/* Main content area - adjusted to match sidebar width (w-72) */}
      <div className="flex-1 flex flex-col w-full ml-0 lg:ml-72">
        {/* Header */}
        <SuperAdminHeader />
        
        {/* Content */}
        <main className="flex-1 p-6 pt-16 bg-gray-900 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-md">
              <motion.div
                className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white p-6 rounded-t-lg shadow-lg"
                whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              >
                <div className="flex items-center justify-center gap-3">
                  <FiLock className="text-2xl" />
                  <h2 className="text-2xl font-bold text-center">Change Password</h2>
                </div>
                <p className="text-center text-teal-100 mt-2">Update your account security</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800 border-gray-700 p-8 rounded-b-lg shadow-lg border"
              >
                <form onSubmit={handleChangePassword} className="space-y-6">
                  {/* Current Password */}
                  <div className="relative">
                    <label className="block text-gray-300 mb-2 font-medium">
                      Current Password
                    </label>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400"
                      required
                    />
                    <div
                      className="absolute right-3 flex items-center cursor-pointer top-10"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <FiEyeOff className="text-gray-400 text-lg hover:text-teal-400 transition-colors" />
                      ) : (
                        <FiEye className="text-gray-400 text-lg hover:text-teal-400 transition-colors" />
                      )}
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="relative">
                    <label className="block text-gray-300 mb-2 font-medium">New Password</label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400"
                      required
                    />
                    <div
                      className="absolute right-3 flex items-center cursor-pointer top-10"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <FiEyeOff className="text-gray-400 text-lg hover:text-teal-400 transition-colors" />
                      ) : (
                        <FiEye className="text-gray-400 text-lg hover:text-teal-400 transition-colors" />
                      )}
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="relative">
                    <label className="block text-gray-300 mb-2 font-medium">
                      Confirm New Password
                    </label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400"
                      required
                    />
                    <div
                      className="absolute right-3 flex items-center cursor-pointer top-10"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="text-gray-400 text-lg hover:text-teal-400 transition-colors" />
                      ) : (
                        <FiEye className="text-gray-400 text-lg hover:text-teal-400 transition-colors" />
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {message && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20"
                    >
                      {message}
                    </motion.p>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 text-white py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 font-bold flex items-center justify-center"
                  >
                    <FiLock className="mr-2" />
                    Update Password
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </motion.div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default Password;