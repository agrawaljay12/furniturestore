import React, { useEffect, useState } from "react";
import MainHeader from "../../../../components/user/MainHeader";
import MainFooter from "../../../../components/user/MainFooter";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useActivityLogger from "../../../user/UserActivity";

interface OrderItem {
  id: string;
  title: string;
  image?: string;
  images?: string[];
  category?: string;
  purchaseDate: string;
  deliveryDate: string;
  status: string;
  quantity: number;
  totalPrice: number;
  paymentId?: string; // Add payment ID to each item
}

interface Order {
  id: string;
  items: OrderItem[];
  purchaseDate: string;
  deliveryDate: string;
  status: string;
  totalPrice: number;
  paymentId?: string; // Add payment ID to the order
  // Add shipping address details
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipcode?: string;
  };
}

// Update the getImageUrl function to better handle furniture images
const getImageUrl = (imagePath: string | undefined, paymentId?: string): string => {
  if (!imagePath) {
    // If we have a payment ID, we can try to get an image related to the payment
    if (paymentId) {
      return `http://localhost:10007/api/v1/payments/${paymentId}/receipt`;
    }
    return "https://placehold.co/100x100/e0e0e0/808080?text=No+Image";
  }
  
  // Check if the image path is already a complete URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If the path doesn't start with a slash, add one
  const formattedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Return the complete URL
  return `http://localhost:10007${formattedPath}`;
};

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Add error state
  const navigate = useNavigate();
  const logUserActivity = useActivityLogger();
  
  // Add state variables for review functionality
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // Move viewReceipt function inside the component to access navigate
  const viewReceipt = (orderId: string | undefined| undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!orderId) {
      alert("Order information not available");
      return;
    }
    
    // Navigate to order tracking page for the specific order
    navigate(`/order/${orderId}`);
  };

  // Add a helper function to calculate delivery date
  const calculateDeliveryDate = (bookingDate: string): string => {
    try {
      const date = new Date(bookingDate);
      // Add 3 days to the booking date
      date.setDate(date.getDate() + 3);
      return date.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
    } catch (e) {
      console.error("Error calculating delivery date:", e);
      return "Pending";
    }
  };

  useEffect(() => {
    const fetchOrderHistory = async () => {
      const userId = localStorage.getItem("token");
      if (!userId) {
        console.warn("No user token found");
        setLoading(false);
        setError("User not logged in. Please log in to view order history.");
        return;
      }

      try {
        // Fetch bookings which include furniture details
        let bookingData;
        try {
          console.log("Fetching bookings for user:", userId);
          const bookingResponse = await fetch(`http://localhost:10007/api/v1/booking/user/${userId}`);
          bookingData = await bookingResponse.json();
          
          console.log("API Response:", bookingData);
          
          // Check if the API returned an error message
          if (bookingData.message && bookingData.message.includes("Error") && (!bookingData.data || bookingData.data.length === 0)) {
            console.warn("API returned an error:", bookingData.message);
            setError(`Error fetching orders: ${bookingData.message}`);
          }
          
          // Log the count if available
          if (bookingData.count !== undefined) {
            console.log(`Found ${bookingData.count} bookings for user`);
          }
        } catch (e) {
          console.error("Error fetching from booking API:", e);
          bookingData = { data: [] };
          setError(`Network error: Could not connect to booking service`);
        }
        
        if (bookingData.data && bookingData.data.length > 0) {
          console.log("Raw booking data:", bookingData.data);
          
          // Convert booking data to order format
          const ordersFromBookings = bookingData.data.map((booking: any) => {
            // Validate booking object
            if (!booking || typeof booking !== 'object') {
              console.warn("Invalid booking object:", booking);
              return null;
            }
            
            // Make sure furniture_details exists and has items
            const furnitureDetails = Array.isArray(booking.furniture_details) ? booking.furniture_details : [];
            
            // Calculate delivery date (3 days after booking date)
            const deliveryDate = booking.delivery_date || calculateDeliveryDate(booking.booking_date);
            
            return {
              id: booking._id,
              items: furnitureDetails.map((furniture: any) => {
                // Skip if furniture is invalid
                if (!furniture || typeof furniture !== 'object') {
                  console.warn("Invalid furniture object:", furniture);
                  return null;
                }
                
                // Normalize image data
                let primaryImage = null;
                let allImages: string[] = [];
                
                // Handle different image field formats
                if (furniture.images && Array.isArray(furniture.images) && furniture.images.length > 0) {
                  allImages = furniture.images;
                  primaryImage = furniture.images[0];
                } else if (furniture.image) {
                  primaryImage = furniture.image;
                  allImages = [furniture.image];
                }
                
                return {
                  id: furniture._id,
                  title: furniture.title || "Untitled Item",
                  image: primaryImage,
                  images: allImages,
                  category: furniture.category,
                  purchaseDate: booking.booking_date,
                  deliveryDate: deliveryDate, // Use calculated delivery date for items too
                  status: booking.booking_status || "pending",
                  quantity: 1, // Default quantity if not specified
                  totalPrice: booking.total_price / (furnitureDetails.length || 1), // Prevent division by zero
                  paymentId: booking.payment_id // Add payment ID to each item
                };
              }).filter((item: any) => item !== null), // Remove null items
              purchaseDate: booking.booking_date,
              deliveryDate: deliveryDate, // Use the calculated or existing delivery date
              status: booking.booking_status || "pending",
              totalPrice: booking.total_price || 0,
              paymentId: booking.payment_id,
              shippingName: booking.user_name || "",
              shippingPhone: booking.user_phone || "",
              shippingAddress: booking.delivery_address || {}
            };
          }).filter((order: any) => order !== null && order.items.length > 0); // Remove invalid orders
          
          console.log("Processed orders:", ordersFromBookings);
          setOrders(ordersFromBookings);
        } else {
          // No bookings found, set empty orders array
          console.log("No bookings found for user or empty data returned");
          setOrders([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order history:", error);
        setOrders([]);
        setLoading(false);
        setError("Failed to load order history. Please try again later.");
        
        // Optional: implement retry logic
        // setTimeout(fetchOrderHistory, 5000); // Retry after 5 seconds
      }
    };

    fetchOrderHistory();
  }, []);
 
  // Format date to show delivery estimate
  const formatDate = (dateString: string) => {
    try {
      if (dateString === "Pending") return "Pending";
      
      const date = new Date(dateString);
      // Check if it's a valid date
      if (isNaN(date.getTime())) return dateString;
      
      // Format the date
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  };

  // Display estimated delivery for pending orders
  const getDeliveryText = (deliveryDate: string, status: string) => {
    if (status.toLowerCase() === "pending" || status.toLowerCase() === "processing") {
      return `Est. delivery: ${formatDate(deliveryDate)}`;
    }
    return formatDate(deliveryDate);
  };

  // Get appropriate status badge color
  const getStatusBadgeClass = (status: string): string => {
    switch(status.toLowerCase()) {
      case "confirmed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const navigateToOrder = (orderId: string) => {
    navigate(`/booking/${orderId}`);
  };

  // Open review modal function
  const openReviewModal = (item: OrderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setReviewRating(5);
    setReviewComment("");
    setReviewError(null);
    setReviewSuccess(null);
    setIsReviewModalOpen(true);
  };

  // Close review modal function
  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedItem(null);
  };

  // Handle review submission
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) {
      setReviewError("No item selected for review");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(null);

    try {
      const userId = localStorage.getItem("token");
      if (!userId) {
        setReviewError("You must be logged in to submit a review");
        setIsSubmittingReview(false);
        return;
      }

      // Match backend API endpoint from root.py
      const reviewData = {
        userid: userId,                 // Match the backend field name 'userid'
        productid: selectedItem.id,     // Match the backend field name 'productid'
        rating: reviewRating,           // Match the backend field name 'rating'
        review: reviewComment,          // Match the backend field name 'review'
        created_at: new Date().toISOString() // Match the backend field name 'created_at'
      };

      console.log("Submitting review data:", reviewData);

      // Update the API endpoint to match the one in root.py
      const response = await axios.post(
        "http://localhost:10007/api/v1/review/add",
        reviewData
      );

      console.log("Review submission response:", response.data);

      // Check for successful response according to the API response format
      if (response.data && response.data.status === 201) {
        // Log user activity with more detailed information
        const truncatedReview = reviewComment.length > 100 ? 
          `${reviewComment.substring(0, 100)}...` : reviewComment;
        logUserActivity(`Submitted ${reviewRating}-star review for "${selectedItem.title}": "${truncatedReview}"`);
        
        setReviewSuccess("Thank you for your review!");
        // Reset form after 2 seconds and close modal
        setTimeout(() => {
          closeReviewModal();
        }, 2000);
      } else {
        // Handle specific error message from the API if available
        const errorMessage = response.data?.status_message || "Failed to submit review. Please try again.";
        setReviewError(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      
      // Try to extract more detailed error information from the response
      let errorMessage = "An error occurred while submitting your review. Please try again later.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.detail || errorMessage;
      }
      
      setReviewError(errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <><div className="flex flex-col min-h-screen py-16 ">
      <MainHeader
        logoText="Furniture Store"
        onSearch={() => { } } />

      <main className="flex-1 p-6 bg-gray-100">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-8 text-center">Order History</h1>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => navigate("/")}
                className="bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600"
              >
                Return to Homepage
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No orders found.</p>
              <button
                onClick={() => navigate("/")}
                className="bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600"
              >
                Browse Furniture
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">Showing {orders.length} {orders.length === 1 ? "order" : "orders"}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border p-4 rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigateToOrder(order.id)}
                  >
                    <div className="flex items-start mb-4">
                      <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden mr-4">
                        {order.items[0] && (order.items[0]?.image || order.items[0]?.images?.[0]) ? (
                          <img
                            src={getImageUrl(
                              order.items[0]?.image || order.items[0]?.images?.[0],
                              order.paymentId || order.items[0]?.paymentId
                            )}
                            alt={order.items[0]?.title || "Order item"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log("Failed to load image:", e.currentTarget.src);
                              // Try alternative image sources if first one fails
                              const item = order.items[0];
                              if (item?.images && item.images.length > 1 && e.currentTarget.src.includes(item.images[0])) {
                                e.currentTarget.src = getImageUrl(item.images[1]);
                              } else {
                                e.currentTarget.src = "https://placehold.co/100x100/e0e0e0/808080?text=No+Image";
                              }
                            } } />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold">
                          {order.items.length > 1
                            ? `${order.items[0].title} and ${order.items.length - 1} more items`
                            : order.items[0]?.title}
                        </h2>
                        <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded font-medium ${getStatusBadgeClass(order.status)}`}
                      >
                        {order.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Purchase Date:</span>
                        <span>{formatDate(order.purchaseDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Date:</span>
                        <span className={order.status.toLowerCase() === "pending" ? "text-orange-600 font-medium" : ""}>
                          {getDeliveryText(order.deliveryDate, order.status)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Total Price:</span>
                        <span className="text-teal-600">${order.totalPrice?.toFixed(2)}</span>
                      </div>

                      {/* Add shipping information section */}
                      {(order.shippingName || order.shippingPhone ||
                        (order.shippingAddress && Object.keys(order.shippingAddress).some(k => !!order.shippingAddress?.[k as keyof typeof order.shippingAddress]))) && (
                          <div className="mb-3 pb-3 border-b">
                            <p className="text-sm font-medium text-gray-700 mb-1">Shipping Information:</p>
                            {order.shippingName && (
                              <p className="text-sm text-gray-600">Name: {order.shippingName}</p>
                            )}
                            {order.shippingPhone && (
                              <p className="text-sm text-gray-600">Phone: {order.shippingPhone}</p>
                            )}
                            {order.shippingAddress && Object.keys(order.shippingAddress).some(k => !!order.shippingAddress?.[k as keyof typeof order.shippingAddress]) && (
                              <p className="text-sm text-gray-600 truncate">
                                Address: {[
                                  order.shippingAddress.street,
                                  order.shippingAddress.city,
                                  order.shippingAddress.state,
                                  order.shippingAddress.country,
                                  order.shippingAddress.zipcode
                                ].filter(Boolean).join(", ")}
                              </p>
                            )}
                          </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t">
                      <span className="text-sm text-gray-500">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </span>
                      <div className="flex space-x-4">
                        {order.paymentId && (
                          <button
                            className="text-blue-600 text-sm font-medium hover:underline"
                            onClick={(e) => viewReceipt(order.id, e) }
                          >
                            Order Tracking 
                          </button>
                        )}
                        {/* Add Rate Review button for all completed orders */}
                        <button
                          className="text-orange-600 text-sm font-medium hover:underline"
                          onClick={(e) => openReviewModal(order.items[0], e)}
                        >
                          Rate & Review
                        </button>
                        {/* Keep the existing "Leave Review" button for delivered orders
                    {order.status.toLowerCase() === "delivered" && (
                      <button
                        className="text-green-600 text-sm font-medium hover:underline"
                        onClick={(e) => openReviewModal(order.items[0], e)}
                      >
                        Leave Review
                      </button>
                    )} */}
                        <button
                          className="text-blue-600 text-sm font-medium hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToOrder(order.id);
                          } }
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-gray-200 dark:border-gray-700 transform transition-all animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeReviewModal}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-5 text-gray-800 dark:text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Share Your Experience
            </h2>

            {selectedItem && (
              <div className="flex items-center mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mr-4 flex-shrink-0 border border-gray-200 dark:border-gray-600">
                  {(selectedItem.image || selectedItem.images?.[0]) ? (
                    <img
                      src={getImageUrl(selectedItem.image || selectedItem.images?.[0], selectedItem.paymentId)}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/100x100/e0e0e0/808080?text=No+Image";
                      } } />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white text-lg">{selectedItem.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Purchased: {formatDate(selectedItem.purchaseDate)}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                    Order ID: {selectedItem.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            )}

            {reviewSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-5 rounded-lg mb-4 border border-green-200 dark:border-green-800 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-center font-medium">{reviewSuccess}</p>
                <p className="text-center text-sm mt-1 text-green-600 dark:text-green-300">Thank you for helping others with your review!</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="space-y-6">
                {reviewError && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-lg border border-red-200 dark:border-red-800 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{reviewError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Your Rating</label>
                  <div className="flex items-center">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-3xl focus:outline-none transition-transform hover:scale-110 relative"
                        >
                          {star <= reviewRating ? (
                            <span className="text-yellow-400">★</span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">★</span>
                          )}
                          <span className="sr-only">{star} stars</span>
                        </button>
                      ))}
                    </div>
                    <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                      {reviewRating === 5 ? "Excellent!" :
                        reviewRating === 4 ? "Very Good" :
                          reviewRating === 3 ? "Good" :
                            reviewRating === 2 ? "Fair" : "Poor"}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="reviewComment" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Your Review
                  </label>
                  <textarea
                    id="reviewComment"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-30 transition-all duration-200"
                    rows={4}
                    placeholder="What did you like or dislike? Would you recommend this product?"
                    required />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Your honest feedback helps other customers make better decisions.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="px-5 py-2.5 mr-3 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800 flex items-center"
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Review
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div><MainFooter /></>
  );
};

export default OrderHistory;
