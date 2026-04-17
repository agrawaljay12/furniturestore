import React, { useEffect, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminFooter from "../../components/admin/AdminFooter";
import Sidebar from "../../components/admin/Sidebar";

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
  paymentId?: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  purchaseDate: string;
  deliveryDate: string;
  status: string;
  totalPrice: number;
  paymentId?: string;
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

// User details interface
interface UserDetails {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_picture?: string;
  [key: string]: any; // Allow for additional properties
}

// Enhanced helper function to get image URL with better error handling
const getImageUrl = (imagePath: string | undefined, paymentId?: string): string => {
  if (!imagePath) {
    if (paymentId) {
      return `https://furnspace.onrender.com/api/v1/payments/${paymentId}/receipt`;
    }
    return "https://placehold.co/100x100/e0e0e0/808080?text=No+Image";
  }
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Check if path is a relative URL that needs base URL prepended
  const formattedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `https://furnspace.onrender.com${formattedPath}`;
};

const Listorder: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [userDetails, setUserDetails] = useState<{[userId: string]: UserDetails}>({});
  
  // Calculate delivery date helper function
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

  // Fetch user details by ID - Updated with better error handling and data extraction
  const fetchUserDetails = async (userId: string) => {
    try {
      if (!userId || userId === "Unknown User") return;
      
      // Check if we already have this user's details
      if (userDetails[userId]) return;
      
      console.log(`Fetching user details for: ${userId}`);
      
      let headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)"
      };
      
      const response = await fetch(`https://furnspace.onrender.com/api/v1/auth/user/fetch/${userId}`, { 
        method: "GET",
        headers: headersList
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch user details for ${userId}: ${response.status}`);
        return;
      }
      
      const responseText = await response.text();
      console.log(`Raw user data for ${userId}:`, responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        
        // Extract user data - handle different response structures
        let userData = null;
        if (data.data) {
          userData = data.data;
        } else if (data.user) {
          userData = data.user;
        } else {
          userData = data;
        }
        
        console.log(`Processed user data for ${userId}:`, userData);
        
        if (userData && (userData._id || userData.id)) {
          setUserDetails(prev => ({
            ...prev,
            [userId]: userData
          }));
          console.log(`Added user details for ${userId} to state`);
        }
      } catch (err) {
        console.error(`Error parsing user data for ${userId}:`, err);
      }
    } catch (err) {
      console.error(`Error in API call for user ${userId}:`, err);
    }
  };

  // Fetch user details for all orders
  const fetchAllUserDetails = async (orders: Order[]) => {
    const uniqueUserIds = [...new Set(orders.map(order => order.userId))];
    
    // Fetch user details for each unique user ID
    await Promise.all(
      uniqueUserIds.map(userId => fetchUserDetails(userId))
    );
  };

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        setLoading(true);
        
        let headersList = {
          "Content-Type": "application/json"
        };

        console.log("Fetching orders from API...");
        
        let response = await fetch("https://furnspace.onrender.com/api/v1/booking/get_booking", { 
          method: "GET",
          headers: headersList
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let responseText = await response.text();
        console.log("Raw API Response:", responseText);
        
        // Parse the text response into JSON
        let data;
        try {
          data = JSON.parse(responseText);
          console.log("Parsed API Response:", data);
        } catch (parseError) {
          console.error("Error parsing API response:", parseError);
          setError("Failed to parse API response. Invalid JSON format.");
          setLoading(false);
          return;
        }
        
        // Check if data exists in expected format (could be data.data, data, or another structure)
        let bookingsArray = null;
        
        if (data && Array.isArray(data)) {
          console.log("Data is directly an array");
          bookingsArray = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          console.log("Data is in data.data property");
          bookingsArray = data.data;
        } else if (data && data.bookings && Array.isArray(data.bookings)) {
          console.log("Data is in data.bookings property");
          bookingsArray = data.bookings;
        } else if (data && data.orders && Array.isArray(data.orders)) {
          console.log("Data is in data.orders property");
          bookingsArray = data.orders;
        } else {
          console.error("Could not find bookings array in response:", data);
          setError("Invalid API response format. Could not find bookings data.");
          setLoading(false);
          return;
        }
        
        console.log(`Processing ${bookingsArray.length} bookings`);
        
        // Convert booking data to order format with more forgiving property access
        const ordersFromBookings = bookingsArray.map((booking: any) => {
          // Validate booking object and provide detailed logging
          if (!booking || typeof booking !== 'object') {
            console.warn("Invalid booking object:", booking);
            return null;
          }
          
          // Extract ID using various possible field names
          const bookingId = booking._id || booking.id || booking.booking_id || "unknown-id";
          
          // Try different possible status field names
          const bookingStatus = booking.booking_status || booking.status || "pending";
          
          console.log(`Processing Booking: ID=${bookingId}, Status=${bookingStatus}`);
          
          // Handle furniture details with different possible field names
          let furnitureDetails = [];
          if (Array.isArray(booking.furniture_details)) {
            furnitureDetails = booking.furniture_details;
          } else if (Array.isArray(booking.items)) {
            furnitureDetails = booking.items;
          } else if (Array.isArray(booking.products)) {
            furnitureDetails = booking.products;
          } else {
            console.warn("No furniture details found for booking:", bookingId);
            // Create a minimal furniture item to avoid empty orders
            furnitureDetails = [{
              _id: `placeholder-${bookingId}`,
              title: "Furniture Item",
              price: booking.total_price || 0
            }];
          }
          
          // Get dates with fallbacks
          const bookingDate = booking.booking_date || booking.created_at || booking.date || new Date().toISOString();
          const deliveryDate = booking.delivery_date || calculateDeliveryDate(bookingDate);
          
          // Log the available furniture details for debugging
          console.log(`Booking ${bookingId} has ${furnitureDetails.length} furniture items:`, furnitureDetails);
          
          return {
            id: bookingId,
            userId: booking.user_id || booking.userId || "Unknown User",
            items: furnitureDetails.map((furniture: any) => {
              if (!furniture || typeof furniture !== 'object') {
                console.warn("Invalid furniture object in booking", bookingId);
                return null;
              }
              
              const furnitureId = furniture._id || furniture.id || `item-${Math.random().toString(36).substr(2, 9)}`;
              const title = furniture.title || furniture.name || "Untitled Item";
              
              // Handle different image fields
              let primaryImage = null;
              let allImages: string[] = [];
              
              if (furniture.images && Array.isArray(furniture.images) && furniture.images.length > 0) {
                allImages = furniture.images;
                primaryImage = furniture.images[0];
              } else if (furniture.image) {
                primaryImage = furniture.image;
                allImages = [furniture.image];
              } else if (furniture.imagePath) {
                primaryImage = furniture.imagePath;
                allImages = [furniture.imagePath];
              } else if (furniture.imageUrl) {
                primaryImage = furniture.imageUrl;
                allImages = [furniture.imageUrl];
              }
              
              // For debugging
              console.log(`Furniture ${furnitureId} - ${title}, has image:`, primaryImage ? "Yes" : "No");
              
              return {
                id: furnitureId,
                title: title,
                image: primaryImage,
                images: allImages,
                category: furniture.category || "Furniture",
                purchaseDate: bookingDate,
                deliveryDate: deliveryDate,
                status: bookingStatus,
                quantity: furniture.quantity || 1,
                totalPrice: furniture.price || furniture.total_price || 
                           (booking.total_price ? booking.total_price / (furnitureDetails.length || 1) : 0),
                paymentId: booking.payment_id || booking.paymentId
              };
            }).filter((item: any) => item !== null),
            purchaseDate: bookingDate,
            deliveryDate: deliveryDate,
            status: bookingStatus,
            totalPrice: booking.total_price || booking.price || booking.amount || 0,
            paymentId: booking.payment_id || booking.paymentId,
            shippingName: booking.user_name || booking.customer_name || "",
            shippingPhone: booking.user_phone || booking.customer_phone || "",
            shippingAddress: booking.delivery_address || booking.address || {}
          };
        }).filter((order: any) => order !== null);
        
        // Final filter to ensure only orders with items are included
        const validOrders = ordersFromBookings.filter((order: any) => 
          order && order.items && Array.isArray(order.items) && order.items.length > 0
        );
        
        console.log(`Processed ${validOrders.length} valid orders out of ${ordersFromBookings.length} total orders`);
        console.log("Final processed orders:", validOrders);
        
        if (validOrders.length === 0) {
          console.warn("No valid orders were processed from the API response!");
        }
        
        // Update state
        setOrders(validOrders);
        
        // Apply filter
        applyFilter(validOrders, activeFilter);
        
        // Now fetch user details for all orders
        await fetchAllUserDetails(validOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(`Failed to load orders: ${error instanceof Error ? error.message : "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  // Create a helper function to apply filters
  const applyFilter = (orders: Order[], filter: string) => {
    console.log(`Applying filter '${filter}' to ${orders.length} orders`);
    
    if (filter === "all") {
      console.log("Setting all orders to filtered orders");
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => {
        const orderStatus = order.status?.toLowerCase() || "";
        const result = orderStatus === filter.toLowerCase();
        console.log(`Order ${order.id} status '${orderStatus}' matches filter '${filter.toLowerCase()}'? ${result}`);
        return result;
      });
      
      console.log(`Filter '${filter}' resulted in ${filtered.length} orders`);
      setFilteredOrders(filtered);
    }
  };

  // Update the filter orders useEffect to use the helper function
  useEffect(() => {
    applyFilter(orders, activeFilter);
  }, [activeFilter, orders]);

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

  // // Get appropriate status badge color
  // const getStatusBadgeClass = (status: string): string => {
  //   switch(status.toLowerCase()) {
  //     case "confirmed":
  //     case "delivered":
  //       return "bg-green-100 text-green-800";
  //     case "cancelled":
  //     case "failed":
  //       return "bg-red-100 text-red-800";
  //     case "processing":
  //       return "bg-blue-100 text-blue-800";
  //     case "shipped":
  //       return "bg-purple-100 text-purple-800";
  //     default:
  //       return "bg-yellow-100 text-yellow-800";
  //   }
  // };

  // Get formatted user name from userDetails - Updated with more fallbacks
  const getUserName = (userId: string): string => {
    const user = userDetails[userId];
    console.log(`Getting user name for ${userId}:`, user);
    
    if (!user) return "Loading..."; // Show loading instead of raw ID
    
    // Try different property combinations for name
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    } else if (user.name) {
      return user.name;
    } else if (user.email) {
      return user.email.split('@')[0]; // Use email username as fallback
    }
    
    // Show a friendlier fallback than raw ID
    return "User";
  };
  
  // Get user avatar from userDetails
  const getUserAvatar = (userId: string): string => {
    const user = userDetails[userId];
    if (!user || !user.profile_picture) {
      return "https://placehold.co/100x100/e0e0e0/808080?text=User";
    }
    
    return getImageUrl(user.profile_picture);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="fixed top-0 left-0 h-full">
        <Sidebar />
      </div>
      <div className="flex-1 ml-72 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-6">
          {error && (
            <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-4 mb-6 rounded-md">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
              <svg className="h-6 w-6 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Order Management
            </h1>
            
            {/* Filter dropdown */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  className="block appearance-none px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  <option value="all">All Orders ({orders.length})</option>
                  <option value="pending">Pending ({orders.filter(order => order.status?.toLowerCase() === "pending").length})</option>
                  <option value="processing">Processing ({orders.filter(order => order.status?.toLowerCase() === "processing").length})</option>
                  <option value="shipped">Shipped ({orders.filter(order => order.status?.toLowerCase() === "shipped").length})</option>
                  <option value="delivered">Delivered ({orders.filter(order => order.status?.toLowerCase() === "delivered").length})</option>
                  <option value="cancelled">Cancelled ({orders.filter(order => order.status?.toLowerCase() === "cancelled").length})</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Displaying: {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600"
              >
                Retry
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="col-span-full flex items-center justify-center h-60 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                <span className="block text-5xl mb-3 opacity-30">📦</span>
                No {activeFilter !== "all" ? activeFilter : ""} orders found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  {/* Order header with gradient background */}
                  <div className="bg-gradient-to-r from-teal-500 to-blue-600 h-20 relative">
                    <div className="absolute right-4 top-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap bg-white/90 text-blue-800`}>
                        {order.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="px-6 pt-10 pb-6">
                    {/* Order title & ID */}
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white truncate">
                        {order.items.length > 1
                          ? `${order.items[0].title} and ${order.items.length - 1} more`
                          : order.items[0]?.title}
                      </h2>
                      <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-1">
                        {formatDate(order.purchaseDate).split(' ')[0]}
                      </div>
                    </div>
                    
                    {/* Show full order ID instead of truncated version */}
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-4">
                      Order ID: {order.id}
                    </div>
                    
                    {/* Order details with icons */}
                    <div className="space-y-3 mb-4">
                      {/* Customer info - only show if available */}
                      {(order.shippingName || order.shippingPhone) && (
                        <div className="flex items-start text-sm">
                          <svg className="h-4 w-4 mt-0.5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-300">
                            {order.shippingName}
                            {order.shippingPhone && <span className="text-xs text-gray-500 ml-2">({order.shippingPhone})</span>}
                          </span>
                        </div>
                      )}
                      
                      {/* User details with picture */}
                      <div className="flex items-center text-sm">
                        <svg className="h-4 w-4 mt-0.5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                        </svg>
                        <div className="flex items-center">
                          {userDetails[order.userId] ? (
                            <img 
                              src={getUserAvatar(order.userId)} 
                              alt="User"
                              className="w-5 h-5 rounded-full mr-2 object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/100x100/e0e0e0/808080?text=User";
                              }}
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full mr-2 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-xs text-gray-500">?</span>
                            </div>
                          )}
                          <span className="text-gray-600 dark:text-gray-300">
                            {getUserName(order.userId)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Delivery info */}
                      <div className="flex items-start text-sm">
                        <svg className="h-4 w-4 mt-0.5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">
                          {getDeliveryText(order.deliveryDate, order.status)}
                        </span>
                      </div>
                      
                      {/* Amount */}
                      <div className="flex items-start text-sm">
                        <svg className="h-4 w-4 mt-0.5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-800 dark:text-gray-200 font-bold">
                          ${order.totalPrice?.toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Items count */}
                      <div className="flex items-start text-sm">
                        <svg className="h-4 w-4 mt-0.5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status badge at the bottom */}
                    <div className="mt-4 flex justify-center">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full ${
                        order.status?.toLowerCase() === "delivered" ? "bg-green-100 text-green-800" :
                        order.status?.toLowerCase() === "cancelled" ? "bg-red-100 text-red-800" :
                        order.status?.toLowerCase() === "processing" ? "bg-blue-100 text-blue-800" :
                        order.status?.toLowerCase() === "shipped" ? "bg-purple-100 text-purple-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        <span className={`h-2 w-2 mr-2 rounded-full ${
                          order.status?.toLowerCase() === "delivered" ? "bg-green-500" :
                          order.status?.toLowerCase() === "cancelled" ? "bg-red-500" :
                          order.status?.toLowerCase() === "processing" ? "bg-blue-500" :
                          order.status?.toLowerCase() === "shipped" ? "bg-purple-500" :
                          "bg-yellow-500"
                        }`}></span>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        
        <AdminFooter />
      </div>
    </div>
  );
};

export default Listorder;
