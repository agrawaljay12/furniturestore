import React, { useState } from "react";
import MainHeader from "../../../../components/user/MainHeader"; // Import MainHeader
import MainFooter from "../../../../components/user/MainFooter"; // Import MainFooter
import useActivityLogger from '../../UserActivity';
import { FiKey, FiEye, FiEyeOff, FiLock, FiUnlock } from 'react-icons/fi'; // Import additional icons

const UserChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const logUserActivity = useActivityLogger();
  
  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation function - same as in Login.tsx
  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    // Validate new password
    if (!validatePassword(newPassword)) {
      setErrors({ 
        newPassword: 'Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
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
      alert(data.data.message);	
      // setMessage(data.data.message);
      logUserActivity("Changed password"); // Log activity
      // Clear form after submitting
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error) {
      setMessage("Error changing password. Please try again.");
      console.error("Error changing password:", error);
    }
  };

  // Toggle password visibility functions
  const toggleCurrentPasswordVisibility = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <MainHeader logoText="Furniture Store" onSearch={() => {}} />

      <main className="flex-1 overflow-y-auto p-6 bg-gray-100 mt-24">
        <div className="flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6">Change Password</h2>
            
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FiLock className="h-5 w-5" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Current Password"
                    required
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-teal-500 focus:outline-none"
                    onClick={toggleCurrentPasswordVisibility}
                  >
                    {showCurrentPassword ? 
                      <FiEyeOff className="h-5 w-5" /> : 
                      <FiEye className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FiUnlock className="h-5 w-5" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="New Password"
                    required
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-teal-500 focus:outline-none"
                    onClick={toggleNewPasswordVisibility}
                  >
                    {showNewPassword ? 
                      <FiEyeOff className="h-5 w-5" /> : 
                      <FiEye className="h-5 w-5" />
                    }
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                )}
              </div>
              
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FiKey className="h-5 w-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Confirm New Password"
                    required
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-teal-500 focus:outline-none"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? 
                      <FiEyeOff className="h-5 w-5" /> : 
                      <FiEye className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>
              
              {message && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>{message}</span>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center"
              >
                <FiKey className="mr-2" />
                Change Password
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <MainFooter />
    </div>
  );
};

export default UserChangePassword;