import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import MainHeader from "../../../components/user/MainHeader";
import MainFooter from "../../../components/user/MainFooter";
import { useCart } from "../pro/cart/CartContext";
import { 
  FaChevronLeft, FaChevronRight, FaStar, FaRegStar, 
  FaUser, FaCalendarAlt, FaSearch, FaFacebook, FaTwitter, FaLinkedin,
  FaPinterest, FaWhatsapp, FaEnvelope, FaCopy, FaLink, FaCommentSlash
} from "react-icons/fa";
import { 
  FiHeart, FiShare2, FiMinus, FiPlus, FiPackage, FiTruck, 
  FiInfo, FiCalendar, FiX 
} from "react-icons/fi";

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

// Add helper function to dynamically set OpenGraph meta tags for better sharing
const updateMetaTags = (product: Product | null) => {
  useEffect(() => {
    if (!product) return;
    
    // Get the product image URL
    const productImageUrl = product?.images && product.images.length > 0 
      ? (product.images[0].startsWith('http') 
          ? product.images[0] 
          : `http://127.0.0.1:10007/${product.images[0]}`)
      : (product?.image || '');
    
    // Helper function to create or update a meta tag
    const setMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    };
    
    // Set Open Graph meta tags
    setMetaTag('og:title', product.title || product.category);
    setMetaTag('og:description', product.description || '');
    setMetaTag('og:image', productImageUrl);
    setMetaTag('og:url', window.location.href);
    setMetaTag('og:type', 'product');
    
    // Set Twitter card meta tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', product.title || product.category);
    setMetaTag('twitter:description', product.description || '');
    setMetaTag('twitter:image', productImageUrl);
    
    // Clean up when component unmounts
    return () => {
      // Remove added meta tags
      const properties = [
        'og:title', 'og:description', 'og:image', 'og:url', 'og:type',
        'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'
      ];
      properties.forEach(property => {
        const tag = document.querySelector(`meta[property="${property}"]`);
        if (tag) tag.remove();
      });
    };
  }, [product]);
};

const ProductView: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, setCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("specs");
  const [discountedPrice, setDiscountedPrice] = useState<string | null>(null);
  
  // For image zoom functionality
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel] = useState(2.5);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (location.state && location.state.product) {
      setProduct(location.state.product);
      setLoading(false);
    } else {
      const fetchProduct = async () => {
        try {
          const response = await fetch(
            `http://127.0.0.1:10007/api/v1/furniture/get/${productId}`
          );
          if (!response.ok) throw new Error("Failed to fetch product details");

          const data = await response.json();
          if (data?.data) {
            setProduct(data.data);
            // Fetch related products based on category
            fetchRelatedProducts();
            // Fetch or mock reviews
            fetchReviews(data.data._id);
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
    if (product && product.discount && product.discount > 0) {
      if (product.is_for_sale) {
        const originalPrice = parseFloat(product.price);
        const calculatedDiscount = originalPrice * (product.discount / 100);
        const finalPrice = (originalPrice - calculatedDiscount).toFixed(2);
        setDiscountedPrice(finalPrice);
      } else if (product.is_for_rent) {
        const originalPrice = parseFloat(product.rent_price);
        const calculatedDiscount = originalPrice * (product.discount / 100);
        const finalPrice = (originalPrice - calculatedDiscount).toFixed(2);
        setDiscountedPrice(finalPrice);
      }
    } else {
      setDiscountedPrice(null);
    }
  }, [product]);

  // Replace fetchRelatedProducts with the implementation from ViewProduct
  const fetchRelatedProducts = async () => {
    if (!product) return;
    
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

  // Update useEffect for related products to call the new function
  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  const handleRemoveFromCart = (productId: string) => {
    const userId = localStorage.getItem("token");
    if (!userId) {
      setShowLoginPopup(true);
      return;
    }

    // Check if product exists in cart
    const productInCart = cart.find(item => item._id === productId);
    if (!productInCart) {
      alert("This product is not in your cart.");
      return;
    }

    const confirmRemove = window.confirm("Are you sure you want to remove this item from your cart?");
    if (confirmRemove) {
      try {
        // Filter out the product with the matching ID
        const updatedCart = cart.filter(item => item._id !== productId);
        setCart(updatedCart);
        
        // Update local storage
        localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
        
        // Show success message
        alert("Item successfully removed from cart!");
      } catch (error) {
        console.error("Error removing item from cart:", error);
        alert("Failed to remove item from cart. Please try again.");
      }
    }
  };

  const navigateToCart = () => {
    navigate("/cart");
  };

  const navigateToCheckout = () => {
    navigate("/checkout");
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Image navigation functions
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

  // New functions for image zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !isZoomed) return;
    
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    
    // Calculate relative position of mouse in the container (0 to 1 values)
    const x = Math.max(0, Math.min(1, (e.clientX - left) / width));
    const y = Math.max(0, Math.min(1, (e.clientY - top) / height));
    
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    if (index === currentImageIndex) return;
    setCurrentImageIndex(index);
    setIsZoomed(false);
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Wishlist functions
  const isProductInWishlist = (productId: string) => {
    return wishlist.some(product => product._id === productId);
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
      alert("Removed from wishlist!");
    } else {
      updatedWishlist = [...wishlist, product];
      alert("Added to wishlist!");
    }

    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(updatedWishlist));
  };

  // Share popup functions
  const toggleSharePopup = () => {
    setShowSharePopup(!showSharePopup);
  };

  // Call the helper function to update meta tags for sharing
  updateMetaTags(product);

  // Enhanced share function with better image and description support
  const handleShare = (platform: string) => {
    // Create the product URL
    const productUrl = window.location.href;
    const productTitle = product?.title || product?.category || 'Furniture Product';
    const productDescription = product?.description || 'Check out this great furniture item!';
    
    // Get the best available product image URL
    const productImageUrl = product?.images && product.images.length > 0 
      ? (product.images[0].startsWith('http') 
          ? product.images[0] 
          : `http://127.0.0.1:10007/${product.images[0]}`)
      : (product?.image || '');
    
    // Create price display
    const priceDisplay = product?.is_for_sale 
      ? `$${product.price}` 
      : product?.is_for_rent 
        ? `$${product.rent_price}/month` 
        : '';
    
    // Create formatted message with rich content
    const richMessage = `${productTitle}\n\n${productDescription}\n\n${priceDisplay ? `Price: ${priceDisplay}` : ''}\n\nView product: ${productUrl}`;
    
    // Create an HTML version for email (for better formatting)
    // const htmlMessage = `
    //   <html>
    //     <body>
    //       <h2>${productTitle}</h2>
    //       ${productImageUrl ? `<img src="${productImageUrl}" style="max-width: 300px; margin: 10px 0;" />` : ''}
    //       <p>${productDescription}</p>
    //       ${priceDisplay ? `<p><strong>Price: ${priceDisplay}</strong></p>` : ''}
    //       <p><a href="${productUrl}">View Product</a></p>
    //     </body>
    //   </html>
    // `;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        // Facebook uses Open Graph meta tags from the page
        shareUrl = `https://www.facebook.com/dialog/share?app_id=123456789&href=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(`Check out this ${productTitle}!`)}&display=popup`;
        break;
      case 'twitter':
        // Twitter with image hashtag to encourage image preview
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(`Check out "${productTitle}": ${productDescription.substring(0, 80)}${productDescription.length > 80 ? '...' : ''} #furniture`)}&via=furniturestore`;
        break;
      case 'linkedin':
        // LinkedIn supports title, summary, and URL
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`;
        break;
      case 'pinterest':
        // Pinterest requires an image URL
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&media=${encodeURIComponent(productImageUrl)}&description=${encodeURIComponent(`${productTitle}: ${productDescription.substring(0, 150)}${productDescription.length > 150 ? '...' : ''} | Price: ${priceDisplay}`)}`;
        break;
      case 'whatsapp':
        // WhatsApp with better formatting
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`*${productTitle}*\n\n${productDescription}\n\n*Price:* ${priceDisplay}\n\n📸 ${productImageUrl}\n\n🔍 View more: ${productUrl}`)}`;
        break;
      case 'telegram':
        // Telegram with better formatting
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(`${productTitle}\n\n${productDescription.substring(0, 200)}${productDescription.length > 200 ? '...' : ''}\n\nPrice: ${priceDisplay}`)}`;
        break;
      case 'email':
        // Email with HTML content for better presentation
        shareUrl = `mailto:?subject=${encodeURIComponent(`Check out this furniture: ${productTitle}`)}&body=${encodeURIComponent(`I found this amazing furniture item and thought you might like it!\n\n${productTitle}\n\n${productDescription}\n\n${priceDisplay ? `Price: ${priceDisplay}` : ''}\n\nCheck it out here: ${productUrl}\n\n${productImageUrl ? 'Image: ' + productImageUrl : ''}`)}`;
        break;
      case 'copy':
        // Try to copy image to clipboard if supported
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined' && productImageUrl) {
          // First try to copy both text and image if possible
          fetch(productImageUrl)
            .then(res => res.blob())
            .then(blob => {
              try {
                const clipboardItems = [
                  new ClipboardItem({
                    [blob.type]: blob,
                    'text/plain': new Blob([richMessage], { type: 'text/plain' })
                  })
                ];
                navigator.clipboard.write(clipboardItems)
                  .then(() => alert('Product details and image copied to clipboard!'))
                  .catch(() => {
                    // If rich clipboard fails, fall back to just text
                    navigator.clipboard.writeText(richMessage)
                      .then(() => alert('Product details copied to clipboard!'));
                  });
              } catch (e) {
                // Fall back to just text
                navigator.clipboard.writeText(richMessage)
                  .then(() => alert('Product details copied to clipboard!'));
              }
            })
            .catch(() => {
              // If image fetch fails, fall back to just text
              navigator.clipboard.writeText(richMessage)
                .then(() => alert('Product details copied to clipboard!'));
            });
        } else {
          // Fall back to just copying text for older browsers
          navigator.clipboard.writeText(richMessage)
            .then(() => alert('Product details copied to clipboard!'))
            .catch(() => alert('Could not copy details. Please copy manually.'));
        }
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

  // Handle related product click
  const handleRelatedProductClick = (relatedProduct: Product) => {
    navigate(`/user/product/${relatedProduct._id}`, { state: { product: relatedProduct } });
  };

  // Login popup functions
  const closeLoginPopup = () => {
    setShowLoginPopup(false);
    navigate('/login');
  };

  // Star rating display
  // const renderStarRating = (rating: number) => {
  //   const stars = [];
  //   const fullStars = Math.floor(rating);
  //   const hasHalfStar = rating % 1 !== 0;
    
  //   for (let i = 0; i < fullStars; i++) {
  //     stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
  //   }
    
  //   if (hasHalfStar) {
  //     stars.push(<FaStarHalfAlt key="half-star" className="text-yellow-400" />);
  //   }
    
  //   const emptyStars = 5 - stars.length;
  //   for (let i = 0; i < emptyStars; i++) {
  //     stars.push(<FaRegStar key={`empty-star-${i}`} className="text-gray-300" />);
  //   }
    
  //   return <div className="flex">{stars}</div>;
  // };

  // Load wishlist and reviews when component mounts
  useEffect(() => {
    const userId = localStorage.getItem("token");
    if (userId) {
      const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${userId}`) || "[]");
      setWishlist(storedWishlist);
    }
  }, []);

  // Function to fetch reviews for a product
  const fetchReviews = async (productId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:10007/api/v1/reviews/${productId}`);
      if (!response.ok) {
        console.error('Failed to fetch reviews');
        return;
      }
      
      const data = await response.json();
      if (data?.data && Array.isArray(data.data)) {
        setReviews(data.data);
        
        // Calculate average rating
        if (data.data.length > 0) {
          const totalRating = data.data.reduce((sum: number, review: Review) => sum + review.rating, 0);
          setAverageRating(totalRating / data.data.length);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };
  
  useEffect(() => {
    if (product) {
      fetchReviews(product._id);
    }
  }, [product]);

  if (loading) return <div className="text-center text-lg text-gray-600 mt-10">Loading...</div>;
  if (error) return <div className="text-center text-lg text-red-500 mt-10">{error}</div>;

  function handleAddToCart() {
    throw new Error("Function not implemented.");
  }

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
            
            {/* Thumbnail Strip */}
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
                        ${discountedPrice || (parseFloat(product.price) * (1 - product.discount/100)).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        ${product.price}
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">${product?.price}</div>
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
                        ${discountedPrice || (parseFloat(product.rent_price) * (1 - product.discount/100)).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        ${product.rent_price}
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">${product?.rent_price}</div>
                  )}
                  <div className="text-lg text-gray-600 ml-1">/month</div>
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
                  </div>
                )}
              </div>
            </div>
            
            {/* Purchase Actions */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {/* Quantity Selector */}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleRemoveFromCart(product?._id || "")}
                  className="py-3 px-6 bg-red-500 text-white text-lg font-semibold rounded-lg shadow-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <FiX size={18} /> Remove
                </button>
                
                <button
                  onClick={navigateToCart}
                  className="py-3 px-6 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <FiPackage size={18} /> Go to Cart
                </button>
                
                <button
                  onClick={navigateToCheckout}
                  className="py-3 px-6 bg-green-500 text-white text-lg font-semibold rounded-lg shadow-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                  <FiTruck size={18} /> Checkout
                </button>
              </div>
              
              {/* Wishlist Button */}
              <button
                onClick={() => handleAddToWishlist(product!)}
                className={`mt-4 w-full py-3 px-4 font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2
                  ${isProductInWishlist(product?._id || '') 
                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}
              >
                <FiHeart size={18} className={isProductInWishlist(product?._id || '') ? 'fill-current' : ''} /> 
                {isProductInWishlist(product?._id || '') ? 'Saved to Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Review Section */}
        <div className="mt-10 bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Customer Reviews</h2>
          
          {/* Enhanced Average Rating Display */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col mb-4 md:mb-0">
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
          
          {/* Review List with updated field handling */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-4 hover:bg-gray-50 p-3 rounded transition">
                  <div className="flex justify-between items-center mb-2">
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
                  <p className="text-sm font-bold mb-1 flex items-center">
                    <FaUser className="mr-2 text-gray-600" /> 
                    User {review.userName || review.userId || review.userid || "Anonymous"}
                  </p>
                  <p className="text-gray-700 pl-6 border-l-2 border-teal-200 ml-1">
                    {review.comment || review.review || "No comment provided"}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FaCommentSlash className="mx-auto text-4xl text-gray-300 mb-2" />
                <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
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
                                 `$${relatedProduct.price}` : 
                                 product?.is_for_rent && relatedProduct.is_for_rent ? 
                                 `$${relatedProduct.rent_price}/day` : ''}
                               </div>
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleAddToCart();
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

      {/* Login Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
              <button onClick={closeLoginPopup} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Please log in to continue with this action.</p>
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
            
            {/* Enhanced preview of what will be shared */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Share Preview:</h4>
              <div className="flex flex-col space-y-3">
                {product?.images && product.images.length > 0 && (
                  <div className="w-full h-40 overflow-hidden rounded-lg">
                    <img 
                      src={product.images[0].startsWith('http') 
                        ? product.images[0] 
                        : `http://127.0.0.1:10007/${product.images[0]}`}
                      alt={product?.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900">{product?.title || product?.category}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">{product?.description}</p>
                  <p className="text-sm font-medium text-teal-600 mt-2">
                    {product?.is_for_sale ? `$${product.price}` : ''} 
                    {product?.is_for_rent ? `$${product.rent_price}/month` : ''}
                  </p>
                </div>
                <div className="text-xs text-gray-500 italic">
                  This preview shows how your share might appear (actual appearance may vary by platform)
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Share this product with your friends and network!
            </p>
            
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
              
              {/* Add Telegram */}
              <button 
                onClick={() => handleShare('telegram')}
                className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-500 mb-1">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="text-xs text-gray-700">Telegram</span>
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
      <MainFooter />
    </>
  );
};

export default ProductView;