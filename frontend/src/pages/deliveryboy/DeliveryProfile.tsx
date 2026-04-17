import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeliveryHeader from "../../components/admin/DeliveryHeader";
// import AdminFooter from "../../components/admin/AdminFooter";
import Sidebar from "../../components/admin/DeliverySidebar";
import { useDeliveryBoy } from "./DeliveryContexr";
import { motion } from "framer-motion";

interface DeliveryBoy {
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

function DeliveryProfilePage(): React.ReactElement {
  const { deliveryBoy, setDeliveryBoy } = useDeliveryBoy();
  const [file, setFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<DeliveryBoy | null>(null);
  const [error, setError] = useState<string>("");  
  const [profilePicUrl, setProfilePicUrl] = useState<string | undefined>(undefined);
  const [previewPicUrl, setPreviewPicUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchDeliveryBoyDetails = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("token");
      if (!userId) {
        setError("User ID is not found in local storage.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:10007/api/v1/auth/user/fetch/${userId}`
      );

      if (response.data && response.data.data) {
        setDeliveryBoy(response.data.data);
        setFormData(response.data.data);
        setProfilePicUrl(response.data.data.profile_picture);
      } else {
        setError("No delivery boy data returned from server.");
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        setError(error.response.data.detail || "Failed to fetch delivery boy details.");
      } else {
        setError("An error occurred while fetching delivery boy details.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
   fetchDeliveryBoyDetails();
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
      toast.error("Form data is missing.");
      return;
    }

    const user_id = localStorage.getItem('token');
    if (!user_id) {
      setError("User ID is not found in local storage.");
      toast.error("User ID is not found in local storage.");
      return;
    }

    setSaving(true);
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
      fetchDeliveryBoyDetails();
      setDeliveryBoy(response.data.data);
      setProfilePicUrl(response.data.data.profile_picture);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('There was an error updating the delivery boy data!', error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(error.response.data.detail || "Failed to save delivery boy details.");
        toast.error(error.response.data.detail || "Failed to save delivery boy details.");
      } else {
        setError("An error occurred while saving delivery boy details.");
        toast.error("An error occurred while saving delivery boy details.");
      }
    } finally {
      setSaving(false);
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

  // Skeleton loading component
  const ProfileSkeleton = () => (
    <div className="p-6 animate-pulse">
      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-slate-700"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((item) => (
          <div key={item} className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
            <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded mb-6 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((line) => (
                <div key={line} className="flex justify-between">
                  <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <div className="fixed top-0 left-0 h-full">
        <Sidebar />
      </div>

      <div className="flex-1 ml-72 flex flex-col">
        <DeliveryHeader />
        
        <main className="flex-1 p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-slate-700">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Delivery Profile
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-10">Manage your personal information and delivery details</p>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p>{error}</p>
                </motion.div>
              )}

              {loading ? (
                <ProfileSkeleton />
              ) : deliveryBoy ? (
                <div className="p-6">
                  {isEditing ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-center">
                        <div className="relative">
                          {previewPicUrl ? (
                            <div className="relative group cursor-pointer">
                              <motion.img
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                                src={previewPicUrl}
                                alt="Preview"
                                className="w-36 h-36 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900/30 shadow-md"
                                onClick={handleProfilePicClick}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={handleProfilePicClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                            </div>
                          ) : profilePicUrl ? (
                            <div className="relative group cursor-pointer">
                              <img
                                src={profilePicUrl}
                                alt="Profile"
                                className="w-36 h-36 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900/30 shadow-md"
                                onClick={handleProfilePicClick}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={handleProfilePicClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="w-36 h-36 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-700 border-4 border-indigo-100 dark:border-indigo-900/30 cursor-pointer group"
                              onClick={handleProfilePicClick}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <div className="absolute bg-indigo-500 rounded-full p-2 bottom-0 right-0 shadow-lg border-2 border-white dark:border-slate-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">Click to change profile picture</p>
                        </div>
                      </div>
                      
                      <input
                        type="file"
                        name="profile_picture"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="space-y-1"
                        >
                          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData?.first_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                            placeholder="First Name"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="space-y-1"
                        >
                          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData?.last_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                            placeholder="Last Name"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="space-y-1"
                        >
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData?.email || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                            placeholder="Email"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="space-y-1"
                        >
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone
                          </label>
                          <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData?.phone || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                            placeholder="Phone"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                          className="space-y-1"
                        >
                          <label htmlFor="phone2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Alternate Phone (Optional)
                          </label>
                          <input
                            type="text"
                            id="phone2"
                            name="phone2"
                            value={formData?.phone2 || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                            placeholder="Alternate Phone"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                          className="space-y-1 md:col-span-2"
                        >
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Address
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData?.address || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                            placeholder="Address"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                          className="space-y-1"
                        >
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            City
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData?.city || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                            placeholder="City"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                          className="space-y-1"
                        >
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            State
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData?.state || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                            placeholder="State"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 }}
                          className="space-y-1"
                        >
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={formData?.country || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                            placeholder="Country"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 }}
                          className="space-y-1"
                        >
                          <label htmlFor="pin_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pin Code
                          </label>
                          <input
                            type="text"
                            id="pin_code"
                            name="pin_code"
                            value={formData?.pin_code || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                            placeholder="Pin Code"
                          />
                        </motion.div>
                      </div>
                      
                      <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-100 dark:border-slate-700">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-5 py-2.5 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors border border-gray-300 dark:border-slate-600 shadow-sm font-medium"
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] flex items-center space-x-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div>
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-center mb-8"
                      >
                        {profilePicUrl ? (
                          <div className="relative">
                            <img
                              src={profilePicUrl}
                              alt="Profile"
                              className="w-40 h-40 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900/30 shadow-lg hover:shadow-xl transition-shadow duration-300"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-2 shadow-md border border-gray-200 dark:border-slate-700">
                              <div className="bg-green-500 h-4 w-4 rounded-full"></div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-40 h-40 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-700 border-4 border-indigo-100 dark:border-indigo-900/30 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-2 shadow-md border border-gray-200 dark:border-slate-700">
                              <div className="bg-green-500 h-4 w-4 rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                      
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{deliveryBoy.first_name} {deliveryBoy.last_name}</h2>
                        <p className="text-indigo-600 dark:text-indigo-400 mt-1">Delivery Partner</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="p-5 bg-gradient-to-br from-white to-gray-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700/50"
                        >
                          <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600/50 transition-colors">
                              <span className="text-gray-600 dark:text-gray-400">Full Name:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{deliveryBoy.first_name} {deliveryBoy.last_name}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600/50 transition-colors">
                              <span className="text-gray-600 dark:text-gray-400">Email:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{deliveryBoy.email}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600/50 transition-colors">
                              <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{deliveryBoy.phone}</span>
                            </div>
                            {deliveryBoy.phone2 && (
                              <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600/50 transition-colors">
                                <span className="text-gray-600 dark:text-gray-400">Alternate Phone:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{deliveryBoy.phone2}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="p-5 bg-gradient-to-br from-white to-gray-50 dark:from-slate-700/50 dark:to-slate-700/30 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700/50"
                        >
                          <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Address Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600/50 transition-colors">
                              <span className="text-gray-600 dark:text-gray-400">Address:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{deliveryBoy.address}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600/50 transition-colors">
                              <span className="text-gray-600 dark:text-gray-400">City:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{deliveryBoy.city}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600/50 transition-colors">
                              <span className="text-gray-600 dark:text-gray-400">State:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{deliveryBoy.state}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600/50 transition-colors">
                              <span className="text-gray-600 dark:text-gray-400">Country:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{deliveryBoy.country}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600/50 transition-colors">
                              <span className="text-gray-600 dark:text-gray-400">Pin Code:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{deliveryBoy.pin_code}</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="mt-8 text-center"
                      >
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] flex items-center space-x-2 mx-auto font-medium"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span>Edit Profile</span>
                        </button>
                      </motion.div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 flex justify-center items-center min-h-[300px]">
                  <div className="flex flex-col items-center space-y-4">
                    <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading profile details...</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>

      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
    </div>
  );
}

export default DeliveryProfilePage;