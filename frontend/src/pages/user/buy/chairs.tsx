import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../../components/user/MainHeader";
import { FiHeart } from "react-icons/fi";
import MainFooter from "../../../components/user/MainFooter";
import { useCart } from "../pro/cart/CartContext";
import useActivityLogger from "../UserActivity"; // Import the logger
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
  discountedPrice?: string; // Required by CartContext
  discount?: number; // Required by CartContext
}

const ChairsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // List all products
  // const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]); // Paginated products
  
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // 10 cards per page
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("title"); // Define sortBy variable
  const [sortOrder, setSortOrder] = useState("asc"); // Add sortOrder state
  
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false); // Add state for sort dropdown
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const navigate = useNavigate();
  
  const { addToCart } = useCart();
  const logUserActivity = useActivityLogger(); // Initialize the logger
  const sortRef = useRef<HTMLDivElement>(null); // Add ref for sort dropdown

  
  // Close sort dropdown when clicking outside
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

  useEffect(() => {
      const fetchProducts = async () => {
        const headersList = { "Content-Type": "application/json" };
  
        const bodyContent = JSON.stringify({
          page: page,
          limit: pageSize,
          sort_by: sortBy,
          order: sortOrder,
          search: searchQuery,
          listing_type: "buy",
          title: "chairs",
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
  
          const data = await response.json();
  
          if (data && data.data) {
            setProducts(data.data); // ✅ DIRECT
            setTotalPages(data.pagination.total_pages); // ✅ FROM BACKEND
          }
        } catch (error) {
          console.error("Error fetching products:", error);
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

    // Create a copy of the product with discountedPrice defaulting to price if undefined
    // and discount defaulting to 0 if undefined
    const productWithDiscountedPrice = {
      ...product,
      discountedPrice: product.discountedPrice || product.price,
      discount: product.discount || 0
    };
    
    addToCart(productWithDiscountedPrice, quantity);
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

  // Update handleSort function to match BuyPage.tsx
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

  // Update getSortDisplayText function to match BuyPage.tsx
  const getSortDisplayText = () => {
    const map: Record<string, string> = {
      price: "Price",
      title: "Name",
      category: "Category",
      created_at: "Date Added",
    };

    const field = map[sortBy] || sortBy;
    const order = sortOrder === "asc" ? "Low to High" : "High to Low";

    return `${field}: ${order}`;
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
        <h2 className="text-3xl font-semibold text-center mb-8">Chairs</h2>

        {/* Sort and Filter Section */}
        <div className="flex justify-between items-center mt-6 mb-8 px-6">
          <div>
            <h2 className="text-2xl font-sans text-gray-800 section-title">Chairs Collection</h2>
            <p className="text-sm text-gray-600 mt-1">Comfort and style for your space</p>
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              {/* Filter icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 01-3 0m3 0a1.5 1.5 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 01-3 0m3 0a1.5 1.5 00-3 0m-9.75 0h9.75" />
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
                    { id: "price", label: "Price", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0118 0z" },
                    { id: "title", label: "Name", icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" },
                    { id: "created_at", label: "Newest", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 012.25-2.25h13.5A2.25 2.25 0121 7.5v11.25m-18 0A2.25 2.25 005.25 21h13.5A2.25 2.25 0021 18.75m-18 0v-7.5A2.25 2.25 005.25 9h13.5A2.25 2.25 0021 11.25v7.5" },
                    { id: "title", label: "Title", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 012.25-2.25h13.5A2.25 2.25 0121 7.5v11.25m-18 0A2.25 2.25 005.25 21h13.5A2.25 2.25 0021 18.75m-18 0v-7.5A2.25 2.25 005.25 9h13.5A2.25 2.25 0021 11.25v7.5" }
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
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 010 1.414l-8 8a1 1 01-1.414 0l-4-4a1 1 011.414-1.414L8 12.586l7.293-7.293a1 1 011.414 0z" clipRule="evenodd" />
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8">
          {products.map((product, index) => (
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
                  className={`absolute top-3 right-3 text-xl transition-all p-2 bg-white rounded-full shadow-md ${
                    isProductInWishlist(product._id) 
                    ? 'text-red-600 transform rotate-12 scale-110' 
                    : 'text-gray-400 hover:text-red-500 hover:scale-110'
                  }`}
                  aria-label="Wishlist"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWishlist(product);
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
                    <div className="text-xl font-bold text-gray-900">${product.price}</div>
                    {product.condition && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {product.condition}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showProductPreview(product);
                    }}
                    className="w-full py-2.5 px-4 bg-yellow-400 text-gray-900 rounded-lg font-medium hover:bg-yellow-500 transition-all transform hover:scale-105 focus:ring-2 focus:ring-yellow-300 flex items-center justify-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 000-2H6.414l1-1H14a1 1 00.894-.553l3-6A1 1 0017 3H6.28l-.31-1.243A1 1 005 1H3z" />
                    </svg>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .card-hover {
            transition: all 0.3s ease;
          }
          
          .card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>

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
                  className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 011.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd" />
                  </svg>
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
                  <div className="text-2xl font-bold text-gray-900">${(parseFloat(previewProduct.price) * quantity).toFixed(2)}</div>
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
                    <path d="M3 1a1 1 000 2h1.22l.305 1.222a.997.997 000 .042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 000-2H6.414l1-1H14a1 1 00.894-.553l3-6A1 1 0017 3H6.28l-.31-1.243A1 1 005 1H3z" />
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
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm"
               onClick={closeLoginPopup}
               style={{animation: 'fadeIn 0.3s ease-out'}}>
            <div 
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{animation: 'fadeSlideUp 0.4s ease-out'}}
            >
              <div className="text-center mb-6">
                <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0116 0 8 8 0116 0zm-7-4a1 1 112 0 1 1 012 0zM9 9a1 1 000 2v3a1 1 001 1h1a1 1 100-2v-3a1 1 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
                <p className="text-gray-600 mt-2">Please log in to add items to your cart or wishlist.</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="py-3 px-8 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all transform hover:scale-105 shadow-md"
                >
                  Go to Login
                </button>
              </div>
              <button
                onClick={closeLoginPopup}
                className="mt-4 text-gray-500 hover:text-gray-700 text-sm text-center w-full"
              >
                Cancel
              </button>
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
            disabled={page >= totalPages} >
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

export default ChairsPage;