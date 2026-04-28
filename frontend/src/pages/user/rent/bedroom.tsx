import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../../components/user/MainHeader";
import { FiHeart } from "react-icons/fi";
import MainFooter from "../../../components/user/MainFooter";
import { useCart } from "../pro/cart/CartContext";
import ChatWidget from "../../../components/ChatAi/ChatWidget";
import useActivityLogger from "../UserActivity"; // Import the logger

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
  discountedPrice?: string; // Required for cart compatibility
  discount?: number; // Required for cart compatibility
}

const BedroomPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // List all products
 
  // State for pagination and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // 12 cards per page
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("rent_price");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showSortOptions, setShowSortOptions] = useState(false); // Added for dropdown toggle
  const [loading, setLoading] = useState(false); // ✅ NEW
  
  const sortRef = useRef<HTMLDivElement>(null); // Reference for click outside handling
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const logUserActivity = useActivityLogger(); // Initialize the logger

  
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
    let newOrder = "asc";

    if (sortBy === newSortBy) {
      // Toggle order
      newOrder = sortOrder === "asc" ? "desc" : "asc";
    }

    setSortBy(newSortBy);
    setSortOrder(newOrder);

    setShowSortOptions(false);
    setPage(1);

    logUserActivity(
      `Sorted products by ${newSortBy} in ${
        newOrder === "asc" ? "ascending" : "descending"
      } order`
    );
  };

  // Function to get sort display text
  const getSortDisplayText = () => {
    const map: Record<string, string> = {
      rent_price: "Price",
      title: "Name",
      category: "Category",
      created_at: "Date Added",
    };

    const field = map[sortBy] || sortBy;
    const order = sortOrder === "asc" ? "Low to High" : "High to Low";

    return `${field}: ${order}`;
  };

 useEffect(() => {
     const fetchProducts = async () => {
       setLoading(true);
 
       try {
         const response = await fetch(
           "https://furnspace.onrender.com/api/v1/furniture/list_all",
           {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
               page,
               limit: pageSize,
               sort_by: sortBy,
               order: sortOrder,
               search: searchQuery,
               listing_type: "rent",
               title: "", // ✅ REMOVE HARDCODE
             }),
           }
         );
 
         const data = await response.json();
 
         if (data?.data) {
           setProducts(data.data);
           setTotalPages(data.pagination.total_pages);
         }
       } catch (error) {
         console.error("Error fetching products:", error);
       } finally {
         setLoading(false);
       }
     };
 
     fetchProducts();
   }, [page, searchQuery, sortBy, sortOrder]);


  useEffect(() => {
      const delay = setTimeout(() => {
        setPage(1);
      }, 500);
  
      return () => clearTimeout(delay);
  }, [searchQuery]);

 
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

  const handleAddToCart = (product: Product, quantity: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    if (quantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    // Ensure product has a discountedPrice string and discount number before adding to cart
    const productWithRequiredProps = {
      ...product,
      discountedPrice: product.discountedPrice || product.rent_price,
      discount: product.discount || 0 // Set default discount to 0 if undefined
    };

    addToCart(productWithRequiredProps, quantity);
    alert("Added to cart!");
    closePreview();
    logUserActivity(`Added ${quantity} of ${product.title} to cart`); // Log activity
  };

  const showProductPreview = (product: Product) => {
    setPreviewProduct(product);
    setQuantity(1);
  };

  const closePreview = () => {
    setPreviewProduct(null);
  };

  const closeLoginPopup = () => {
    setShowLoginPopup(false);
    navigate('/login');
  };

  const handleProductClick = (product: Product) => {
    navigate(`/view-product/${product._id}`, { state: { product } });
  };

  const handleAddToWishlist = (product: Product) => {
    const userId = localStorage.getItem("token");
    if (!userId) {
      setShowLoginPopup(true);
      return;
    }

    const isInWishlist = wishlist.some(item => item._id === product._id);
    let updatedWishlist;

    if (isInWishlist) {
      updatedWishlist = wishlist.filter(item => item._id !== product._id);
      logUserActivity(`Removed ${product.title} from wishlist`); // Log activity
      alert("Removed from wishlist!");
    } else {
      updatedWishlist = [...wishlist, product];
      alert("Added to wishlist!");
      logUserActivity(`Added ${product.title} to wishlist`); // Log activity
    }

    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(updatedWishlist));
  };

  const isProductInWishlist = (productId: string) => {
    return wishlist.some(product => product._id === productId);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <MainHeader
          logoText="Furniture Store"
          onSearch={(query) => {
            setSearchQuery(query);
            setPage(1);
          }}
        />
      </div>

      <div className="min-h-screen bg-gray-50 px-8 pt-24 pb-16">
        <h2 className="text-3xl font-semibold text-center mb-8">Bedroom Furniture</h2>

        {/* Add sort and filter section */}
        <div className="flex justify-between items-center mt-12 px-6">
          <div>
            <h2 className="text-4xl font-sans text-gray-800 section-title">Bedroom Collection</h2>
            <p className="text-lg text-gray-600 mt-2">Create your perfect sleeping space</p>
          </div>
          
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
            
            {/* Sort Options Dropdown */}
            {showSortOptions && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-10 animate-fadeIn">
                <div className="py-2">
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Sort Options
                  </h3>
                  
                  {[
                    { id: "category", label: "category", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                    { id: "title", label: "Name", icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" },
                    { id: "created_at", label: "Date Added", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
                    { id: "rent_price", label: "Price", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }
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
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
                          onClick={() => {
                            setSortOrder("asc");
                            setPage(1);
                          }}
                        >
                          Ascending
                        </button>
                        <button
                          className={`px-3 py-1.5 rounded text-sm ${sortOrder === "desc" ? "bg-yellow-100 text-yellow-800 font-medium" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          onClick={() => {
                            setSortOrder("desc");
                            setPage(1);
                          }}
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

        {/* Add animation styles */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out forwards;
          }

          .section-title {
            position: relative;
            display: inline-block;
            margin-bottom: 1.5rem;
          }

          .section-title:after {
            content: '';
            position: absolute;
            width: 60px;
            height: 3px;
            background: #f9d423;
            bottom: -10px;
            left: 0;
          }
        `}</style>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">

          {loading && (
            <div className="col-span-full text-center text-gray-500">
              Loading furniture...
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="col-span-full text-center text-gray-500">
              No furniture available
            </div>
          )}

          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-md overflow-hidden w-full h-full flex flex-col cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => handleProductClick(product)}
            >
              <div className="relative">
                <img
                  src={product.images && product.images.length > 0 ? product.images[0] : product.image}
                  alt={product.title}
                  className="w-full h-48 object-cover" 
                />
               
                <button
                  className={`absolute top-2 right-2 p-2 bg-white rounded-full shadow-md ${isProductInWishlist(product._id) ? 'text-red-600' : 'text-gray-500 hover:text-red-500'}`}
                  aria-label="Wishlist"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the card click event from firing
                    handleAddToWishlist(product);
                  }}
                >
                  <FiHeart size={18} />
                </button>
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-1 line-clamp-1">{product.category}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-lg font-bold text-teal-600">${product.rent_price}<span className="text-xs text-gray-500">/day</span></div>
                    {product.condition && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {product.condition}
                      </span>
                    )}
                  </div>
                    <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the card click event
                      showProductPreview(product);
                    }}
                    className="w-full py-2 px-4 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-500 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
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

        {previewProduct && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm" 
            onClick={closePreview}
            style={{animation: 'fadeIn 0.3s ease-out'}}>
            <div 
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all"
              onClick={(e) => e.stopPropagation()}
              style={{animation: 'fadeSlideUp 0.4s ease-out'}}
            >
              <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{previewProduct.title}</h3>
              </div>
              <button 
                onClick={closePreview} 
                className="text-gray-500 hover:text-gray-700 font-bold text-xl px-3 py-1 rounded transition-colors"
              >
                X
              </button>
              </div>
              
              <div className="relative rounded-lg overflow-hidden mb-4">
              <img
                src={previewProduct.images && previewProduct.images.length > 0 ? previewProduct.images[0] : previewProduct.image}
                alt={previewProduct.title}
                className="w-full h-64 object-cover"
              />
              {previewProduct.condition && (
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-black font-medium px-3 py-1 rounded-lg text-sm">
                {previewProduct.condition}
                </div>
              )}
              </div>
              
              <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-2xl font-bold text-gray-900">
                ${(parseFloat(previewProduct.rent_price) * quantity).toFixed(2)}
                <span className="text-xs text-gray-500">/day</span>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                {previewProduct.availability_status || 'In Stock'}
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-4">{previewProduct.description}</p>
              {previewProduct.dimensions && (
                <p className="text-sm text-gray-500 mb-2">Dimensions: {previewProduct.dimensions}</p>
              )}
              {previewProduct.location && (
                <p className="text-sm text-gray-500">Location: {previewProduct.location}</p>
              )}
              </div>
              
              <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                -
                </button>
                <input
                type="number"
                value={quantity}
                min={1}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-16 text-center p-2 border-x border-gray-300 focus:outline-none"
                />
                <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                +
                </button>
              </div>
              </div>
              
              <div className="flex space-x-3">
              <button
                onClick={() => handleAddToCart(previewProduct, quantity)}
                className="flex-1 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-all flex items-center justify-center space-x-2"
              >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                  </svg>
                  <span>Add to Cart</span>
              </button>
              <button
                onClick={() => {
                handleAddToWishlist(previewProduct);
                closePreview();
                }}
                className={`p-3 rounded-lg border ${
                isProductInWishlist(previewProduct._id) 
                ? 'border-red-300 bg-red-50 text-red-600' 
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <FiHeart className="w-5 h-5" />
              </button>
              </div>
            </div>
            </div>
        )}

        {showLoginPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
                <button onClick={closeLoginPopup} className="text-gray-500 hover:text-gray-700 font-bold text-xl px-3 py-1 rounded transition-colors">X</button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Please log in to make a purchase.</p>
              <div className="flex justify-end">
                <button
                  onClick={() => navigate('/login')}
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all transform hover:scale-105"
                >
                  Go to Login
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
      <MainFooter />
    </>
  );
};

export default BedroomPage;