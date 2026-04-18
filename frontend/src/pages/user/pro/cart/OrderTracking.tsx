import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainHeader from "../../../../components/user/MainHeader";
import MainFooter from "../../../../components/user/MainFooter";
import { motion} from "framer-motion";

interface FurnitureDetails {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  dimensions: string;
  price: number;
  rent_price?: number | string;
  is_for_rent?: boolean;
  is_for_sale?: boolean;
  image?: string;
  images?: string[];
}

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipcode: string;
}

interface BookingDetail {
  _id: string;
  booking_date: string;
  booking_status: string;
  delivery_address: DeliveryAddress;
  furniture_details: FurnitureDetails[];
  payment_id?: string;
  payment_image?: string;
  user_id?: string;
  user_name?: string;
  user_phone?: string;
  is_buying?: boolean;
  duration?: number;
}

// Enhanced order tracking stages with more detailed icons and descriptions
const orderStages = [
  { 
    key: "placed", 
    label: "Order Placed",
    description: "We've received your order",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: "from-blue-400 to-blue-500"
  },
  {
    key: "processing",
    label: "Processing",
    description: "Preparing your items",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    bgColor: "from-purple-400 to-purple-500"
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
    )
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  }
];

// Enhanced OrderProgressBar with animated transitions
const OrderProgressBar: React.FC<{ currentStatus: string }> = ({ currentStatus }) => {
  const getStageIndex = (status: string): number => {
    switch (status.toLowerCase()) {
      case "pending":
        return 0; // Order Placed
      case "processing":
        return 1; // Processing
      case "shipped":
      case "in transit":
        return 2; // Shipped
      case "delivered":
      case "completed":
        return 3; // Delivered
      case "cancelled":
      case "rejected":
        return -1; // Not shown in progress
      default:
        return 0; // Default to first stage
    }
  };

  const currentStageIndex = getStageIndex(currentStatus);

  if (currentStageIndex === -1) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-red-700 font-medium">
              This order has been {currentStatus.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 px-4">
      <div className="relative">
        {/* Background pattern for more visual interest */}
        <div className="absolute top-1/2 left-0 right-0 h-3 bg-gray-100 -translate-y-1/2 rounded-full overflow-hidden">
          <div className="w-full h-full opacity-10 bg-[repeating-linear-gradient(45deg,#606dbc,#606dbc 10px,#465298 10px,#465298 20px)]"></div>
        </div>
        
        {/* Improved progress line with animation and pulsing effect */}
        <motion.div 
          className="absolute top-1/2 left-0 h-3 -translate-y-1/2 rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ 
            width: `${(currentStageIndex * 100) / (orderStages.length - 1)}%`,
            transition: { duration: 1.5, ease: "easeOut" }
          }}
        >
          <motion.div 
            className="w-full h-full bg-gradient-to-r from-teal-400 to-teal-600"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ 
              duration: 5, 
              ease: "easeInOut", 
              repeat: Infinity,
            }}
          />
          
          {/* Moving dots for more dynamic feel */}
          <motion.div 
            className="absolute top-0 right-0 h-full w-6 bg-gradient-to-r from-transparent to-white opacity-40"
            animate={{
              x: [20, -20, 20],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>
        
        {/* Stage indicators with enhanced animations */}
        <div className="flex justify-between relative">
          {orderStages.map((stage, index) => {
            const isCompleted = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;
            
            return (
              <motion.div 
                key={stage.key} 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <motion.div 
                  className={`w-14 h-14 rounded-full flex items-center justify-center z-10 border-2 ${
                    isCurrent 
                      ? "border-teal-500 bg-white text-teal-500 shadow-lg" 
                      : isCompleted 
                        ? "border-teal-500 bg-gradient-to-br from-teal-400 to-teal-600 text-white" 
                        : "border-gray-300 bg-white text-gray-300"
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: isCurrent ? 1.15 : 1,
                    boxShadow: isCurrent ? "0 0 0 6px rgba(20, 184, 166, 0.25)" : "none"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <motion.div 
                      className="relative"
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {stage.icon}
                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-teal-500"
                          initial={{ opacity: 0.5, scale: 0.85 }}
                          animate={{ opacity: 0, scale: 1.2 }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                        />
                      )}
                    </motion.div>
                  ) : (
                    <div className="opacity-50">{stage.icon}</div>
                  )}
                </motion.div>
                
                <div className="mt-3 flex flex-col items-center max-w-[100px] text-center">
                  <motion.span 
                    className={`text-sm font-semibold ${
                      isCurrent ? "text-teal-600" : isCompleted ? "text-gray-700" : "text-gray-400"
                    }`}
                    animate={{ 
                      fontWeight: isCurrent ? 600 : 400,
                      scale: isCurrent ? 1.05 : 1
                    }}
                  >
                    {stage.label}
                  </motion.span>
                  
                  {/* Optional description for more context */}
                  {(isCurrent || isCompleted) && stage.description && (
                    <motion.span
                      className={`text-xs mt-1 ${isCurrent ? "text-teal-500" : "text-gray-500"}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      {stage.description}
                    </motion.span>
                  )}
                  
                  {isCurrent && (
                    <motion.div className="relative mt-2">
                      <motion.span 
                        className="text-xs font-medium bg-teal-100 text-teal-700 px-2 py-1 rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Current
                      </motion.span>
                      <motion.div
                        className="absolute inset-0 bg-teal-100 rounded-full"
                        initial={{ opacity: 0.7 }}
                        animate={{ 
                          opacity: [0.7, 0.4, 0.7],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity, 
                          repeatType: "loop" 
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const EstimatedDelivery: React.FC<{ status: string, bookingDate: string }> = ({ status, bookingDate }) => {
  const getEstimatedDate = () => {
    const date = new Date(bookingDate);
    
    if (status === "delivered" || status === "completed") {
      return "Delivered";
    }
    
    if (status === "shipped" || status === "in transit") {
      date.setDate(date.getDate() + 3);
      return `Est. delivery: ${date.toLocaleDateString()}`;
    }
    
    if (status === "processing") {
      date.setDate(date.getDate() + 4);
      return `Est. delivery: ${date.toLocaleDateString()}`;
    }
    
    date.setDate(date.getDate() + 5);
    return `Est. delivery: ${date.toLocaleDateString()}`;
  };

  if (status === "cancelled" || status === "rejected") {
    return null;
  }

  return (
    <div className="flex items-center text-sm text-gray-600 mt-2">
      <svg className="h-4 w-4 mr-1 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {getEstimatedDate()}
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getBadgeStyles = () => {
    switch(status.toLowerCase()) {
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
      case "in transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <motion.span 
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyles()}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {status.toUpperCase()}
    </motion.span>
  );
};

const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, setErrorCode] = useState<number | null>(null);
  const navigate = useNavigate();

  const getImageUrl = (imagePath: string | undefined, paymentId?: string): string => {
    if (!imagePath) {
      if (paymentId) {
        return `https://furnspace.onrender.com/api/v1/payments/${paymentId}/receipt`;
      }
      return "https://placehold.co/300x200/e0e0e0/808080?text=No+Image";
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    const formattedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:10007${formattedPath}`;
  };

  const fetchBookingDetails = async () => {
    if (!id) {
      setError("Booking ID is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      const response = await fetch(`https://furnspace.onrender.com/api/v1/booking/get_with_furniture/${id}`);
      
      if (!response.ok) {
        setErrorCode(response.status);
        if (response.status === 500) {
          throw new Error("Server error. The booking service is currently unavailable.");
        } else if (response.status === 404) {
          throw new Error("Booking not found. It may have been deleted or never existed.");
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.data && data.data.user_id && (!data.data.user_name || !data.data.user_phone)) {
        try {
          const userResponse = await fetch(`https://furnspace.onrender.com/api/v1/user/${data.data.user_id}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData && userData.data) {
              data.data.user_name = userData.data.name || userData.data.fullname || userData.data.username;
              data.data.user_phone = userData.data.phone || userData.data.phoneNumber || userData.data.contact;
            }
          } else {
            const profileResponse = await fetch(`https://furnspace.onrender.com/api/v1/auth/profile/${data.data.user_id}`);
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              if (profileData && profileData.data) {
                data.data.user_name = profileData.data.name || profileData.data.fullname || profileData.data.username;
                data.data.user_phone = profileData.data.phone || profileData.data.phoneNumber || profileData.data.contact;
              }
            }
          }
        } catch (userError) {
          console.error("Error fetching user details:", userError);
        }
      }
      
      if (data.data && data.data.furniture_details) {
        data.data.furniture_details.forEach((furniture: any) => {
          if (furniture.image && (!furniture.images || !Array.isArray(furniture.images))) {
            furniture.images = [furniture.image];
          } else if (!furniture.images) {
            furniture.images = [];
          } else if (typeof furniture.images === 'string') {
            furniture.images = [furniture.images];
          }
          
          if (furniture.images && furniture.images.length > 0 && !furniture.image) {
            furniture.image = furniture.images[0];
          }
          
          if ((!furniture.images || furniture.images.length === 0) && furniture._id) {
            const directImageUrl = `https://furnspace.onrender.com/api/v1/furniture/${furniture._id}/image`;
            furniture.images = [directImageUrl];
            furniture.image = directImageUrl;
          }
          
          if (furniture.rent_price === undefined && furniture.price) {
            furniture.rent_price = (furniture.price / 10).toFixed(2);
          }
          
          if (typeof furniture.price === 'string') {
            furniture.price = parseFloat(furniture.price);
          }
          
          if (typeof furniture.rent_price === 'string') {
            furniture.rent_price = parseFloat(furniture.rent_price);
          }
        });
      }
      
      if (data.data && data.data.payment_id) {
        try {
          const paymentResponse = await fetch(`https://furnspace.onrender.com/api/v1/payments/${data.data.payment_id}`);
          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json();
            if (paymentData && paymentData.data) {
              data.data.payment_image = paymentData.data.receipt_image || paymentData.data.image;
            }
          } else {
            data.data.payment_image = `https://furnspace.onrender.com/api/v1/payments/${data.data.payment_id}/receipt`;
          }
        } catch (paymentError) {
          data.data.payment_image = `https://furnspace.onrender.com/api/v1/payments/${data.data.payment_id}/receipt`;
        }
      }
      
      setBooking(data.data);
    } catch (err) {
      setError(`Error fetching booking details: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatPrice = (furniture: FurnitureDetails) => {
    if (booking?.is_buying === false) {
      return `$${furniture.rent_price || 0}/day`;
    }
    return `$${furniture.price || 0}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error || "Booking not found"}</p>
        
        <button 
          onClick={() => navigate("/order-history")} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 shadow-lg">
        <MainHeader logoText="Furniture Store" onSearch={() => {}} />
      </div>

      <motion.div 
        className="min-h-screen bg-gray-50 px-4 pt-24 pb-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6"
          variants={itemVariants}
        >
          <motion.div 
            className="flex justify-between items-center mb-4"
            variants={itemVariants}
          >
            <h1 className="text-2xl font-semibold text-gray-800">
              Order #{booking._id.slice(-6)} Status
            </h1>
            <StatusBadge status={booking.booking_status} />
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-lg p-6 mb-8 border border-gray-200 shadow-sm"
            variants={itemVariants}
          >
            <motion.h3 
              className="text-lg font-semibold text-teal-700 mb-4"
              variants={itemVariants}
            >
              Track Your Order
            </motion.h3>
            <OrderProgressBar currentStatus={booking.booking_status} />
            
            {booking.booking_status !== "cancelled" && booking.booking_status !== "rejected" && (
              <motion.p 
                className="text-teal-700 text-center font-medium mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {booking.booking_status === "delivered" || booking.booking_status === "completed" ? (
                  "Your order has been delivered. Thank you for shopping with us!"
                ) : booking.booking_status === "shipped" || booking.booking_status === "in transit" ? (
                  "Your order is on the way! Expected delivery in 1-2 business days."
                ) : booking.booking_status === "processing" ? (
                  "Your order is currently being processed. Items will ship soon."
                ) : (
                  "Your order has been placed. We'll begin processing it shortly."
                )}
              </motion.p>
            )}
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
            variants={itemVariants}
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Order Date</h3>
              <p className="text-gray-800">{formatDate(booking.booking_date)}</p>
              <EstimatedDelivery status={booking.booking_status} bookingDate={booking.booking_date} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Shipping Address</h3>
              <p className="text-gray-800">
                {[
                  booking.delivery_address.street,
                  booking.delivery_address.city,
                  booking.delivery_address.state,
                  booking.delivery_address.zipcode
                ].filter(Boolean).join(", ")}
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.h2 
              className="text-xl font-semibold mb-4 text-teal-600 flex items-center"
              variants={itemVariants}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {booking.is_buying ? "Purchased Items" : "Rented Items"}
            </motion.h2>

            <motion.div 
              className="space-y-4"
              variants={containerVariants}
            >
              {booking.furniture_details.map((furniture, index) => (
                <motion.div 
                  key={`${furniture._id}-${index}`} 
                  className="border rounded-lg overflow-hidden shadow-sm transition-all"
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 h-48 overflow-hidden">
                      <motion.img 
                        src={getImageUrl(furniture.images?.[0], booking.payment_id)}
                        alt={furniture.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        onError={(e) => {
                          if (furniture.images && furniture.images.length > 1) {
                            e.currentTarget.src = getImageUrl(furniture.images[1]);
                          } else if (furniture._id) {
                            e.currentTarget.src = `https://furnspace.onrender.com/api/v1/furniture/${furniture._id}/image`;
                          } else {
                            e.currentTarget.src = "https://placehold.co/300x200/e0e0e0/808080?text=No+Image";
                          }
                        }}
                      />
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-bold text-gray-800 mb-2">{furniture.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <motion.span 
                          className="bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs font-medium"
                          whileHover={{ scale: 1.05 }}
                        >
                          {furniture.category}
                        </motion.span>
                        <motion.span 
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                          whileHover={{ scale: 1.05 }}
                        >
                          {furniture.condition}
                        </motion.span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{furniture.description}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-sm"><span className="font-medium">Dimensions:</span> {furniture.dimensions}</p>
                        <motion.p 
                          className="text-lg font-bold text-teal-600"
                          whileHover={{ scale: 1.1 }}
                        >
                          {formatPrice(furniture)}
                        </motion.p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            className="mt-6 flex justify-center"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => navigate("/order-history")}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Orders
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      <MainFooter />
    </>
  );
};

export default OrderTrackingPage;
