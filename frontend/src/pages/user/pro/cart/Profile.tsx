import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import axios from "axios";
import MainHeader from "../../../../components/user/MainHeader";
import MainFooter from "../../../../components/user/MainFooter";
import useActivityLogger from "../../UserActivity"; // Import the logger
import { motion, AnimatePresence } from "framer-motion"; // Import animation library

interface User {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  phone2?: string;
  address: string;
  pin_code: string;
  state: string;
  city: string;
  country: string;
  profile_picture?: string;
}

// Add this function for email validation
const isValidEmail = (email: string): boolean => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [profilePicUrl, setProfilePicUrl] = useState<string | undefined>(undefined);
  const [previewPicUrl, setPreviewPicUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logUserActivity = useActivityLogger(); // Initialize the logger
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [emailError, setEmailError] = useState<string>("");

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("token");
      if (!userId) {
        setError("User ID is not found in local storage.");
        return;
      }

      const response = await axios.get(
        `https://furnspace.onrender.com/api/v1/auth/user/fetch/${userId}`
      );

      if (response.data && response.data.data) {
        setUser(response.data.data);
        setFormData(response.data.data);
        setProfilePicUrl(response.data.data.profile_picture);
      } else {
        setError("No user data returned from server.");
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        setError(error.response.data.detail || "Failed to fetch user details.");
      } else {
        setError("An error occurred while fetching user details.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (!formData) {
      return;
    }
    
    // Clear email error when user types
    if (name === 'email') {
      setEmailError("");
    }
    
    setFormData(prevState => prevState ? ({ ...prevState, [name]: value }) : null);
  };

  async function handleSave() {
    if (!formData) {
      setError("Form data is missing.");
      return;
    }

    // Validate email before saving
    if (formData.email && !isValidEmail(formData.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsSaving(true);
    const user_id = localStorage.getItem('token');
    if (!user_id) {
      setError("User ID is not found in local storage.");
      return;
    }

    const url = `http://127.0.0.1:10007/api/v1/auth/user/${user_id}/update`;

    const formDataToSend = new FormData();
    formDataToSend.append("document", JSON.stringify(formData));
    
    if (file) {
      formDataToSend.append("file", file, file.name);
    }

    try {
      const response = await axios.put(url, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      fetchUserDetails(); // Fetch the updated user data
      setUser(response.data.data); // Update the user data
      setProfilePicUrl(response.data.data.profile_picture);
      setIsEditing(false);
      
      // Success notification with animation
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out';
      notification.innerHTML = 'Profile updated successfully!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 3000);
      
      logUserActivity('Updated profile details'); // Log activity
    } catch (error: any) {
      console.error('There was an error updating the user data!', error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(error.response.data.detail || "Failed to save user details.");
      } else {
        setError("An error occurred while saving user details.");
      }
      alert('Failed to save user details.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPicUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleProfilePicClick() {
    fileInputRef.current?.click();
  }

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="flex items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-300 mr-6"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-32"></div>
          <div className="h-3 bg-gray-300 rounded w-48"></div>
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-20 bg-gray-300 rounded w-full"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="grid grid-cols-2 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i}>
                <div className="h-3 bg-gray-300 rounded w-16 mb-1"></div>
                <div className="h-8 bg-gray-300 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen py-16 bg-gradient-to-b from-blue-50 to-white">
      <MainHeader logoText="Furniture Store" onSearch={() => {}} />

      <main className="flex-1 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-lg"
        >
          <h1 className="text-3xl font-bold mb-8 text-blue-800 border-b pb-4">My Profile</h1>
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <SkeletonLoader />
          ) : user ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row gap-8"
            >
              {/* Left column - Profile Image and Quick Info */}
              <div className="w-full md:w-1/3">
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative mb-4"
                  >
                    <img
                      src={previewPicUrl || profilePicUrl || "https://via.placeholder.com/150"}
                      alt="Profile"
                      className="w-36 h-36 rounded-full object-cover border-4 border-blue-200 shadow-md cursor-pointer transition-all duration-300"
                      onClick={handleProfilePicClick}
                    />
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={handleProfilePicClick}>
                      <span className="text-white text-sm font-medium">Change Photo</span>
                    </div>
                  </motion.div>
                  <input
                    type="file"
                    name="profile_picture"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <h2 className="text-2xl font-semibold text-gray-800 text-center">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-gray-600 mb-4 text-center">{user.email}</p>
                  
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 mt-4"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
              
              {/* Right column - Form Fields */}
              <div className="w-full md:w-2/3 space-y-6">
                {isEditing ? (
                  <>
                    {/* Personal Information Section */}
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="bg-gray-50 p-6 rounded-lg"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-blue-700 border-b border-blue-100 pb-2">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">FIRST NAME</label>
                          <input
                            type="text"
                            name="first_name"
                            value={formData?.first_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">LAST NAME</label>
                          <input
                            type="text"
                            name="last_name"
                            value={formData?.last_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">EMAIL</label>
                          <input
                            type="email"
                            name="email"
                            value={formData?.email || ''}
                            onChange={handleInputChange}
                            className={`w-full p-3 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none`}
                          />
                          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                        </div>
                      </div>
                    </motion.div>

                    {/* Contact Information Section */}
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="bg-gray-50 p-6 rounded-lg"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-blue-700 border-b border-blue-100 pb-2">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">PRIMARY PHONE</label>
                          <input
                            type="text"
                            name="phone"
                            value={formData?.phone || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">SECONDARY PHONE (OPTIONAL)</label>
                          <input
                            type="text"
                            name="phone2"
                            value={formData?.phone2 || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Address Section */}
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="bg-gray-50 p-6 rounded-lg"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-blue-700 border-b border-blue-100 pb-2">Address Information</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">STREET ADDRESS</label>
                          <textarea
                            name="address"
                            value={formData?.address || ""}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">CITY</label>
                            <input
                              type="text"
                              name="city"
                              value={formData?.city || ''}
                              onChange={handleInputChange}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">STATE</label>
                            <input
                              type="text"
                              name="state"
                              value={formData?.state || ''}
                              onChange={handleInputChange}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">PIN CODE</label>
                            <input
                              type="text"
                              name="pin_code"
                              value={formData?.pin_code || ''}
                              onChange={handleInputChange}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">COUNTRY</label>
                            <input
                              type="text"
                              name="country"
                              value={formData?.country || ''}
                              onChange={handleInputChange}
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex justify-end space-x-4 mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 bg-gray-400 text-white rounded-md hover:bg-gray-500 active:bg-gray-600 transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 flex items-center"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* View mode sections */}
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="bg-gray-50 p-6 rounded-lg"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-blue-700 border-b border-blue-100 pb-2">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">FIRST NAME</label>
                          <p className="text-gray-600 p-2 bg-white rounded border border-transparent group-hover:border-gray-200 transition-all">
                            {user.first_name || '-'}
                          </p>
                        </div>
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">LAST NAME</label>
                          <p className="text-gray-600 p-2 bg-white rounded border border-transparent group-hover:border-gray-200 transition-all">
                            {user.last_name || '-'}
                          </p>
                        </div>
                        <div className="md:col-span-2 group">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">EMAIL</label>
                          <p className="text-gray-600 p-2 bg-white rounded border border-transparent group-hover:border-gray-200 transition-all">
                            {user.email || '-'}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="bg-gray-50 p-6 rounded-lg"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-blue-700 border-b border-blue-100 pb-2">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">PRIMARY PHONE</label>
                          <p className="text-gray-600 p-2 bg-white rounded border border-transparent group-hover:border-gray-200 transition-all">
                            {user.phone || '-'}
                          </p>
                        </div>
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">SECONDARY PHONE</label>
                          <p className="text-gray-600 p-2 bg-white rounded border border-transparent group-hover:border-gray-200 transition-all">
                            {user.phone2 || '-'}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="bg-gray-50 p-6 rounded-lg"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-blue-700 border-b border-blue-100 pb-2">Address Information</h3>
                      <div className="mb-4 group">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">STREET ADDRESS</label>
                        <p className="text-gray-600 p-2 bg-white rounded border border-transparent group-hover:border-gray-200 transition-all">
                          {user.address || '-'}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">CITY</label>
                          <p className="text-gray-600 p-2 bg-white rounded border border-transparent group-hover:border-gray-200 transition-all">
                            {user.city || '-'}
                          </p>
                        </div>
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">STATE</label>
                          <p className="text-gray-600 p-2 bg-white rounded border border-transparent group-hover:border-gray-200 transition-all">
                            {user.state || '-'}
                          </p>
                        </div>
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">PIN CODE</label>
                          <p className="text-gray-600 p-2 bg-white rounded border border-transparent group-hover:border-gray-200 transition-all">
                            {user.pin_code || '-'}
                          </p>
                        </div>
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">COUNTRY</label>
                          <p className="text-gray-600 p-2 bg-white rounded border border-transparent group-hover:border-gray-200 transition-all">
                            {user.country || '-'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 border-t-blue-500 animate-spin"></div>
            </div>
          )}
        </motion.div>
      </main>

      <MainFooter />
    </div>
  );
};

export default Profile;