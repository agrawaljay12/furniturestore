import React from "react";
import Sidebar from "../../components/admin/Sidebar"; // Sidebar component
import AdminHeader from "../../components/admin/AdminHeader"; // Admin header component
import { FiSettings } from "react-icons/fi"; // Import settings icon for the page

const Settings: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar with scroll */}
      <div className="flex-none h-screen ">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AdminHeader />

        {/* Content (shifted down below the header) */}
        <div className="mt-24 px-6">
          {/* Page Title */}
          <div className="flex items-center space-x-2 mb-6">
            <FiSettings size={24} className="text-teal-700" />
            <h1 className="text-2xl font-bold text-teal-700">Settings</h1>
          </div>

          {/* Settings Content */}
          <div className="p-4 bg-white shadow rounded-lg">
            <p>Settings content goes here.</p>
            {/* Add any settings forms or details */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
