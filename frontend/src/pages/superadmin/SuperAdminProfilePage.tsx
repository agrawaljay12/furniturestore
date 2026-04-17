import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuperAdminHeader from "../../components/SuperAdminHeader ";
import AdminFooter from "../../components/admin/AdminFooter";
import { useSuperAdmin } from "./SuperAdminContext";
import { motion, AnimatePresence } from "framer-motion";
import SuperSidebar from "../../components/SuperSidebar";

interface SuperAdmin {
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

function SuperAdminProfilePage(): React.ReactElement {
  const { admin, setAdmin } = useSuperAdmin();
  const [file, setFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<SuperAdmin | null>(null);
  const [error, setError] = useState<string>("");  
  const [profilePicUrl, setProfilePicUrl] = useState<string | undefined>(undefined);
  const [previewPicUrl, setPreviewPicUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAdminDetails = async () => {
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
        setAdmin(response.data.data);
        setFormData(response.data.data);
        setProfilePicUrl(response.data.data.profile_picture);
      } else {
        setError("No admin data returned from server.");
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        setError(error.response.data.detail || "Failed to fetch admin details.");
      } else {
        setError("An error occurred while fetching admin details.");
      }
    }
  };

  useEffect(() => {
    fetchAdminDetails();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (!formData) {
      return;
    }
    setFormData(prevState => prevState ? ({ ...prevState, [name]: value }) : null);
  };

  async function handleSave() {
    if (!formData) {
      setError("Form data is missing.");
      return;
    }

    const user_id = localStorage.getItem('token');
    if (!user_id) {
      setError("User ID is not found in local storage.");
      return;
    }

    const url = `https://furnspace.onrender.com/api/v1/auth/user/${user_id}/update`;

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
      fetchAdminDetails(); // Fetch the updated admin data
      setAdmin(response.data.data); // Update the admin data
      setProfilePicUrl(response.data.data.profile_picture);
      setIsEditing(false);
      alert('Admin details saved successfully!');
    } catch (error: any) {
      console.error('There was an error updating the admin data!', error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(error.response.data.detail || "Failed to save admin details.");
      } else {
        setError("An error occurred while saving admin details.");
      }
      alert('Failed to save admin details.');
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

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewPicUrl(undefined);
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
            className="max-w-4xl mx-auto"
          >
            <motion.div 
              className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white p-6 rounded-t-lg shadow-lg"
              whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <h2 className="text-3xl font-bold text-center">Super Admin Profile</h2>
              <p className="text-center text-teal-100 mt-2">Manage your personal information</p>
            </motion.div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-100 border-red-500 text-red-700 border-l-4 p-4 mb-4"
              >
                <p>{error}</p>
              </motion.div>
            )}

            {!admin && (
              <div className="bg-gray-800 border-gray-700 p-10 rounded-b-lg shadow-lg border flex justify-center items-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="rounded-full bg-gray-700 h-32 w-32 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <p className="mt-4 text-gray-400">Loading admin details...</p>
                </div>
              </div>
            )}

            <AnimatePresence>
              {admin && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gray-800 border-gray-700 p-8 rounded-b-lg shadow-lg border"
                >
                  {!isEditing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col md:flex-row gap-8"
                    >
                      <div className="md:w-1/3 flex flex-col items-center">
                        {profilePicUrl ? (
                          <motion.div 
                            className="relative group"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <img
                              src={profilePicUrl}
                              alt="Profile"
                              className="w-48 h-48 object-cover rounded-full border-4 border-gray-700 shadow-lg cursor-pointer transition transform hover:scale-105"
                              onClick={handleProfilePicClick}
                            />
                            <motion.div 
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              className="absolute bottom-2 right-2 bg-teal-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </motion.div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="w-48 h-48 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 cursor-pointer" 
                            onClick={handleProfilePicClick}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </motion.div>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(true)}
                          className="mt-6 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1 flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit Profile
                        </motion.button>
                      </div>
                      
                      <div className="md:w-2/3 space-y-6">
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="border-b border-gray-700 pb-4"
                        >
                          <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Personal Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">Full Name</p>
                              <p className="text-lg text-gray-200">{admin.first_name} {admin.last_name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Email Address</p>
                              <p className="text-lg text-gray-200">{admin.email}</p>
                            </div>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="border-b border-gray-700 pb-4"
                        >
                          <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            Contact Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">Primary Phone</p>
                              <p className="text-lg text-gray-200">{admin.phone}</p>
                            </div>
                            {admin.phone2 && (
                              <div>
                                <p className="text-sm text-gray-400">Secondary Phone</p>
                                <p className="text-lg text-gray-200">{admin.phone2}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Address Information
                          </h3>
                          <motion.div 
                            whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)" }}
                            className="bg-gray-700 p-4 rounded-lg"
                          >
                            <p className="text-lg mb-2 text-gray-200">{admin.address}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-400">City</p>
                                <p className="text-gray-300">{admin.city}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">State</p>
                                <p className="text-gray-300">{admin.state}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Country</p>
                                <p className="text-gray-300">{admin.country}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Pin Code</p>
                                <p className="text-gray-300">{admin.pin_code}</p>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {isEditing && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        <motion.div 
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="flex flex-col items-center mb-6"
                        >
                          <div className="relative group">
                            {(previewPicUrl || profilePicUrl) ? (
                              <motion.div className="relative">
                                <motion.img
                                  whileHover={{ scale: 1.05 }}
                                  src={previewPicUrl || profilePicUrl}
                                  alt="Profile"
                                  className="w-40 h-40 object-cover rounded-full border-4 border-gray-700 shadow-lg"
                                />
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  whileHover={{ opacity: 1 }}
                                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </motion.div>
                              </motion.div>
                            ) : (
                              <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="w-40 h-40 rounded-full bg-gray-700 flex items-center justify-center text-gray-300" 
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </motion.div>
                            )}
                          </div>
                          
                          <div className="mt-4 flex flex-col sm:flex-row gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleProfilePicClick}
                              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow flex items-center justify-center gap-2 transition-all duration-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                              </svg>
                              Change Profile Picture
                            </motion.button>
                            
                            {file && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRemoveImage}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow flex items-center justify-center gap-2 transition-all duration-300"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Remove
                              </motion.button>
                            )}
                          </div>
                          
                          {file && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-2 text-sm text-green-600"
                            >
                              New image selected: {file.name}
                            </motion.p>
                          )}
                          
                          <input
                            type="file"
                            name="profile_picture"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </motion.div>

                        <motion.div 
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-200 border-gray-700 border-b pb-2">Personal Details</h3>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                              <input
                                type="text"
                                name="first_name"
                                value={formData ? formData.first_name : ''}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400"
                                placeholder="First Name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                              <input
                                type="text"
                                name="last_name"
                                value={formData ? formData.last_name : ''}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400"
                                placeholder="Last Name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                              <input
                                type="email"
                                name="email"
                                value={formData ? formData.email : ''}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400"
                                placeholder="Email Address"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-200 border-gray-700 border-b pb-2">Contact Information</h3>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Primary Phone</label>
                              <input
                                type="text"
                                name="phone"
                                value={formData ? formData.phone : ''}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400"
                                placeholder="Primary Phone"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Secondary Phone (Optional)</label>
                              <input
                                type="text"
                                name="phone2"
                                value={formData ? formData.phone2 || '' : ''}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400"
                                placeholder="Secondary Phone"
                              />
                            </div>
                          </div>
                        </motion.div>

                        <motion.div 
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="space-y-4 mt-6"
                        >
                          <h3 className="text-lg font-semibold text-gray-200 border-gray-700 border-b pb-2">Address Details</h3>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Full Address</label>
                            <input
                              type="text"
                              name="address"
                              value={formData ? formData.address : ''}
                              onChange={handleInputChange}
                              className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400"
                              placeholder="Full Address"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                              <input
                                type="text"
                                name="city"
                                value={formData ? formData.city : ''}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400"
                                placeholder="City"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                              <input
                                type="text"
                                name="state"
                                value={formData ? formData.state : ''}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400"
                                placeholder="State"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Pin Code</label>
                              <input
                                type="text"
                                name="pin_code"
                                value={formData ? formData.pin_code : ''}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400"
                                placeholder="Pin Code"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                              <input
                                type="text"
                                name="country"
                                value={formData ? formData.country : ''}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400"
                                placeholder="Country"
                              />
                            </div>
                          </div>
                        </motion.div>

                        <motion.div 
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="flex justify-end space-x-4 mt-8"
                        >
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-3 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-600 focus:outline-none transition transform hover:-translate-y-1 flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-lg shadow hover:shadow-lg focus:outline-none transition transform hover:-translate-y-1 flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Save Changes
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>

        <AdminFooter />
      </div>

      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={true} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="light"
      />
    </div>
  );
}

export default SuperAdminProfilePage;