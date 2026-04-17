import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import MainHeader from "../../components/user/MainHeader";
import MainFooter from "../../components/user/MainFooter";
import { useCart } from "./pro/cart/CartContext";
import { FiHeart, FiShare2, FiMinus, FiPlus, FiPackage, FiTruck, FiInfo, FiShield, FiCalendar, FiX } from "react-icons/fi";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaCommentSlash, FaFacebook, FaLinkedin,  FaPinterest, FaRegStar, FaStar, FaTwitter, FaUser, FaSearch, FaWhatsapp, FaEnvelope, FaCopy, FaLink } from "react-icons/fa";

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
  discount?: number; // Added for discount percentage
  discountedPrice?: string; // Added for calculated discounted price
  discountedRentPrice?: string; // Added for calculated discounted rent price
}

// Updated Review interface to match backend field names with fallbacks
interface Review {
  _id: string;
  productId?: string;
  productid?: string; // Field name in backend
  userId?: string;
  userid?: string; // Field name in backend
  userName?: string;
  rating: number;
  comment?: string;
  review?: string; // Field name in backend
  createdAt?: string;
  created_at?: string; // Field name in backend
}

const ViewProduct: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track current image for carousel
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  
  // Add back the cart popup related state variables
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [cartProduct, setCartProduct] = useState<Product | null>(null);

  // New state variables for reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  // New state variables for image zooming and interaction
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel] = useState(2.5); // Default zoom level
  
  // Refs for image container
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);

  // Add state for collapsed sections
  const [expandedSection, setExpandedSection] = useState<string | null>("specs");

  // Add state for share popup
  const [showSharePopup, setShowSharePopup] = useState(false);

  // Add state for popup quantity
  const [popupQuantity, setPopupQuantity] = useState(1);

  // Add state to store user names
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (location.state && location.state.product) {
      setProduct(location.state.product);
      setLoading(false);
    } else {
      const fetchProduct = async () => {
        try {
          const response = await fetch(
            `http://127.0.0.1:10007/api/v1/furniture/get/${productId}?is_for_sale=true&is_for_rent=true`
          );
          if (!response.ok) throw new Error("Failed to fetch product details");

          const data = await response.json();
          if (data?.data) {
            setProduct(data.data);
          } else {
            setError("Product not found.");
          }
        } catch (err) {
          setError("Error fetching product details.");
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [productId, location.state]);

  useEffect(() => {
    if (product) {
      const fetchRelatedProducts = async () => {
        try {
          console.log("Fetching related products for category:", product.category);
          
          let headersList = {
            "Content-Type": "application/json"
          };
          
          // Use the category as search parameter to find related products
          let bodyContent = JSON.stringify({
            "page": 1,
            "page_size": 10,
            "sort_by": "category",
            "sort_order": "asc",
            "search": product.category, // Using product category as search term
            "title": ""
          });
          
          let response = await fetch("http://127.0.0.1:10007/api/v1/furniture/list_all", { 
            method: "POST",
            body: bodyContent,
            headers: headersList
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
          }
          
          let data = await response.json();
          console.log("API response for related products:", data);
          
          if (data?.data && Array.isArray(data.data)) {
            // Filter out the current product from related products
            const filteredProducts = data.data.filter((p: Product) => {
              // Filter based on the current product's is_for_rent and is_for_sale properties
              const matchesSaleStatus = product.is_for_sale === p.is_for_sale;
              const matchesRentStatus = product.is_for_rent === p.is_for_rent;
              
              // Only include products with the same rental/sale status as the current product
              // and exclude the current product itself
              return p._id !== product._id && (matchesSaleStatus || matchesRentStatus);
            });
            
            console.log(`Found ${filteredProducts.length} related products with matching status and category: ${product.category}`);
            
            if (filteredProducts.length > 0) {
              setRelatedProducts(filteredProducts);
            } else {
              // If no products found with exact category and status match, try a broader search
              console.log("No exact matches found, trying broader search");
              
              // Try with partial category match but maintaining the same sale/rent status
              let broadSearchBody = JSON.stringify({
                "page": 1,
                "page_size": 10,
                "sort_by": "category",
                "sort_order": "asc",
                "search": "", // Empty search to get all products
                "title": ""
              });
              
              let broadResponse = await fetch("http://127.0.0.1:10007/api/v1/furniture/list_all", { 
                method: "POST",
                body: broadSearchBody,
                headers: headersList
              });
              
              if (broadResponse.ok) {
                let broadData = await broadResponse.json();
                
                // Find products with similar categories but matching rent/sale status
                if (broadData?.data && Array.isArray(broadData.data)) {
                  const similarProducts = broadData.data.filter((p: Product) => {
                    // Match rental/sale status first
                    const matchesSaleStatus = product.is_for_sale === p.is_for_sale;
                    const matchesRentStatus = product.is_for_rent === p.is_for_rent;
                    
                    // Then look for category similarity
                    const isSimilarCategory = p.category && 
                      product.category &&
                      (p.category.toLowerCase().includes(product.category.toLowerCase().split(' ')[0]) || 
                       product.category.toLowerCase().includes(p.category.toLowerCase().split(' ')[0]));
                    
                    return p._id !== product._id && 
                           (matchesSaleStatus || matchesRentStatus) && 
                           isSimilarCategory;
                  });
                  
                  if (similarProducts.length > 0) {
                    console.log(`Found ${similarProducts.length} similar products with matching status`);
                    setRelatedProducts(similarProducts.slice(0, 6)); // Limit to 6 similar products
                  } else {
                    // Last resort: Just show other products with the same sale/rent status
                    const statusMatchProducts = broadData.data.filter((p: Product) => {
                      const matchesSaleStatus = product.is_for_sale === p.is_for_sale;
                      const matchesRentStatus = product.is_for_rent === p.is_for_rent;
                      
                      return p._id !== product._id && (matchesSaleStatus || matchesRentStatus);
                    }).slice(0, 4);
                    
                    console.log(`Using ${statusMatchProducts.length} products with matching status as fallback`);
                    setRelatedProducts(statusMatchProducts);
                  }
                }
              }
            }
          } else {
            console.log("No product data found in response");
            setRelatedProducts([]);
          }
        } catch (err) {
          console.error("Error fetching related products:", err);
          setRelatedProducts([]);
        }
      };
      
      fetchRelatedProducts();
    }
  }, [product]);

  useEffect(() => {
    const userId = localStorage.getItem("token");
    if (userId) {
      const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${userId}`) || "[]");
      setWishlist(storedWishlist);
    }
  }, []);

  // Updated fetchReviews function with Thunder Client headers
  const fetchReviews = async () => {
    if (!productId) return;
    
    try {
      let headersList = {
        "Accept": "/",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Content-Type": "application/json"
      };

      console.log(`Fetching reviews for product ID: ${productId}`);
      let response = await fetch(`http://localhost:10007/api/v1/review/get/${productId}`, { 
        method: "GET",
        headers: headersList
      });

      if (!response.ok) {
        console.error("Failed to fetch reviews:", response.status, response.statusText);
        setReviews([]);
        setAverageRating(0);
        return;
      }
      
      const data = await response.json();
      console.log("Reviews data received:", data);
      
      if (data?.data && Array.isArray(data.data)) {
        setReviews(data.data);
        
        // Calculate average rating if reviews exist
        if (data.data.length > 0) {
          const totalRating = data.data.reduce((sum: number, review: Review) => sum + review.rating, 0);
          setAverageRating(totalRating / data.data.length);
          
          // Extract unique user IDs to fetch their details
          const userIds = data.data
            .map((review: Review) => review.userId || review.userid)
            .filter((id: string | undefined) => id && id !== "Anonymous" && id !== "unknown");
          
          // Remove duplicates
          const uniqueUserIds = [...new Set(userIds)];
          console.log("Unique user IDs to fetch:", uniqueUserIds);
          
          // Fetch user details for each unique user ID
          if (uniqueUserIds.length > 0) {
            await fetchUserNames(uniqueUserIds as string[]);
          } else {
            console.log("No valid user IDs found in reviews");
          }
        } else {
          setAverageRating(0);
        }
      } else {
        console.log("No reviews found in response data");
        setReviews([]);
        setAverageRating(0);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
      setAverageRating(0);
    }
  };

  // Updated fetchUserNames function with Thunder Client headers
  const fetchUserNames = async (userIds: string[]) => {
    try {
      const userNameMap: Record<string, string> = {};
      
      console.log(`Attempting to fetch details for ${userIds.length} users`);
      
      // Fetch each user's details
      for (const userId of userIds) {
        if (!userId) {
          console.log("Skipping empty user ID");
          continue;
        }
        
        let headersList = {
          "Accept": "/",
          "User-Agent": "Thunder Client (https://www.thunderclient.com)"
        };
        
        try {
          console.log(`Fetching user data for ID: ${userId}`);
          let response = await fetch(`http://127.0.0.1:10007/api/v1/auth/user/fetch/${userId}`, { 
            method: "GET",
            headers: headersList
          });
          
          if (response.ok) {
            const userData = await response.json();
            console.log(`User data for ${userId}:`, userData);
            
            if (userData && userData.data) {
              // Create full name from first and last name if available
              let fullName = '';
              
              if (userData.data.first_name && userData.data.last_name) {
                fullName = `${userData.data.first_name} ${userData.data.last_name}`;
              } else if (userData.data.first_name) {
                fullName = userData.data.first_name;
              } else if (userData.data.username) {
                fullName = userData.data.username;
              } else if (userData.data.name) {
                fullName = userData.data.name;
              } else if (userData.data.email) {
                // If no name is available, use part of the email
                const emailName = userData.data.email.split('@')[0];
                fullName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
              } else {
                fullName = `User ${userId.substring(0, 5)}...`;
              }
              
              // Store the user's name with their ID as the key
              userNameMap[userId] = fullName;
              console.log(`Successfully mapped user ${userId} to name: ${fullName}`);
            } else {
              console.log(`User data structure unexpected for ID: ${userId}`);
              userNameMap[userId] = `User ${userId.substring(0, 5)}...`;
            }
          } else {
            console.error(`Failed to fetch user data for ID: ${userId}. Status: ${response.status}`);
            userNameMap[userId] = `User ${userId.substring(0, 5)}...`;
          }
        } catch (userError) {
          console.error(`Error fetching user data for ID ${userId}:`, userError);
          userNameMap[userId] = `User ${userId.substring(0, 5)}...`;
        }
      }
      
      // Update state with all fetched usernames
      console.log("Setting user names state with:", userNameMap);
      setUserNames(userNameMap);
      
    } catch (err) {
      console.error("Error in fetchUserNames:", err);
    }
  };

  // Improved helper function to get username for a review
  const getUserNameForReview = (review: Review): string => {
    const userId = review.userId || review.userid;
    
    // First try to use the fetched username from the API
    if (userId && userNames[userId]) {
      return userNames[userId];
    }
    
    // Fallback options if API data isn't available
    if (review.userName) {
      return review.userName;
    }
    
    if (userId) {
      return `User ${userId.substring(0, 5)}...`;
    }
    
    return "Anonymous User";
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

    // Add missing properties required by the addToCart function
    // const enhancedProduct = {
    //   ...product,
    //   discountedPrice: product.price, // Default to regular price
    //   discount: "0"                   // Default to no discount
    // };

    // Set cart product, popup quantity, and show popup instead of alert
    setCartProduct(product);
    setPopupQuantity(quantity); // Initialize popup quantity with selected quantity
    setShowCartPopup(true);
    
    // Auto-hide the popup after 3 seconds
    setTimeout(() => {
      setShowCartPopup(false);
    }, 3000);
  };

  // Add popup-specific increase/decrease functions
  const increasePopupQuantity = () => {
    setPopupQuantity(popupQuantity + 1);
  };

  const decreasePopupQuantity = () => {
    if (popupQuantity > 1) {
      setPopupQuantity(popupQuantity - 1);
    }
  };

  // Function to actually add the product to cart with popup quantity
  const confirmAddToCart = (product: Product) => {
    if (!product) return;
    
    // Add missing properties required by the addToCart function
    const enhancedProduct = {
      ...product,
      discountedPrice: product.price, // Default to regular price
      discount: "0"                   // Default to no discount
    };
    
    addToCart(enhancedProduct as any, popupQuantity);
    setShowCartPopup(false);
    
    // Show confirmation toast or notification if desired
  };

  // Add back the closeCartPopup function
  const closeCartPopup = () => {
    setShowCartPopup(false);
  };

  const nextImage = () => {
    if (product?.images?.length) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images?.length) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleRelatedProductClick = (relatedProduct: Product) => {
    navigate(`/view-product/${relatedProduct._id}`, { state: { product: relatedProduct } });
  };

  const handleAddToWishlist = (product: Product) => {
    const userId = localStorage.getItem("token");
    if (!userId) {
      setShowLoginPopup(true);
      return;
    }

    // Calculate discounted prices before adding to wishlist
    const enhancedProduct = { ...product };
    
    // Calculate discounted sale price if applicable
    if (product.is_for_sale && product.discount && product.discount > 0) {
      const discountedPrice = (parseFloat(product.price) * (1 - product.discount/100)).toFixed(2);
      enhancedProduct.discountedPrice = discountedPrice;
    }
    
    // Calculate discounted rent price if applicable
    if (product.is_for_rent && product.discount && product.discount > 0) {
      const discountedRentPrice = (parseFloat(product.rent_price) * (1 - product.discount/100)).toFixed(2);
      enhancedProduct.discountedRentPrice = discountedRentPrice;
    }

    const isInWishlist = wishlist.some(item => item._id === product._id);
    let updatedWishlist;

    if (isInWishlist) {
      updatedWishlist = wishlist.filter(item => item._id !== product._id);
      alert("Removed from wishlist!");
    } else {
      updatedWishlist = [...wishlist, enhancedProduct];
      alert("Added to wishlist!");
    }

    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(updatedWishlist));
  };

  const isProductInWishlist = (productId: string) => {
    return wishlist.some(product => product._id === productId);
  };

  const closeLoginPopup = () => {
    setShowLoginPopup(false);
    navigate('/login');
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Load reviews when product loads
  useEffect(() => {
    if (product && productId) {
      fetchReviews();
    }
  }, [product, productId]);

  // Handle mouse move for zoom effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !isZoomed) return;
    
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    
    // Calculate relative position of mouse in the container (0 to 1 values)
    const x = Math.max(0, Math.min(1, (e.clientX - left) / width));
    const y = Math.max(0, Math.min(1, (e.clientY - top) / height));
    
    setZoomPosition({ x, y });
  };

  // Toggle zoom state
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    if (index === currentImageIndex) return;
    setCurrentImageIndex(index);
  };

  // Reset zoom when changing images
  useEffect(() => {
    setIsZoomed(false);
  }, [currentImageIndex]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Toggle share popup
  const toggleSharePopup = () => {
    setShowSharePopup(!showSharePopup);
  };

  // Handle sharing on different platforms
  const handleShare = (platform: string) => {
    // Create the product URL
    const productUrl = window.location.href;
    const productTitle = product?.category || 'Furniture Product';
    const productDescription = product?.description || 'Check out this great furniture item!';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productTitle)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(productUrl)}&title=${encodeURIComponent(productTitle)}`;
        break;
      case 'pinterest':
        const imageUrl = product?.images && product.images.length > 0 
          ? product.images[0].startsWith('http') 
            ? product.images[0] 
            : `http://127.0.0.1:10007/${product.images[0]}`
          : '';
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(productDescription)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(productTitle + ' - ' + productUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(productTitle)}&body=${encodeURIComponent(productDescription + '\n\n' + productUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(productUrl)
          .then(() => {
            alert('Link copied to clipboard!');
          })
          .catch(err => {
            console.error('Failed to copy: ', err);
          });
        break;
      default:
        break;
    }
    
    // Open share URL in new window for external platforms
    if (shareUrl && platform !== 'copy' && platform !== 'email') {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    } else if (platform === 'email') {
      window.location.href = shareUrl;
    }
    
    // Close popup after sharing
    if (platform === 'copy') {
      setTimeout(() => setShowSharePopup(false), 1500);
    } else {
      setShowSharePopup(false);
    }
  };

  if (loading) return <div className="text-center text-lg text-gray-600 mt-10">Loading...</div>;
  if (error) return <div className="text-center text-lg text-red-500 mt-10">{error}</div>;

  return (
    <>
      <MainHeader logoText="Furniture Store" onSearch={(query) => console.log(query)} />
      <div className="min-h-screen bg-gray-100 py-28 px-6">
      <div className="flex flex-col md:flex-row items-start justify-center bg-white shadow-md rounded-lg p-6 gap-10">
      
      {/* Enhanced Image Section with Zoom */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
        <div 
          ref={imageContainerRef}
          className={`relative w-full h-[400px] overflow-hidden rounded-lg cursor-zoom-in ${isZoomed ? 'cursor-zoom-out' : ''}`}
          onClick={toggleZoom}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isZoomed && setIsZoomed(false)}
          style={{ transition: 'all 0.3s ease-in-out' }}
        >
          
          {product?.images?.length ? (
            <>
              <img
                ref={mainImageRef}
                src={product.images[currentImageIndex].startsWith('http') 
                  ? product.images[currentImageIndex] 
                  : `http://127.0.0.1:10007/${product.images[currentImageIndex]}`
                }
                alt={product?.title}
                className={`w-full h-full object-contain ${isZoomed ? 'invisible' : 'visible'}`}
                style={{ 
                  objectFit: 'contain',
                  transition: 'all 0.3s ease'
                }}
              />
              
              {/* Zoomed version of the image */}
              {isZoomed && (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ 
                    backgroundImage: `url(${product.images[currentImageIndex].startsWith('http') 
                      ? product.images[currentImageIndex] 
                      : `http://127.0.0.1:10007/${product.images[currentImageIndex]}`})`,
                    backgroundPosition: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
                    backgroundSize: `${zoomLevel * 100}%`,
                    backgroundRepeat: 'no-repeat',
                    transition: 'background-position 0.1s ease-out'
                  }}
                >
                  <div className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full">
                    <FaSearch size={16} />
                  </div>
                </div>
              )}
              
              {/* Left Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-20"
              >
                <FaChevronLeft size={20} />
              </button>
              
              {/* Right Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-20"
              >
                <FaChevronRight size={20} />
              </button>
            </>
          ) : (
            <img
              src={product?.image}
              alt={product?.title}
              className="w-full h-full object-cover rounded-lg"
            />
          )}
        </div>
        
        {/* Thumbnail Strip - Simplified without loading states */}
        {product?.images && Array.isArray(product.images) && product.images.length > 1 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {product.images.map((image, index) => (
              <div 
                key={index}
                className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer
                  ${currentImageIndex === index ? 'border-teal-500 shadow-md scale-110' : 'border-gray-200 hover:border-teal-300'}`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img 
                  src={image.startsWith('http') ? image : `http://127.0.0.1:10007/${image}`}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Improved Product Details Section */}
      <div className="w-full md:w-1/2 flex flex-col">
        {/* Product Status Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {product?.availability_status === "Available" && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              In Stock
            </span>
          )}
          {product?.availability_status === "Limited" && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Limited Stock
            </span>
          )}
          {product?.availability_status === "Out of Stock" && (
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              Out of Stock
            </span>
          )}
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {product?.condition}
          </span>
        </div>
        
        {/* Title and Share */}
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-extrabold text-gray-900">{product?.category}</h1>
          <button 
            className="text-gray-500 hover:text-teal-600 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
            onClick={toggleSharePopup}
          >
            <FiShare2 size={20} />
          </button>
        </div>
        
        {/* Subcategory/model */}
        <h2 className="text-xl text-gray-600 mt-1">{product?.title}</h2>
        
        {/* Description */}
        <div className="mt-4 text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-teal-500">
          <p>{product?.description}</p>
        </div>
        
        {/* Pricing Section */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          {product?.is_for_sale && (
            <div className="flex items-center">
              {product.discount && product.discount > 0 ? (
                <div className="flex flex-col">
                  <div className="text-2xl font-bold text-green-600">
                    ${product.discountedPrice || (parseFloat(product.price) * (1 - product.discount/100)).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    ${product.price}
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-gray-900">${product.price}</div>
              )}
              <div className="ml-3 px-2 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded">
                For Sale
              </div>
              {product.discount && product.discount > 0 && (
                <div className="ml-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                  {product.discount}% OFF
                </div>
              )}
            </div>
          )}
          {product?.is_for_rent && (
            <div className="flex items-center mt-2">
              {product.discount && product.discount > 0 ? (
                <div className="flex flex-col">
                  <div className="text-2xl font-bold text-green-600">
                    ${product.discountedRentPrice || (parseFloat(product.rent_price) * (1 - product.discount/100)).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    ${product.rent_price}
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-gray-900">${product.rent_price}</div>
              )}
              <div className="text-lg text-gray-600 ml-1">/day</div>
              <div className="ml-3 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                For Rent
              </div>
              {product.discount && product.discount > 0 && (
                <div className="ml-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full animate-pulse">
                  {product.discount}% OFF
                </div>
              )}
            </div>
          )}
          
          {/* Delivery & Return Policy Preview */}
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex items-center text-gray-600">
              <FiTruck className="mr-2 text-teal-600" /> Free delivery in your area
            </div>
            <div className="flex items-center text-gray-600">
              <FiPackage className="mr-2 text-teal-600" /> 30-day return policy
            </div>
          </div>
        </div>
        
        {/* Collapsible Information Sections */}
        <div className="mt-6 border border-gray-200 rounded-lg divide-y">
          {/* Specifications Section */}
          <div className="overflow-hidden">
            <button 
              className="flex justify-between items-center w-full p-4 text-left font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 transition-all"
              onClick={() => toggleSection("specs")}
            >
              <div className="flex items-center">
                <FiInfo className="mr-2" /> Specifications
              </div>
              <span>{expandedSection === "specs" ? "−" : "+"}</span>
            </button>
            
            {expandedSection === "specs" && (
              <div className="p-4 text-sm text-gray-600 bg-white">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-2">Dimensions:</span>
                    <span>{product?.dimensions || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-2">Location:</span>
                    <span>{product?.location || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-2">Condition:</span>
                    <span>{product?.condition || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-2">Availability:</span>
                    <span>{product?.availability_status || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Seller Information */}
          <div className="overflow-hidden">
            <button 
              className="flex justify-between items-center w-full p-4 text-left font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 transition-all"
              onClick={() => toggleSection("seller")}
            >
              <div className="flex items-center">
                <FaUser className="mr-2" /> Seller Information
              </div>
              <span>{expandedSection === "seller" ? "−" : "+"}</span>
            </button>
            
            {expandedSection === "seller" && (
              <div className="p-4 text-sm text-gray-600 bg-white">
                <div className="flex items-center mb-2">
                  <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold mr-3">
                    {product?.created_by?.charAt(0) || "S"}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{product?.created_by || "Seller"}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <FiCalendar className="mr-1" /> Joined: {product?.created_at ? new Date(product.created_at).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  Contact the seller for more information about this product.
                </div>
              </div>
            )}
          </div>
          
          {/* Warranty & Returns */}
          <div className="overflow-hidden">
            <button 
              className="flex justify-between items-center w-full p-4 text-left font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 transition-all"
              onClick={() => toggleSection("warranty")}
            >
              <div className="flex items-center">
                <FiShield className="mr-2" /> Warranty & Returns
              </div>
              <span>{expandedSection === "warranty" ? "−" : "+"}</span>
            </button>
            
            {expandedSection === "warranty" && (
              <div className="p-4 text-sm text-gray-600 bg-white">
                <ul className="list-disc list-inside space-y-1">
                  <li>30-day return policy on unused items</li>
                  <li>6-month warranty on manufacturer defects</li>
                  <li>Contact customer service for warranty claims</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Purchase Actions */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          {/* Improved Quantity Selector */}
          <div className="flex items-center mb-4">
            <label className="text-gray-700 font-medium mr-4">Quantity:</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button 
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className={`p-2 ${quantity <= 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                <FiMinus size={16} />
              </button>
              <input
                type="number"
                value={quantity}
                min={1}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-12 p-2 text-center focus:outline-none border-x border-gray-300"
              />
              <button 
                onClick={increaseQuantity}
                className="p-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleAddToCart(product!, quantity)}
              className="flex-1 py-3 px-4 bg-yellow-500 text-gray-900 font-semibold rounded-lg shadow-sm hover:bg-yellow-600 transition-all flex items-center justify-center gap-2"
            >
              <FiPackage size={18} /> Add to Cart
            </button>
            
            <button
              onClick={() => handleAddToWishlist(product!)}
              className={`flex-1 py-3 px-4 font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2
                ${isProductInWishlist(product?._id || '') 
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}
            >
              <FiHeart size={18} className={isProductInWishlist(product?._id || '') ? 'fill-current' : ''} /> 
              {isProductInWishlist(product?._id || '') ? 'Saved' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Enhanced Review Section */}
      <div className="mt-10 bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Customer Reviews</h2>
        
        {/* Enhanced Average Rating Display */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <span className="text-4xl font-bold text-gray-900 mr-2">{averageRating.toFixed(1)}</span>
              <div className="flex flex-col">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-xl">
                      {star <= Math.round(averageRating) ? (
                        <FaStar className="text-yellow-400" />
                      ) : (
                        <FaRegStar className="text-gray-300" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <span className="ml-2 text-sm text-gray-500">
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>
        
        {/* Enhanced review display section with better styling */}
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all">
                {/* Rating and date line */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className="flex text-lg">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="mr-1">
                          {star <= review.rating ? (
                            <FaStar className="text-yellow-400" />
                          ) : (
                            <FaRegStar className="text-gray-300" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    {new Date(review.createdAt || review.created_at || new Date().toISOString()).toLocaleDateString()}
                  </span>
                </div>
                
                {/* User info and comment */}
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-lg mr-3 shadow-sm">
                    {(getUserNameForReview(review).charAt(0) || "U").toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 mb-2">
                      {getUserNameForReview(review)}
                    </p>
                    <div className="bg-gray-50 p-3 rounded-md border-l-3 border-teal-400">
                      <p className="text-gray-700 text-sm">
                        {review.comment || review.review || "No comment provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <FaCommentSlash className="mx-auto text-4xl text-gray-300 mb-2" />
              <p className="text-gray-500 italic">No reviews yet for this product.</p>
            </div>
          )}
        </div>

        {/* Related Products Section - Enhanced heading to show filtering criteria */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">You May Also Like</h3>
            <p className="text-sm text-teal-600">
              {relatedProducts.length > 0 
                ? (product?.is_for_sale ? "More Products For Sale" : product?.is_for_rent ? "More Products For Rent" : "More Similar Products")
                : "Other Products You Might Like"}
            </p>
          </div>
          
          {/* Show category and rental/sale type information */}
          <div className="mb-2 text-sm font-medium text-gray-700 bg-teal-50 px-3 py-1 rounded-full inline-block">
            <span className="mr-1">
              {relatedProducts.length > 0 
                ? `Similar ${product?.category || "Products"} ${product?.is_for_sale ? "(For Sale)" : product?.is_for_rent ? "(For Rent)" : ""} (${relatedProducts.length})` 
                : "Browse Other Options"}
            </span>
          </div>
          
          {/* Horizontal scrollable related products */}
          <div className="relative">
            {relatedProducts.length > 3 && (
              <>
                <button 
                  onClick={(e) => {
                    const container = e.currentTarget.nextElementSibling as HTMLElement;
                    if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 text-gray-800 p-2 rounded-full shadow-md hover:bg-white transition-all"
                >
                  <FaChevronLeft />
                </button>
                <button 
                  onClick={(e) => {
                    const container = e.currentTarget.previousElementSibling?.previousElementSibling as HTMLElement;
                    if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 text-gray-800 p-2 rounded-full shadow-md hover:bg-white transition-all"
                >
                  <FaChevronRight />
                </button>
              </>
            )}
            
            <div className="flex overflow-x-auto pb-4 hide-scrollbar gap-4">
              {relatedProducts.length > 0 ? (
                relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 flex-shrink-0 w-64 h-full flex flex-col cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-md"
                    onClick={() => handleRelatedProductClick(relatedProduct)}
                  >
                    <div className="relative">
                      <img
                        src={relatedProduct.images && relatedProduct.images.length > 0 ? 
                          (relatedProduct.images[0].startsWith('http') ? 
                          relatedProduct.images[0] : 
                          `http://127.0.0.1:10007/${relatedProduct.images[0]}`) : 
                          relatedProduct.image}
                        alt={relatedProduct.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <button
                        className={`absolute top-2 right-2 text-xl transition-all p-1 m-1 bg-white rounded-full ${isProductInWishlist(relatedProduct._id) ? 'text-red-600' : 'text-gray-700 hover:text-teal-600'}`}
                        aria-label="Wishlist"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToWishlist(relatedProduct);
                        }}
                      >
                        <FiHeart size={16} className={isProductInWishlist(relatedProduct._id) ? 'fill-current' : ''} />
                      </button>
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product?.is_for_sale && relatedProduct.is_for_sale && (
                          <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded">For Sale</span>
                        )}
                        {product?.is_for_rent && relatedProduct.is_for_rent && (
                          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">For Rent</span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 flex-grow flex flex-col justify-between">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {relatedProduct.title || relatedProduct.category}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {relatedProduct.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-sm">
                          {product?.is_for_sale && relatedProduct.is_for_sale ? 
                            (relatedProduct.discount && relatedProduct.discount > 0 ?
                              `$${relatedProduct.discountedPrice || (parseFloat(relatedProduct.price) * (1 - relatedProduct.discount/100)).toFixed(2)}` :
                              `$${relatedProduct.price}`) : 
                            product?.is_for_rent && relatedProduct.is_for_rent ? 
                            (relatedProduct.discount && relatedProduct.discount > 0 ?
                              `$${relatedProduct.discountedRentPrice || (parseFloat(relatedProduct.rent_price) * (1 - relatedProduct.discount/100)).toFixed(2)}/day` :
                              `$${relatedProduct.rent_price}/day`) : 
                            ''}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(relatedProduct, 1);
                          }}
                          className="p-1.5 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-all"
                        >
                          <FiPackage size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic p-4">No other {product?.category || "products"} found in this category</p>
              )}
            </div>
          </div>
        </div>
      </div>
      

      {showLoginPopup && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
        <button onClick={closeLoginPopup} className="text-gray-500 hover:text-gray-700">X</button>
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

      {/* Share Popup */}
      {showSharePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Share This Product</h3>
              <button onClick={toggleSharePopup} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Share this product with your friends and network!
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <button 
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <FaFacebook size={24} className="text-blue-600 mb-1" />
                <span className="text-xs text-gray-700">Facebook</span>
              </button>
              
              <button 
                onClick={() => handleShare('twitter')}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <FaTwitter size={24} className="text-blue-400 mb-1" />
                <span className="text-xs text-gray-700">Twitter</span>
              </button>
              
              <button 
                onClick={() => handleShare('linkedin')}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <FaLinkedin size={24} className="text-blue-700 mb-1" />
                <span className="text-xs text-gray-700">LinkedIn</span>
              </button>
              
              <button 
                onClick={() => handleShare('pinterest')}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
              >
                <FaPinterest size={24} className="text-red-600 mb-1" />
                <span className="text-xs text-gray-700">Pinterest</span>
              </button>
              
              <button 
                onClick={() => handleShare('whatsapp')}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
              >
                <FaWhatsapp size={24} className="text-green-500 mb-1" />
                <span className="text-xs text-gray-700">WhatsApp</span>
              </button>
              
              <button 
                onClick={() => handleShare('email')}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <FaEnvelope size={24} className="text-gray-600 mb-1" />
                <span className="text-xs text-gray-700">Email</span>
              </button>
              
              <button 
                onClick={() => handleShare('copy')}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors col-span-2"
              >
                <FaLink size={24} className="text-gray-600 mb-1" />
                <span className="text-xs text-gray-700">Copy Link</span>
              </button>
            </div>
            
            <div className="flex justify-center">
              <div className="relative w-full">
                <input 
                  type="text" 
                  value={window.location.href}
                  readOnly
                  className="w-full p-2 pr-12 border border-gray-300 rounded bg-gray-50 text-sm"
                />
                <button 
                  onClick={() => handleShare('copy')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600"
                >
                  <FaCopy size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modified cart popup with all information left-aligned */}
      {showCartPopup && cartProduct && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-600">Item Added to Cart!</h3>
              <button onClick={closeCartPopup} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            
            {/* Image with object-cover for better presentation */}
            <div className="w-full h-48 rounded-md overflow-hidden mb-4">
              <img 
                src={cartProduct.images && cartProduct.images.length > 0 
                  ? (cartProduct.images[0].startsWith('http') 
                    ? cartProduct.images[0] 
                    : `http://127.0.0.1:10007/${cartProduct.images[0]}`)
                  : cartProduct.image}
                alt={cartProduct.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Product details with all information left-aligned */}
            <div className="w-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-800">{cartProduct.title || cartProduct.category}</h4>
                  <p className="text-sm text-green-600 font-semibold">
                    {cartProduct.is_for_sale 
                      ? (cartProduct.discount && cartProduct.discount > 0 
                        ? `$${((parseFloat(cartProduct.discountedPrice || (parseFloat(cartProduct.price) * (1 - cartProduct.discount/100)).toFixed(2))) * popupQuantity).toFixed(2)}` 
                        : `$${(parseFloat(cartProduct.price) * popupQuantity).toFixed(2)}`)
                      : cartProduct.is_for_rent 
                        ? (cartProduct.discount && cartProduct.discount > 0 
                          ? `$${((parseFloat(cartProduct.discountedRentPrice || (parseFloat(cartProduct.rent_price) * (1 - cartProduct.discount/100)).toFixed(2))) * popupQuantity).toFixed(2)}/day`
                          : `$${(parseFloat(cartProduct.rent_price) * popupQuantity).toFixed(2)}/day`)
                        : ''}
                  </p>
                </div>
                <div className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                  {cartProduct.is_for_sale ? 'For Sale' : cartProduct.is_for_rent ? 'For Rent' : ''}
                </div>
              </div>
              
              {/* Location on its own line */}
              <div className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Location:</span> 
                <span className="text-gray-700 ml-1">{cartProduct.location || "N/A"}</span>
              </div>
              
              {/* Product additional information - all left-aligned */}
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4">
                <div className="mb-2 text-left">
                  <span className="font-medium text-gray-700">Dimensions:</span>
                  <span className="ml-1 block mt-1">{cartProduct.dimensions || "N/A"}</span>
                </div>
                <div className="text-left">
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-xs mt-1 line-clamp-2">{cartProduct.description || "No description available."}</p>
                </div>
              </div>
              
              {/* Full width quantity controls */}
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-full">
                  <button 
                    onClick={decreasePopupQuantity}
                    disabled={popupQuantity <= 1}
                    className={`p-2 flex-none ${popupQuantity <= 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    <FiMinus size={16} />
                  </button>
                  <input
                    type="number"
                    value={popupQuantity}
                    min={1}
                    onChange={(e) => setPopupQuantity(parseInt(e.target.value) || 1)}
                    className="flex-grow p-2 text-center focus:outline-none border-x border-gray-300"
                  />
                  <button 
                    onClick={increasePopupQuantity}
                    className="p-2 flex-none bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Centered Add to Cart button */}
            <div className="flex justify-center">
              <button
                onClick={() => confirmAddToCart(cartProduct)}
                className="py-3 px-8 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all font-medium w-2/3">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <MainFooter />
    </>
  );
};

export default ViewProduct;