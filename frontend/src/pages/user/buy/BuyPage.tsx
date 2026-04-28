import React, { useState, useEffect } from "react";
import MainHeader from "../../../components/user/MainHeader";
import { useNavigate } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import MainFooter from "../../../components/user/MainFooter";
import { useCart } from "../pro/cart/CartContext";
import useActivityLogger from "../UserActivity"; // Import the logger
// icons
import couchImage from "../../../assets/couch.png"; // Import the image
import storeimage from "../../../assets/store.png";
import diningimage from "../../../assets/dining.png";
import chairimage from "../../../assets/chair.png";
import bedimage from "../../../assets/bed.png";
import mattress from "../../../assets/mattress.png";
import dealimage from "../../../assets/deal.png";
import deskimage from "../../../assets/desk.png";
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
  discountedPrice: string; // Required by CartContext
  discount: number; // Required by CartContext
  status: string; // To indicate the approval status of the product
}

const BuyPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // List all products
  // const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]); // Paginated products
  
  // state for pagination, sorting, and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // 12 cards per page
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showSortOptions, setShowSortOptions] = useState(false); // Added for dropdown toggle
  
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const logUserActivity = useActivityLogger(); // Initialize the logger
  const sortRef = React.useRef<HTMLDivElement>(null); // Reference for click outside handling
  
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
      price: "Price",
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
      const headersList = { "Content-Type": "application/json" };

      const bodyContent = JSON.stringify({
        page: page,
        limit: pageSize, // 🔥 IMPORTANT
        sort_by: sortBy,
        order: sortOrder,
        search: searchQuery,
        listing_type: "buy", // 🔥 IMPORTANT
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

    // Ensure product has required properties for CartContext
    const productWithRequiredProps = {
      ...product,
      discountedPrice: product.discountedPrice || product.price,
      discount: product.discount || 0
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
        <MainHeader
          logoText="Furniture Store"
          onSearch={(query) => {
            setSearchQuery(query);
            setPage(1);
          }}
        />
      </div>
      {/* icons */}
      <div className="min-h-screen bg-gray-50 px-8 pt-24 pb-16">
        <div className="flex justify-center items-center mb-6"> {/* Changed justify-between to justify-center */}
          <h2 className="text-3xl font-semibold text-center">BUY FURNITURE</h2>
          
        
          {/* Sort Dropdown */}
          {/* Removed Sort Dropdown from here */}
        </div>
        
        {/* Add animation for the dropdown to the existing style block */}
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
          
          /* New animations */
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          .card-hover {
            transition: all 0.3s ease;
          }
          
          .card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
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
          
          .shimmer-bg {
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out forwards;
          }
        `}</style>
        {/* Continue with rest of the component */}
        <div className="p-10 bg-transparent">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-items-center ">
            {[
              { label: "Living Room", icon: couchImage, badge: "", badgeColor: "bg-yellow-400", link: "/living" },
              { label: "Bedroom", icon: bedimage, badge: "", badgeColor: "bg-yellow-400", link: "/bedroom" },
              { label: "Storage", icon: storeimage, badge: "", badgeColor: "", link: "/storage" },
              { label: "Dining", icon: diningimage, badge: "", badgeColor: "", link: "/dining" },
              { label: "Tables", icon: deskimage, badge: "", badgeColor: "", link: "/tables" },
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
              { label: "Chairs", icon: chairimage, badge: "", badgeColor: "", link: "/chairs" },
              { label: "Best Deals", icon: dealimage, badge: "", badgeColor: "", link: "/best-deals" },
              { label: "Mattress", icon: mattress, badge: "", badgeColor: "", link: "/mattress" },
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
              
              <button 
          onClick={(e) => {
            e.stopPropagation();
            // Different navigation based on slide index
            if (index === 0) navigate("/best-deals");
            if (index === 1) navigate("/living");
            if (index === 2) navigate("/dining");
            if (index === 3) navigate("/bedroom");
          }}
          className={`mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transform transition-all duration-700 hover:scale-105 hover:shadow-lg flex items-center group ${
            currentSlide === index ? 'slideInRightAnimation opacity-100' : 'translate-x-full opacity-0'
          }`} 
          style={{ transitionDelay: currentSlide === index ? '700ms' : '0ms' }}
              >
          {index === 0 && "Shop Deals Now"}
          {index === 1 && "View Sofas"}
          {index === 2 && "Explore Dining"}
          {index === 3 && "Browse Bedroom"}
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
          onClick={() => {
            setCurrentSlide(index);
            // Add different page links for each indicator
            const pages = ["/best-deals", "/living", "/dining", "/bedroom"];
            navigate(pages[index]);
          }}
          className={`h-3 rounded-full transition-all duration-300 ease-out ${
            currentSlide === index ? 'bg-yellow-500 w-10' : 'bg-white/50 hover:bg-white w-3'
          }`}
          aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Navigation Arrows with Animation - Only for changing slides */}
          <button
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/40 transition-all hover:scale-110 hover:shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevSlide();
            }}
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/40 transition-all hover:scale-110 hover:shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              handleNextSlide();
            }}
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
          
          /* New animations */
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          
          .card-hover {
            transition: all 0.3s ease;
          }
          
          .card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
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
          
          .shimmer-bg {
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
          }
        `}</style>

        {/* Sort and Filter Section - Moved below slider */}
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 011-3 0m3 0a1.5 1.5 00-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 01-3 0m3 0a1.5 1.5 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 01-3 0m3 0a1.5 1.5 00-3 0m-9.75 0h9.75" />
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
            
        {
          [
            { id: "price", label: "Price", icon: "M12 8c..." },
            { id: "category", label: "Category", icon: "M3 7h18M3 12h18M3 17h18" }, // ✅ NEW
            { id: "title", label: "Name", icon: "M7.5 8.25h9..." },
            { id: "created_at", label: "Newest", icon: "M6.75 3v2.25..." }
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

        {/* Product Grid */}
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
                      <path d="M3 1a1 1 000 2h1.22l.305 1.222a.997.997 000 .042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 000-2H6.414l1-1H14a1 1 00.894-.553l3-6A1 1 0017 3H6.28l-.31-1.243A1 1 005 1H3z" />
                    </svg>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Products Section */}
        <div className="mt-20 mb-12">
          <div className="ml-6 text-left">
            <h2 className="text-4xl font-sans text-gray-800 section-title">Featured Products</h2>
            <p className="text-lg text-gray-600 mt-2">Handpicked by our experts</p>
          </div>
          
          <div className="mt-10 relative">
            <div className="overflow-x-auto py-4 px-6 hide-scrollbar">
              <div className="flex justify-center space-x-4">
                {products.slice(0, 5).map((product) => (
                  <div 
                    key={product._id}
                    className="flex-shrink-0 w-64 bg-white rounded-xl shadow-lg overflow-hidden card-hover"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative h-64">
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : product.image}
                        alt={product.category}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <h3 className="text-white font-bold text-lg">{product.title}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">${product.price}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToWishlist(product);
                          }}
                          className={`text-xl p-2 rounded-full ${isProductInWishlist(product._id) ? 'text-red-600' : 'text-gray-400 hover:text-red-500'}`}
                        >
                          <FiHeart />
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showProductPreview(product);
                        }}
                        className="mt-3 w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-all"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <style >{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
          </div>
        </div>

        {/* Enhanced Product Preview Modal */}
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

        {/* Enhanced Login Popup */}
        {showLoginPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm"
               onClick={closeLoginPopup}
               style={{animation: 'fadeIn 0.3s ease-out'}}>
            <div 
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{animation: 'fadeSlideUp 0.4s ease-out'}}
            >
              <div className="flex justify-end mb-2">
                <button
                  onClick={closeLoginPopup}
                  className="text-gray-500 hover:text-gray-700 font-bold text-xl px-3 py-1 rounded transition-colors"
                >
                  X
                </button>
              </div>
              <div className="text-center mb-6">
                <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 011-16 8 8 0116 0zm-7-4a1 1 11-2 0 1 1 012 0zM9 9a1 1 000 2v3a1 1 001 1h1a1 1 100-2v-3a1 1 00-1-1H9z" clipRule="evenodd" />
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

        {/* Original Pagination */}
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

export default BuyPage;