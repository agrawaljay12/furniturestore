// src/pages/Settings.tsx
import React from 'react';
import SuperSidebar from '../../components/SuperSidebar';
import SuperAdminHeader from '../../components/SuperAdminHeader ';

const Setting: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with scroll */}
      <div className="w-64 bg-gray-800 text-white h-full overflow-y-auto">
        <SuperSidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <SuperAdminHeader />
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Setting</h1>
        </main>
      </div>
    </div>
  );
};

export default Setting;
