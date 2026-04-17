import React, { useState } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";

// Import Images
import couchImage from "../../assets/couch.png";
import storeImage from "../../assets/store.png";
import diningImage from "../../assets/dining.png";
import chairImage from "../../assets/chair.png";
import bedImage from "../../assets/bed.png";
import mattressImage from "../../assets/mattress.png";
import dealImage from "../../assets/deal.png";
import deskImage from "../../assets/desk.png";

interface HeaderProps {
  logotext: string;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ logotext, onSearch }) => {
  const navigate = useNavigate();
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isRentOpen, setIsRentOpen] = useState(false);

  const menuItems = [
    { label: "Living Room", icon: couchImage, path: "living" },
    { label: "Bedroom", icon: bedImage, path: "bedroom" },
    { label: "Storage", icon: storeImage, path: "storage" },
    { label: "Dining", icon: diningImage, path: "dining" },
    { label: "Tables", icon: deskImage, path: "table" },
    { label: "Chairs", icon: chairImage, path: "chairs" },
    { label: "Mattress", icon: mattressImage, path: "mattress" },
    { label: "Best Deals", icon: dealImage, path: "deals" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full  bg-opacity-90 backdrop-blur-lg shadow-md py-3">
      <div className="container mx-auto flex items-center justify-between px-6">
      {/* Logo */}
        <div className="flex-1 justify-start">
          <Link to="/" className="text-teal-600 font-bold text-3xl hover:text-teal-700 transition">
            {logotext}
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex space-x-10">
          <Link to="/" className="font-medium text-gray-700 hover:text-teal-600 transition">Home</Link>
          <Link to="/about" className="font-medium text-gray-700 hover:text-teal-600 transition">About Us</Link>
          <Link to="/contact-us" className="font-medium text-gray-700 hover:text-teal-600 transition">Contact Us</Link>

         {/* Buy Dropdown */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsBuyOpen(true)}
          onMouseLeave={() => setIsBuyOpen(false)}
        >
          <Link to="/guest-buy" className="flex items-center font-medium text-gray-700 hover:text-teal-600 transition group-hover:text-teal-600">
            Buy 
            <FiChevronDown className={`ml-1 transition-transform duration-300 ${isBuyOpen ? 'rotate-180' : ''}`} />
          </Link>
          
          <div 
            className={`absolute left-0 mt-3 w-[480px] bg-white shadow-xl rounded-xl overflow-hidden transform transition-all duration-300 origin-top-left z-50 border border-gray-100 ${
              isBuyOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-3 pointer-events-none'
            }`}
          >
            {/* Decorative header */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-2"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Buy Furniture</h3>
                  <p className="text-gray-500 text-sm">Over 2000+ products for your perfect home</p>
                </div>
                <Link 
                  to="/guest-buy" 
                  className="text-xs font-medium uppercase tracking-wide text-teal-600 hover:text-teal-700 flex items-center"
                >
                  View All
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              {/* Popular categories section */}
              <div className="mb-5">
                <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-3">Popular Categories</h4>
                <div className="grid grid-cols-4 gap-5">
                  {menuItems.slice(0, 4).map((item) => (
                    <Link 
                      key={item.path} 
                      to={`/guest-${item.path}`} 
                      className="flex flex-col items-center group/item"
                    >
                      <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-gray-50 group-hover/item:bg-teal-50 mb-2 transition-colors duration-300">
                        <img src={item.icon} alt={item.label} className="w-8 h-8 group-hover/item:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-sm text-gray-700 group-hover/item:text-teal-600 transition-colors duration-300">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Other categories section */}
              <div>
                <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-3">More Categories</h4>
                <div className="grid grid-cols-4 gap-5">
                  {menuItems.slice(4).map((item) => (
                    <Link 
                      key={item.path} 
                      to={`/guest-${item.path}`} 
                      className="flex flex-col items-center group/item"
                    >
                      <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-gray-50 group-hover/item:bg-teal-50 mb-2 transition-colors duration-300">
                        <img src={item.icon} alt={item.label} className="w-8 h-8 group-hover/item:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-sm text-gray-700 group-hover/item:text-teal-600 transition-colors duration-300">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Featured promotion */}
              <div className="mt-6 bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="mr-4">
                    <span className="bg-yellow-400 text-xs font-bold px-2 py-1 rounded text-gray-800">NEW</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800">Summer Collection 2025</h5>
                    <p className="text-xs text-gray-600">Get 15% off on all outdoor furniture</p>
                  </div>
                  <div className="ml-auto">
                    <Link 
                      to="/guest-deals" 
                      className="text-xs font-medium bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700 transition"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rent Dropdown */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsRentOpen(true)}
          onMouseLeave={() => setIsRentOpen(false)}
        >
          <Link to="/guest-rent" className="flex items-center font-medium text-gray-700 hover:text-purple-600 transition group-hover:text-purple-600">
            Rent 
            <FiChevronDown className={`ml-1 transition-transform duration-300 ${isRentOpen ? 'rotate-180' : ''}`} />
          </Link>
          
          <div 
            className={`absolute left-0 mt-3 w-[480px] bg-white shadow-xl rounded-xl overflow-hidden transform transition-all duration-300 origin-top-left z-50 border border-gray-100 ${
              isRentOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-3 pointer-events-none'
            }`}
          >
            {/* Decorative header */}
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-2"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Rent Furniture</h3>
                  <p className="text-gray-500 text-sm">Flexible rental options for every timeline and budget</p>
                </div>
                <Link 
                  to="/guest-rent" 
                  className="text-xs font-medium uppercase tracking-wide text-purple-600 hover:text-purple-700 flex items-center"
                >
                  View All
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              {/* Top rental options section */}
              <div className="mb-5">
                <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-3">Most Popular Rentals</h4>
                <div className="grid grid-cols-4 gap-5">
                  {menuItems.slice(0, 4).map((item) => (
                    <Link 
                      key={item.path} 
                      to={`/guest-r${item.path}`} 
                      className="flex flex-col items-center group/item"
                    >
                      <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-gray-50 group-hover/item:bg-purple-50 mb-2 transition-colors duration-300">
                        <img src={item.icon} alt={item.label} className="w-8 h-8 group-hover/item:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-sm text-gray-700 group-hover/item:text-purple-600 transition-colors duration-300">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Additional rental options section */}
              <div>
                <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-3">More Rental Options</h4>
                <div className="grid grid-cols-4 gap-5">
                  {menuItems.slice(4).map((item) => (
                    <Link 
                      key={item.path} 
                      to={`/guest-r${item.path}`} 
                      className="flex flex-col items-center group/item"
                    >
                      <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-gray-50 group-hover/item:bg-purple-50 mb-2 transition-colors duration-300">
                        <img src={item.icon} alt={item.label} className="w-8 h-8 group-hover/item:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="text-sm text-gray-700 group-hover/item:text-purple-600 transition-colors duration-300">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Rental plans section */}
              <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="mr-4">
                    <span className="bg-purple-200 text-xs font-bold px-2 py-1 rounded text-purple-800">FLEXIBLE</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800">Monthly Rental Plans</h5>
                    <p className="text-xs text-gray-600">No commitments - rent for as little as 3 months</p>
                  </div>
                  <div className="ml-auto">
                    <Link 
                      to="/guest-rdeals" 
                      className="text-xs font-medium bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1.5 rounded hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                      aria-label="View rental plans"
                      title="Browse our flexible rental plans and pricing"
                    >
                      <span>See Plans</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </nav>

        {/* Search & Auth */}
        <div className="flex items-center space-x-6 ml-auto justify-end px-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-72 px-4 py-2 rounded-full border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-teal-500" 
              onChange={(e) => onSearch(e.target.value)} 
            />
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-600 text-lg cursor-pointer" />
          </div>
          {/* Auth Buttons */}
          <button 
            onClick={() => navigate("/login")} 
            className="text-teal-600 font-medium hover:text-teal-700 transition"
          >
            Login
          </button>
          <button 
            onClick={() => navigate("/signup")} 
            className="bg-teal-600 text-white py-2 px-5 rounded-full hover:bg-teal-500 transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;