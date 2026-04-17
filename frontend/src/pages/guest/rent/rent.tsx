import React, { useState, useEffect, Key, useRef } from "react";
import Header from "../../../components/guest/Header";
import Footer from "../../../components/guest/Footer";
import { useNavigate } from "react-router-dom";
import ChatWidget from "../../../components/ChatAi/ChatWidget";


// icons
import couchImage from "../../../assets/couch.png"; // Import the image
import storeimage from "../../../assets/store.png";
import diningimage from "../../../assets/dining.png";
import chairimage from "../../../assets/chair.png";
import bedimage from "../../../assets/bed.png";
import mattress from "../../../assets/mattress.png";
import dealimage from "../../../assets/deal.png";
import deskimage from "../../../assets/desk.png";
import { FiHeart } from "react-icons/fi";

interface Product {
  _id: Key | null | undefined;
  id: string;
  name: string;
  image?: string;
  images?: string[];
  title: string;
  price: string;
  description: string;
  category: string;
  is_for_rent: boolean;
  rent_price: string;
  is_for_sale: boolean;
  condition: string;
  availability: string;
  createdAt: string;
  dimensions: string;
  sizes?: string[];
  status?: string;
}

const Rent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();
  const sortRef = useRef<HTMLDivElement>(null); // Reference for click outside handling

  // Handle clicking outside of the sort dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortRef]);

  // Function to handle sorting
  const handleSort = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and default to ascending
      setSortBy(newSortBy);
      setSortOrder("asc");
    }

    setShowSortOptions(false);
  };

  // Function to get sort display text
  const getSortDisplayText = () => {
    const field = sortBy.charAt(0).toUpperCase() + sortBy.slice(1);
    const order = sortOrder === "asc" ? "Low to High" : "High to Low";
    return `${field}: ${order}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const headersList = { "Content-Type": "application/json" };
      const bodyContent = JSON.stringify({
        page,
        page_size: 100,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: searchQuery,
        is_for_rent: true // Fetch only furniture that is for rent
      });

      try {
        const response = await fetch(
          "https://furnspace.onrender.com/api/v1/furniture/list_all",
          {
            method: "POST",
            body: bodyContent,
            headers: headersList,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.data) {
          const filteredProducts = data.data.filter((product: Product) => 
            product.is_for_rent && product.status === "approved"
          );
          setProducts(filteredProducts); // Set only approved products available for rent
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [searchQuery, sortBy, sortOrder, page]);

  useEffect(() => {
    // Paginate the fetched products
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedProducts(products.slice(startIndex, endIndex));

    // Set total pages
    setTotalPages(Math.ceil(products.length / pageSize));
  }, [products, page, pageSize]);

  useEffect(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedProducts(products.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(products.length / pageSize));
  }, [products, page, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Removed handleAddToCart function


  const closePreview = () => {
    setPreviewProduct(null);
  };


  const handleProductClick = (product: Product) => {
    navigate(`/guest-view-product/${product._id}`, { state: { product } });
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setShowLoginPopup(true);
  };

  const handleHeartClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setShowLoginPopup(true);
  };

  const closeLoginPopup = () => {
    setShowLoginPopup(false);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header logotext={"Furniture Store"} onSearch={(query) => setSearchQuery(query)} />
        <div className="flex justify-center mt-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for furniture..."
            className="p-2 border border-gray-300 rounded w-1/2"
          />
        </div>
      </div>

      {/* icons */}
      <div className="min-h-screen bg-gray-50 px-8 pt-24 pb-16">
        <h2 className="text-3xl font-semibold text-center mb-8">RENT FURNITURE</h2>
        <div className="p-10 bg-transparent">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-items-center ">
            {[
              { label: "Living Room", icon: couchImage, badge: "", badgeColor: "bg-yellow-400", link: "/guest-rliving" },
              { label: "Bedroom", icon: bedimage, badge: "", badgeColor: "bg-yellow-400", link: "/guest-rbedroom" },
              { label: "Storage", icon: storeimage, badge: "", badgeColor: "", link: "/guest-rstorage" },
              { label: "Dining", icon: diningimage, badge: "", badgeColor: "", link: "/guest-rdining" },
              { label: "Tables", icon: deskimage, badge: "", badgeColor: "", link: "/guest-rtable" },
            ].map((item) => (
              <div
                key={item.label}
                className="relative flex flex-col items-center transition-transform duration-300 hover:scale-110 hover:text-blue-500 cursor-pointer"
                onClick={() => navigate(item.link)}
              >
                {item.badge && (
                  <span
                    className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 text-xs text-white rounded-md ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                <img src={item.icon} alt={item.label} className="w-14 h-14 mb-2" />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Centered Last Two Items */}
          <div className="flex justify-center gap-28 mt-20">
            {[
              { label: "Chairs", icon: chairimage, badge: "", badgeColor: "", link: "/guest-rchairs" },
              { label: "Best Deals", icon: dealimage, badge: "", badgeColor: "", link: "/guest-rdeals" },
              { label: "Mattress", icon: mattress, badge: "", badgeColor: "", link: "/guest-rmattress" },
            ].map((item) => (
              <div
                key={item.label}
                className="relative flex flex-col items-center transition-transform duration-300 hover:scale-110 hover:text-blue-500 cursor-pointer"
                onClick={() => navigate(item.link)}
              >
                {item.badge && (
                  <span
                    className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 text-xs text-white rounded-md ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                <img src={item.icon} alt={item.label} className="w-14 h-14 mb-2" />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4 flex justify-end">
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              {/* Filter icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              <span className="font-medium">Sort: {getSortDisplayText()}</span>
              {/* Chevron icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showSortOptions ? 'transform rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            {/* Sort Options Dropdown */}
            {showSortOptions && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-10 animate-fadeIn">
                <div className="py-2">
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Sort Options
                  </h3>
                  
                  { [
                    { id: "price", label: "Price", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                    { id: "title", label: "Name", icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" },
                    { id: "created_at", label: "Date Added", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" }
                  ].map((option) => (
                    <div key={option.id} className="px-1">
                      <button
                        className={`w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50 rounded-md ${sortBy === option.id ? 'text-yellow-600 font-medium' : 'text-gray-700'}`}
                        onClick={() => handleSort(option.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d={option.icon} />
                          </svg>
                          <span>{option.label}</span>
                        </div>
                        {sortBy === option.id && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <div className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-600">Order:</span>
                      <div className="mt-1 flex space-x-4">
                        <button
                          className={`px-3 py-1.5 rounded text-sm ${sortOrder === "asc" ? "bg-yellow-100 text-yellow-800 font-medium" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          onClick={() => setSortOrder("asc")}
                        >
                          Ascending
                        </button>
                        <button
                          className={`px-3 py-1.5 rounded text-sm ${sortOrder === "desc" ? "bg-yellow-100 text-yellow-800 font-medium" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          onClick={() => setSortOrder("desc")}
                        >
                          Descending
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 ml-6 text-left">
          <h2 className="text-4xl font-sans text-gray-800 ">% Deals of the day for rent</h2>
          <p className="text-lg text-gray-600 mt-2">Don't miss out on these amazing offers!</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8 px-4">
          {displayedProducts.map((product, index) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-md overflow-hidden w-full h-full flex flex-col cursor-pointer card-hover"
              onClick={() => handleProductClick(product)}
              style={{ animation: `fadeSlideUp 0.5s ease forwards ${index * 0.1}s`, opacity: 0 }}
            >
              <div className="relative">
                <div className="relative overflow-hidden group">
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0] : product.image}
                    alt={product.title}
                    className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                  </div>
                </div>
                
                <button
                  className="absolute top-3 right-3 text-xl transition-all p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 hover:scale-110"
                  aria-label="Wishlist"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHeartClick(e);
                  }}
                >
                  <FiHeart />
                </button>
              </div>
              
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.category}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-gray-900">${product.rent_price}/day</div>
                    {product.condition && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {product.condition}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(e);
                    }}
                    className="w-full py-2.5 px-4 bg-yellow-400 text-gray-900 rounded-lg font-medium hover:bg-yellow-500 transition-all transform hover:scale-105 focus:ring-2 focus:ring-yellow-300 flex items-center justify-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                    </svg>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add animation keyframes */}
        <style>{`
          @keyframes fadeSlideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .card-hover {
            transition: all 0.3s ease;
          }
          
          .card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
          
          .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out forwards;
          }
        `}</style>

        {previewProduct && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">{previewProduct.name}</h3>
                <button onClick={closePreview} className="text-gray-500 hover:text-gray-700">X</button>
              </div>
              <img
                src={previewProduct.images && previewProduct.images.length > 0 ? previewProduct.images[0] : previewProduct.image}
                alt={previewProduct.name}
                className="w-full h-64 object-cover mb-4"
              />
              <p className="text-sm text-gray-600 mb-2">{previewProduct.description}</p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-bold">Dimensions:</span> {previewProduct.dimensions}
              </p>
              <div className="mt-4 text-lg text-blue-600 font-bold">${previewProduct.rent_price}</div>
              <div className="mt-4 flex items-center">
                <label className="mr-2 text-gray-700">Quantity:</label>
                <input
                  type="number"
                  value={quantity}
                  min={1}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-16 p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  // onClick={(e) => handleAddToCart(e, previewProduct, quantity)}
                  className="py-2 px-4 bg-teal-600 text-white rounded-full hover:bg-teal-500 transition-all transform hover:scale-105"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {showLoginPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
                <button onClick={closeLoginPopup} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm text-gray-600 text-center mb-2">Please log in to add items to your cart or wishlist.</p>
                <p className="text-xs text-gray-500 text-center">Create an account to enjoy a personalized shopping experience!</p>
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={closeLoginPopup}
                  className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all transform hover:scale-105"
                >
                  Continue Browsing
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all transform hover:scale-105 shadow-md"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center items-center mt-8">
          <button
            className="py-2 px-4 mx-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition disabled:bg-gray-200 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="py-2 px-4 mx-2 bg-gray-200 rounded-lg">
            Page {page} of {totalPages}
          </span>
          <button
            className="py-2 px-4 mx-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition disabled:bg-gray-200 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
          {/* ChatWidget */}
          <ChatWidget currentSystemMessage="Welcome to our furniture store! I can help you find the perfect furniture for your home or assist you with any questions you may have." />
      <Footer />
    </>
  );
};

export default Rent;