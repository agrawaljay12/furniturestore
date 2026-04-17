import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminFooter from "../../components/admin/AdminFooter";
import Sidebar from "../../components/admin/Sidebar";
import { useAdmin } from "./Admincontext";

interface Admin {
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

function AdminProfilePage(): React.ReactElement {
  const { admin, setAdmin } = useAdmin();
  const [file, setFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Admin | null>(null);
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
        `http://127.0.0.1:10007/api/v1/auth/user/fetch/${userId}`
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
      fetchAdminDetails();// Fetch the updated admin data
      setAdmin(response.data.data);// Update the admin data
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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="fixed top-0 left-0 h-full">
        <Sidebar />
      </div>

      <div className="flex-1 ml-72 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Admin Profile
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View and manage your personal information</p>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400">
                  <p>{error}</p>
                </div>
              )}

              {admin ? (
                <div className="p-6">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        {previewPicUrl ? (
                          <div className="relative group">
                            <img
                              src={previewPicUrl}
                              alt="Preview"
                              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900/30"
                              onClick={handleProfilePicClick}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleProfilePicClick}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                          </div>
                        ) : profilePicUrl ? (
                          <div className="relative group">
                            <img
                              src={profilePicUrl}
                              alt="Profile"
                              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900/30"
                              onClick={handleProfilePicClick}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleProfilePicClick}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                          </div>
                        ) : null}
                      </div>
                      
                      <input
                        type="file"
                        name="profile_picture"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['first_name', 'last_name', 'email', 'phone', 'phone2', 'address', 'pin_code', 'state', 'city', 'country'].map((field, index) => (
                          <div key={index} className="space-y-1">
                            <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </label>
                            <input
                              type="text"
                              id={field}
                              name={field}
                              value={formData ? (formData as any)[field] : ''}
                              onChange={handleInputChange}
                              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                              placeholder={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-end space-x-4 pt-4">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-center mb-8">
                        {profilePicUrl && (
                          <img
                            src={profilePicUrl}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900/30 shadow-md"
                          />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Personal Information</h3>
                          <div className="space-y-3">
                            <p className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Full Name:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{admin.first_name} {admin.last_name}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Email:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{admin.email}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{admin.phone}</span>
                            </p>
                            {admin.phone2 && (
                              <p className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Alternate Phone:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{admin.phone2}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Address Information</h3>
                          <div className="space-y-3">
                            <p className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Address:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{admin.address}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">City:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{admin.city}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">State:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{admin.state}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Country:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{admin.country}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Pin Code:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{admin.pin_code}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 flex justify-center items-center">
                  <div className="flex items-center space-x-3">
                    <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">Loading admin details...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <AdminFooter />
      </div>

      <ToastContainer />
    </div>
  );
}

export default AdminProfilePage;