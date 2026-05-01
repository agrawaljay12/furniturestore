import React, { useState, useEffect } from "react";
import Header from "../../../components/guest/Header";
import Footer from "../../../components/guest/Footer";
import { useNavigate } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
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

interface Product {
  _id: string;
  title: string;
  price: number;
  image?: string;
  description: string;
  category: string;
  is_for_rent: boolean;
  rent_price: number;
  is_for_sale: boolean;
  condition: string;
  availability_status: string;
  dimensions: string;
  location: string;
  created_by: string;
  created_at: string;
  images: string[];
  status?: string; // Added status property
  quantity?: number;
  totalPrice?: string; // To hold the total price for each item
}

const Rent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // List all products
  
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // 12 cards per page
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("rent_price");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showSortOptions, setShowSortOptions] = useState(false); // Added for dropdown toggle

  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const sortRef = React.useRef<HTMLDivElement>(null); // Reference for click outside handling
  const [, setLoading] = useState(false);
  
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
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }

    setPage(1); 
    setShowSortOptions(false);
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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              page: page,
              limit: pageSize,
              sort_by: sortBy,
              order: sortOrder, 
              search: searchQuery,
              listing_type: "rent",
            }),
          }
        );

        const data = await response.json();

        console.log("API RESPONSE:", data); // 🔍 DEBUG

        if (data?.data) {
          setProducts(data.data);
          setTotalPages(data.pagination?.total_pages || 1);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, pageSize, sortBy, sortOrder, searchQuery]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1); // reset page
    }, 500);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    if (quantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    addToCart(product, quantity);
    alert("Added to cart!");
    closePreview();
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
    navigate('/guest-rent');
  };

  const handleProductClick = (product: Product) => {
    navigate(`/guest-view-product/${product._id}`, { state: { product } });
  };

  const handleAddToWishlist = (product: Product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    setWishlist((prev) => {
      if (prev.some(p => p._id === product._id)) return prev;
      return [...prev, product];
    });
  };

  const isProductInWishlist = (productId: string) => {
    return wishlist.some(product => product._id === productId);
  };

  const handleSearch = (query: string) => {
    setPage(1); // reset page
    setSearchQuery(query);
  };

  // slide
  const sliderImages = [
    "https://source.unsplash.com/featured/?furniture", // Random furniture image
    "https://source.unsplash.com/featured/?sofa",
    "https://source.unsplash.com/featured/?table",
    "https://source.unsplash.com/featured/?chair",
  ];
  
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Auto-slider effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % 4); // 4 slides in the main carousel
    }, 3000); // Change the slide every 3 seconds
    return () => clearInterval(interval);
  }, []);
  
  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderImages.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + sliderImages.length) % sliderImages.length);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header logotext="Furniture Store" onSearch={handleSearch} />
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


       <div className="p-10 bg-transparent mt-32">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-items-center ">
            {[
              { label: "Living Room", icon: couchImage, badge: "", badgeColor: "bg-yellow-400", link: "/guest-living" },
              { label: "Bedroom", icon: bedimage, badge: "", badgeColor: "bg-yellow-400", link: "/guest-bedroom" },
              { label: "Storage", icon: storeimage, badge: "", badgeColor: "", link: "/guest-storage" },
              { label: "Dining", icon: diningimage, badge: "", badgeColor: "", link: "/guest-dining" },
              { label: "Tables", icon: deskimage, badge: "", badgeColor: "", link: "/guest-table" },
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
              { label: "Chairs", icon: chairimage, badge: "", badgeColor: "", link: "/guest-chairs" },
              { label: "Best Deals", icon: dealimage, badge: "", badgeColor: "", link: "/guest-deals" },
              { label: "Mattress", icon: mattress, badge: "", badgeColor: "", link: "/guest-mattress" },
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

        {/* Image Slider Section */}
        <div className="relative w-full max-w-7xl mx-auto mt-16 overflow-hidden rounded-2xl shadow-2xl">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-teal-50 opacity-80"></div>
          
          {/* Auto-slide animation with right-to-left movement */}
          <div className="flex transition-all duration-700 ease-in-out h-[500px]"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {[
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80", // Modern living room furniture
              "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80", // Elegant sofa set
              "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1674&q=80", // Dining room set
              "https://images.unsplash.com/photo-1551298370-9d3d53740c72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80", // Bedroom furniture
            ].map((image, index) => (
              <div key={index} className="w-full flex-shrink-0 relative slide-animation">
                {/* Background Image with Parallax Effect and Right-to-Left Animation */}
                <div 
                  className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
                    currentSlide === index ? 'opacity-100 scale-110 animate-slowZoom slide-in-right' : 'opacity-0 scale-100 slide-out-left'
                  }`}
                  style={{ 
                    backgroundImage: `url(${image})`,
                    animation: currentSlide === index ? 'kenburns 20s ease-in-out infinite alternate' : 'none'
                  }}
                ></div>
                
                {/* Content Overlay with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent flex flex-col justify-center items-start text-white p-12 space-y-4">
                  <div className={`w-2/3 transition-all duration-700 ${
                    currentSlide === index ? 'slideInRightAnimation opacity-100' : 'translate-x-full opacity-0'
                  }`} style={{ transitionDelay: currentSlide === index ? '300ms' : '0ms' }}>
                    <span className={`inline-block bg-yellow-500 text-black font-bold px-3 py-1 rounded-full mb-4 transform -rotate-2 transition-all duration-700 ${
                      currentSlide === index ? 'slideInRightAnimation opacity-100' : 'translate-x-full opacity-0'
                    }`} style={{ transitionDelay: currentSlide === index ? '400ms' : '0ms' }}>
                      {index === 0 && "LIMITED TIME OFFER"}
                      {index === 1 && "EXCLUSIVE DEAL"}
                      {index === 2 && "NEW ARRIVALS"}
                      {index === 3 && "MEMBER SPECIAL"}
                    </span>
                    
                    <h2 className={`text-4xl font-extrabold tracking-tight leading-tight transition-all duration-700 ${
                      currentSlide === index ? 'slideInRightAnimation opacity-100' : 'translate-x-full opacity-0'
                    }`} style={{ transitionDelay: currentSlide === index ? '500ms' : '0ms' }}>
                      {index === 0 && "Transform Your Home with 50% Off All Furniture"}
                      {index === 1 && "Buy One, Get One Free on Premium Sofas"}
                      {index === 2 && "Artisan-Crafted Tables & Chairs Collection"}
                      {index === 3 && "Designer Furniture at Warehouse Prices"}
                    </h2>
                    
                    <p className={`mt-4 text-lg text-gray-200 max-w-md transition-all duration-700 ${
                      currentSlide === index ? 'slideInRightAnimation opacity-100' : 'translate-x-full opacity-0'
                    }`} style={{ transitionDelay: currentSlide === index ? '600ms' : '0ms' }}>
                      {index === 0 && "Elevate your living space with our curated selection of luxury furniture at unbeatable prices."}
                      {index === 1 && "Double your comfort with our BOGO offer on our most popular sofa designs."}
                      {index === 2 && "Handcrafted with premium materials to bring timeless elegance to your home."}
                      {index === 3 && "Experience luxury without the price tag - exclusive member discounts available now."}
                    </p>
                    
                    <button className={`mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transform transition-all duration-700 hover:scale-105 hover:shadow-lg flex items-center group ${
                      currentSlide === index ? 'slideInRightAnimation opacity-100' : 'translate-x-full opacity-0'
                    }`} style={{ transitionDelay: currentSlide === index ? '700ms' : '0ms' }}>
                      Shop Now
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Slide Indicators with Animation */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {[0, 1, 2, 3].map((index) => (
              <button 
                key={index} 
                onClick={() => setCurrentSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ease-out ${
                  currentSlide === index ? 'bg-yellow-500 w-10' : 'bg-white/50 hover:bg-white w-3'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Navigation Arrows with Animation */}
          <button
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/40 transition-all hover:scale-110 hover:shadow-lg"
            onClick={handlePrevSlide}
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/40 transition-all hover:scale-110 hover:shadow-lg"
            onClick={handleNextSlide}
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* CSS Keyframes for Ken Burns effect and slide animations */}
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes slideOutLeft {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
          }
          
          .slideInRightAnimation {
            animation: slideInRight 0.8s forwards ease-out; 
          }
          
          .slide-in-right {
            animation: slideInRight 0.8s forwards ease-out;
          }
          
          .slide-out-left {
            animation: slideOutLeft 0.8s forwards ease-out;
          }
          
          .slide-animation {
            transition: transform 0.7s ease-in-out;
          }
        `}</style>

      {/* icons */}
      <div className="min-h-screen bg-gray-50 px-8 pt-24 pb-16">
            <h2 className="text-3xl font-semibold text-center mb-8">RENT FURNITURE</h2>
        
        {/* Replace the old sorting UI with the new one */}
        {/* Sort and Filter Section */}
        <div className="flex justify-between items-center mt-12 px-6">
          <div>
            <h2 className="text-4xl font-sans text-gray-800 section-title">Deals of the day</h2>
            <p className="text-lg text-gray-600 mt-2">Our latest collection</p>
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
                    { id: "rent_price", label: "Price", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0118 0z" },
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
                           onClick={() => {
                              setSortOrder("asc");
                              setPage(1); // trigger API refresh
                            }}
                        >
                          Ascending
                        </button>
                        <button
                          className={`px-3 py-1.5 rounded text-sm ${sortOrder === "desc" ? "bg-yellow-100 text-yellow-800 font-medium" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          onClick={() => {
                            setSortOrder("desc");
                            setPage(1); // trigger API refresh
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
        
        {/* Add missing animation styles */}
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
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8 px-4">
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
                      const token = localStorage.getItem('token');
                      if (!token) {
                        setShowLoginPopup(true);
                        return;
                      }
                      showProductPreview(product);
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
          
          ${/* Merge with existing animation styles */ ''}
          @keyframes kenburns {
            from { transform: scale(1); }
            to { transform: scale(1.1); }
          }
          
          ${/* Keep existing keyframes */ ''}
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes slideOutLeft {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
          }
          
          .slideInRightAnimation {
            animation: slideInRight 0.8s forwards ease-out; 
          }
          
          .slide-in-right {
            animation: slideInRight 0.8s forwards ease-out;
          }
          
          .slide-out-left {
            animation: slideOutLeft 0.8s forwards ease-out;
          }
          
          .slide-animation {
            transition: transform 0.7s ease-in-out;
          }
        `}</style>

        {previewProduct && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{previewProduct.title}</h3>
          <button onClick={closePreview} className="text-gray-500 hover:text-gray-700">X</button>
              </div>
              <img
          src={previewProduct.images && previewProduct.images.length > 0 ? previewProduct.images[0] : previewProduct.image}
          alt={previewProduct.title}
          className="w-full h-64 object-cover mb-4"
              />
              <div className="mt-4 text-lg font-bold">${previewProduct.rent_price}/day</div>
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
            onClick={() => handleAddToCart(previewProduct, quantity)}
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

function useCart() {
  const addToCart = (product: Product, quantity: number) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingProductIndex = cart.findIndex((item: Product) => item._id === product._id);

    if (existingProductIndex >= 0) {
      cart[existingProductIndex].quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  };

  return { addToCart };
}

export default Rent;


