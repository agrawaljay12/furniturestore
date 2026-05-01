import React, { useEffect, useState, useRef } from "react";
import { FiSearch, FiShoppingCart, FiUser, FiBox, FiLogOut, FiKey, FiHeart, FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../pages/user/pro/cart/CartContext";
import couchImage from "../../assets/couch.png"; // Import the image
import storeimage from "../../assets/store.png"
import diningimage  from "../../assets/dining.png";
import chairimage from "../../assets/chair.png";
// import Couchimage  from "../../assets/couch.png";
import bedimage from "../../assets/bed.png";
import mattress from "../../assets/mattress.png";
import dealimage from "../../assets/deal.png";
import deskimage from "../../assets/desk.png";

interface HeaderProps {
  logoText: string;
  onSearch: (query: string) => void;
}

const MainHeader: React.FC<HeaderProps> = ({ logoText, onSearch }) => {
  const { cart, updateCartCount } = useCart();
  const navigate = useNavigate();
  
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isRentOpen, setIsRentOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileBuyOpen, setMobileBuyOpen] = useState(false);
  const [mobileRentOpen, setMobileRentOpen] = useState(false);

  // Define menu items array for categories
  const menuItems = [
    { path: "living", label: "Living Room", icon: couchImage },
    { path: "bedroom", label: "Bedroom", icon: bedimage },
    { path: "storage", label: "Storage", icon: storeimage },
    { path: "dining", label: "Dining", icon: diningimage },
    { path: "tables", label: "Tables", icon: deskimage },
    { path: "chairs", label: "Chairs", icon: chairimage },
    { path: "mattress", label: "Mattress", icon: mattress },
    { path: "best-deals", label: "Best Deals", icon: dealimage },
  ];

  useEffect(() => {
    updateCartCount();
  }, [updateCartCount]);

  const handleCartClick = () => navigate("/cart");
  const handleProfileClick = () => navigate("/profile");
  const handleOrderClick = () => navigate("/order-history");
  const handlePaymentClick = () => navigate("/payment-history");
  const handleChangePassword = () => navigate("/change-password");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  // const handleMouseEnter = () => setDropdownOpen(true);
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full  bg-opacity-90 backdrop-blur-lg shadow-md py-3">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        
        {/* Left - Logo */}
        <h1 className="text-2xl font-bold cursor-pointer text-teal-600 transition-colors hover:text-teal-700" onClick={() => navigate("/")}>
          {logoText}
        </h1>
        
        {/* Navigation - Buy and Rent */}
        <div className="hidden md:flex space-x-8 mx-4">
          {/* Buy Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsBuyOpen(true)}
              onMouseLeave={() => setIsBuyOpen(false)}
              >
              <Link to="/buy" className="flex items-center font-medium text-gray-700 hover:text-teal-600 transition group-hover:text-teal-600 py-2">
                Buy 
                <FiChevronDown className={`ml-1.5 transition-transform duration-300 ${isBuyOpen ? 'rotate-180' : ''}`} />
              </Link>
              
              <div 
                className={`absolute z-50 left-0 mt-2 w-[500px] bg-white rounded-xl shadow-2xl
                  border border-gray-100 transform transition-all duration-300
                  ${isBuyOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-3 pointer-events-none'
                  }`}
                style={{
                  transformOrigin: 'top left',
                  boxShadow: isBuyOpen ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                {/* Decorative header */}
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-t-xl"></div>
                
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Buy Furniture</h3>
                        <p className="text-gray-500 text-sm">Over 2000+ products for your perfect home</p>
                      </div>
                      <Link 
                        to="/buy" 
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
                            to={`/${item.path}`} 
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
                            to={`/${item.path}`} 
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
                            to="/best-deals" 
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
              <Link to="/rent" className="flex items-center font-medium text-gray-700 hover:text-purple-600 transition group-hover:text-purple-600 py-2">
                Rent 
                <FiChevronDown className={`ml-1.5 transition-transform duration-300 ${isRentOpen ? 'rotate-180' : ''}`} />
              </Link>
              
              <div 
                className={`absolute z-50 left-0 mt-2 w-[500px] bg-white rounded-xl shadow-2xl
                  border border-gray-100 transform transition-all duration-300
                  ${isRentOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-3 pointer-events-none'
                  }`}
                style={{
                  transformOrigin: 'top left',
                  boxShadow: isRentOpen ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : 'none'
                }}
                >
                {/* Decorative header */}
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-2 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Rent Furniture</h3>
                        <p className="text-gray-500 text-sm">Flexible rental options for every timeline and budget</p>
                      </div>
                      <Link 
                        to="/rent" 
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
                            to={`/rent-${item.path}`} 
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
                          to={`/rent-${item.path}`} 
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
                  <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg ">
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
                          to="/rent-best-deals" 
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
          
            {/* Right - Search Bar & Icons */}
            <div className="flex items-center space-x-6">
                <div className="relative hidden md:block">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-56 md:w-72 lg:w-80 px-4 py-2.5 rounded-full border border-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm" 
                  onChange={(e) => onSearch(e.target.value)} 
                />
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-600 text-lg cursor-pointer" />
                </div>
              
                <button 
                  onClick={() => navigate("/wishlist")} 
                  className="text-2xl text-gray-700 hover:text-teal-600 transition-all hover:scale-110 p-2" 
                  aria-label="Wishlist"
                >
                  <FiHeart />
                </button>
                
                <button 
                  onClick={handleCartClick} 
                  className="relative text-2xl text-gray-700 hover:text-teal-600 transition-all hover:scale-110 p-2" 
                  aria-label="Cart"
                >
                  <FiShoppingCart />
                  {cart.length > 0 && 
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full shadow-md transform transition-transform animate-pulse">
                      {cart.length}
                    </span>
                  }
                </button>

                <button
                  className="md:hidden text-2xl text-gray-700"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                  {isMobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>

              {/* Profile Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button 
                  className="text-2xl text-gray-700 hover:text-teal-600 transition-all hover:scale-110 p-2" 
                  aria-label="Profile" onClick={() => setDropdownOpen(!isDropdownOpen)}
                >
                  <FiUser />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-1"></div>
                    <button onClick={handleProfileClick} className="w-full flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50"><FiUser className="mr-2.5 text-teal-600" /> Profile</button>
                    <button onClick={handleOrderClick} className="w-full flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50"><FiBox className="mr-2.5 text-teal-600" /> Order History</button>
                    <button onClick={handlePaymentClick} className="w-full flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50"><FiBox className="mr-2.5 text-teal-600" /> Payment History</button>
                    <button onClick={handleChangePassword} className="w-full flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50"><FiKey className="mr-2.5 text-teal-600" /> Change Password</button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-red-600 hover:bg-red-50"><FiLogOut className="mr-2.5" /> Logout</button>
                  </div>
                )}
              </div>
            </div>

        </div>

      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (

        
        <div className="md:hidden bg-white shadow-lg border-t border-gray-200 px-4 py-4 space-y-4">

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
              onChange={(e) => onSearch(e.target.value)}
            />
            <FiSearch className="absolute right-3 top-3 text-gray-500" />
          </div>

          {/* BUY SECTION */}
          <div>
            <button
              onClick={() => setMobileBuyOpen(!mobileBuyOpen)}
              className="flex justify-between items-center w-full font-semibold text-gray-700"
            >
              Buy
              <FiChevronDown className={`${mobileBuyOpen ? "rotate-180" : ""}`} />
            </button>

            {mobileBuyOpen && (
              <div className="mt-2 grid grid-cols-2 gap-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={`/${item.path}`}
                    className="flex items-center space-x-3 md:space-x-6 p-2 bg-gray-50 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <img src={item.icon} className="w-6 h-6" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* RENT SECTION */}
          <div>
            <button
              onClick={() => setMobileRentOpen(!mobileRentOpen)}
              className="flex justify-between items-center w-full font-semibold text-gray-700"
            >
              Rent
              <FiChevronDown className={`${mobileRentOpen ? "rotate-180" : ""}`} />
            </button>

            {mobileRentOpen && (
              <div className="mt-2 grid grid-cols-2 gap-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={`/rent-${item.path}`}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <img src={item.icon} className="w-6 h-6" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Extra Links */}
          <div className="flex justify-around pt-3 border-t">
            <button onClick={() => navigate("/wishlist")}><FiHeart size={20} /></button>
            <button onClick={handleCartClick}><FiShoppingCart size={20} /></button>
            <button onClick={handleProfileClick}><FiUser size={20} /></button>
          </div>
        </div>
      )}
    </header>
  );
};

export default MainHeader;