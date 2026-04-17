import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/guest/Header";
import Footer from "../../../components/guest/Footer";
import { FiHeart, FiShoppingBag, FiTag, FiMapPin, FiInfo } from "react-icons/fi";
import ChatWidget from "../../../components/ChatAi/ChatWidget";


interface Product {
  _id: string;
  title: string;
  price: string;
  image?: string;
  description: string;
  category: string;
  is_for_rent: boolean;
  rent_price: string;
  is_for_sale: boolean;
  condition: string;
  availability_status: string;
  dimensions: string;
  location: string;
  created_by: string;
  created_at: string;
  images: string[];
  quantity?: number;
  totalPrice?: string; // To hold the total price for each item
  currentImageIndex: number; // Add this property
  discountedPrice?: string; // Add discounted price property
  discount?: number; // Add discount property
  _price_for_sort?: number; // Added for sorting purposes
  _date_for_sort?: number; // Added for sorting purposes
  [key: string]: string | number | boolean | string[] | undefined; // Index signature
}

const guestdeals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // List all products
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]); // Paginated products
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // 10 cards per page
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("price"); // Changed default from "title" to "price" for consistency
  const [sortOrder, setSortOrder] = useState("asc");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const navigate = useNavigate();
  const sortRef = useRef<HTMLDivElement>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSaleOnly] = useState(true); // Default to showing items for sale only

  // Click outside handler for sort dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getSortDisplayText = () => {
    const field = sortBy.charAt(0).toUpperCase() + sortBy.slice(1);
    const order = sortOrder === "asc" ? "Low to High" : "High to Low";
    return `${field}: ${order}`;
  };

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
    setPage(1); // Reset to first page when sorting changes
  };

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch furniture with offers/discounts directly
        const response = await fetch(
          "http://127.0.0.1:10007/api/v1/offer/list",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await response.json();
        
        // Check if the response contains an error message
        if (data.error) {
          console.error("API returned an error:", data.error);
          setError(`Server error: ${data.error}`);
          setProducts([]);
          return;
        }

        if (data && data.data) {
          // Make sure to only include items that are for sale
          let filteredProducts = data.data.filter((product: Product) => product.is_for_sale === true);
          setProducts(filteredProducts);
          
          // Process the products to ensure they have all required fields
          const processedProducts = filteredProducts.map((product: Product) => {
            // Ensure date fields are properly formatted strings
            const safeProduct = {...product};
            
            // Handle any potential date fields
            Object.keys(safeProduct).forEach(key => {
              // If value is an ISO date string, convert to a readable format
              if (typeof safeProduct[key] === 'string' && 
                  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(safeProduct[key])) {
                try {
                  const date = new Date(safeProduct[key]);
                  if (!isNaN(date.getTime())) {
                    // Store original date value for sorting purposes
                    if (key === 'created_at') {
                      safeProduct['_date_for_sort'] = date.getTime();
                    }
                    safeProduct[key] = date.toLocaleDateString();
                  }
                } catch (e) {
                  // Keep original value if date conversion fails
                }
              }
            });
            
            // Ensure price is a valid number for sorting
            if (safeProduct.price) {
              safeProduct['_price_for_sort'] = parseFloat(String(safeProduct.price)) || 0;
            }
            
            return {
              ...safeProduct,
              // Ensure images array exists
              images: safeProduct.images || (safeProduct.image ? [safeProduct.image] : []),
              // Add currentImageIndex property
              currentImageIndex: 0,
              // Format discount for display
              discount: safeProduct.discount || 0,
              // Ensure price is properly formatted
              price: safeProduct.price || "0.00",
              // Ensure discounted price is set
              discountedPrice: safeProduct.discountedPrice || 
                (safeProduct.discount && safeProduct.price ? 
                  (parseFloat(safeProduct.price) * (1 - safeProduct.discount/100)).toFixed(2) : 
                  safeProduct.price)
            };
          });
          
          // Apply search filter if provided
          if (searchQuery) {
            filteredProducts = processedProducts.filter(
              (product: Product) => 
                product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          
          // Apply sorting
          if (sortBy) {
            filteredProducts.sort((a: Product, b: Product) => {
              // Handle different sort fields appropriately based on data type
              if (sortBy === 'price') {
                // Use the extracted numerical price value for sorting
                const aValue = a['_price_for_sort'] || 0;
                const bValue = b['_price_for_sort'] || 0;
                return sortOrder === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
              } 
              else if (sortBy === 'created_at') {
                // Use the stored timestamp for date sorting
                const aValue = a['_date_for_sort'] || 0;
                const bValue = b['_date_for_sort'] || 0;
                return sortOrder === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
              }
              else if (sortBy === 'title') {
                // Use string comparison for text fields
                const aValue = String(a[sortBy] || '').toLowerCase();
                const bValue = String(b[sortBy] || '').toLowerCase();
                return sortOrder === 'asc' 
                  ? aValue.localeCompare(bValue) 
                  : bValue.localeCompare(aValue);
              }
              else {
                // Default fallback for other fields
                const aValue = a[sortBy] || '';
                const bValue = b[sortBy] || '';
                
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                  return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                } else {
                  const aStr = String(aValue).toLowerCase();
                  const bStr = String(bValue).toLowerCase();
                  return sortOrder === 'asc' 
                    ? aStr.localeCompare(bStr) 
                    : bStr.localeCompare(aStr);
                }
              }
            });
          }
          
          setProducts(filteredProducts);
        } else {
          console.warn("Received empty or invalid data from API", data);
          setProducts([]);
          setError("No deals available at this time");
        }
      } catch (error) {
        console.error("Error fetching discounted products:", error);
        setError("Failed to load deals. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, [searchQuery, sortBy, sortOrder, page, showSaleOnly]);

  useEffect(() => {
    // Paginate the fetched products
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedProducts(products.slice(startIndex, endIndex));

    // Set total pages
    setTotalPages(Math.ceil(products.length / pageSize));
  }, [products, page, pageSize]);

  useEffect(() => {
    const userId = localStorage.getItem("token");
    if (userId) {
      const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${userId}`) || "[]");
      setWishlist(storedWishlist);
    }
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // const handleAddToCart = (product: Product, quantity: number) => {
  //   // Show login popup instead of adding to cart for guest users
  //   setShowLoginPopup(true);
  // };

  // const showProductPreview = (product: Product) => {
  //   // Show login popup instead of preview for guest users
  //   setShowLoginPopup(true);
  // };

  // const closePreview = () => {
  //   setPreviewProduct(null);
  // };

  const closeLoginPopup = () => {
    setShowLoginPopup(false);
  };

  // const handleAddToWishlist = (product: Product) => {
  //   // Show login popup instead of adding to wishlist for guest users
  //   setShowLoginPopup(true);
  // };

  const isProductInWishlist = (productId: string) => {
    return wishlist.some(product => product._id === productId);
  };

  const handleProductClick = (product: Product) => {
    navigate(`/guest-view-product/${product._id}`, { state: { product } });
  };

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  const getProductImage = (product: Product) => {
    if (imageErrors[product._id]) {
      // Return a placeholder if image failed to load
      return "https://via.placeholder.com/300x200?text=No+Image+Available";
    }
    
    if (product.images && product.images.length > 0) {
      return product.images[0];
    } else if (product.image) {
      return product.image;
    } else {
      return "https://via.placeholder.com/300x200?text=No+Image+Available";
    }
  };

  // Calculate discounted sale price
  const getDiscountedSalePrice = (product: Product) => {
    if (!product.price) return "0.00";
    const price = parseFloat(product.price);
    const discount = product.discount || 0;
    return (price * (1 - discount/100)).toFixed(2);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header
          logotext="Furniture Store"
          onSearch={(query: string) => {
            setSearchQuery(query);
            setPage(1);
          }}
        />
      </div>

      <div className="min-h-screen bg-gray-50 px-8 pt-24 pb-16">
        <h2 className="text-3xl font-semibold text-center mb-8">Best Deals Furniture</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8 flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0016 0zm-7 4a1 1 0 11-2 0 1 1 012 0zm-1-9a1 1 00-1 1v4a1 1 00-2 0V6a1 1 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">Error loading deals</h3>
              <p className="mt-1 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
              >
                Try refreshing the page
              </button>
            </div>
          </div>
        )}

        <div className="mb-4 flex justify-end">
          {/* Sort Dropdown */}
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
            
            {showSortOptions && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-10 animate-fadeIn">
                <div className="py-2">
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Sort Options
                  </h3>
                  
                  {[
                    { id: "price", label: "Price", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0018 0z" },
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

        {/* Add an informative banner about sale items */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center">
          <div className="flex-shrink-0 text-yellow-500 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0118 0z" />
            </svg>
          </div>
          <p className="text-yellow-800 text-sm">
            <span className="font-medium">Showing furniture items for sale with special deals.</span> All displayed items are available for purchase with discounts.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
            <p className="ml-4 text-lg text-gray-600">Loading deals...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-20">
            <FiShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No deals found</h3>
            <p className="mt-2 text-sm text-gray-500">Try adjusting your search or check back later for new deals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
            {displayedProducts.map((product, index) => (
              <div
                key={`${product._id}-${index}`}
                className="bg-white rounded-xl shadow-md overflow-hidden w-full h-full flex flex-col cursor-pointer card-hover"
                onClick={() => handleProductClick(product)}
                style={{ animation: `fadeSlideUp 0.5s ease forwards ${index * 0.1}s`, opacity: 0 }}
              >
                <div className="relative">
                  <div className="relative overflow-hidden group">
                    <div className="aspect-w-1 aspect-h-1 w-full bg-gray-200">
                      <img
                        src={getProductImage(product)}
                        alt={product.title}
                        className="w-full h-60 object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={() => handleImageError(product._id)}
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-sm font-medium line-clamp-1">{product.title}</p>
                      <p className="text-xs opacity-80 mt-1">{product.category}</p>
                    </div>
                    
                    {/* Status badge - For Sale page */}
                    {product.is_for_sale && (
                      <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        For Sale
                      </div>
                    )}
                    
                    {/* Discount badge with animation */}
                    {product.discount && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>
                  
                  <button
                    className={`absolute bottom-3 right-3 text-xl transition-all p-2 bg-white rounded-full shadow-lg ${
                      isProductInWishlist(product._id) 
                      ? 'text-red-500 transform rotate-12 scale-110' 
                      : 'text-gray-400 hover:text-red-500 hover:scale-110'
                    }`}
                    aria-label="Wishlist"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLoginPopup(true); // Directly show login popup
                    }}
                  >
                    <FiHeart className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {product.description}
                    </p>
                    
                    {/* Additional product details with icons */}
                    <div className="mt-3 space-y-1">
                      {product.condition && (
                        <div className="flex items-center text-xs text-gray-500">
                          <FiTag className="w-3 h-3 mr-1" />
                          <span>{product.condition}</span>
                        </div>
                      )}
                      {product.location && (
                        <div className="flex items-center text-xs text-gray-500">
                          <FiMapPin className="w-3 h-3 mr-1" />
                          <span>{product.location}</span>
                        </div>
                      )}
                      {product.dimensions && (
                        <div className="flex items-center text-xs text-gray-500">
                          <FiInfo className="w-3 h-3 mr-1" />
                          <span>{product.dimensions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      {product.discount ? (
                        <div className="flex flex-col">
                          <div className="text-xl font-bold text-green-600">
                            ${getDiscountedSalePrice(product)}
                          </div>
                          <div className="text-xs text-gray-500 line-through">
                            ${product.price}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xl font-bold text-gray-900">
                          ${product.price}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLoginPopup(true); // Directly show login popup
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
        )}

        {/* Add animation keyframes */}
        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .card-hover {
            transition: all 0.3s ease;
          }
          
          .card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          
          .aspect-w-1 {
            position: relative;
            padding-bottom: 100%;
          }
          
          .aspect-w-1 > img {
            position: absolute;
            height: 100%;
            width: 100%;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            object-fit: cover;
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
        `}</style>

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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

export default guestdeals;