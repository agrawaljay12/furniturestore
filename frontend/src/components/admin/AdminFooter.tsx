import React from "react";

const AdminFooter: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-center py-4 shadow-md border-t border-gray-700">
      <div className="container mx-auto px-4">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Furniture Rental System. All rights reserved.
        </p>
       
      </div>
    </footer>
  );
};

export default AdminFooter;
