import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../../../components/user/MainHeader";
import MainFooter from "../../../../components/user/MainFooter";
import PaymentIntegration from "../../../../Auth/PaymnetIntegration";
import { motion } from "framer-motion";
import { FaArrowLeft, FaCreditCard, FaShippingFast, FaShoppingCart, FaBoxOpen, FaCalendarAlt, FaTag, FaRegClock } from "react-icons/fa";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  category: string;
  is_for_rent: boolean;
  is_for_sale: boolean;
  duration: string | null;
  image?: string;
  images?: string[];
}

interface OrderData {
  user_id: string | null;
  user_name?: string;
  user_phone?: string;
  furniture_ids: string[];
  total_price: number;
  is_buying: boolean;
  duration: string | null;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  };
  items: OrderItem[];
}

const getProductImage = (item: OrderItem): string => {
  try {
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      for (const img of item.images) {
        if (img && typeof img === 'string' && img.trim() !== '') {
          return img;
        }
      }
    }
    if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
      return item.image;
    }
    return "https://via.placeholder.com/150?text=No+Image";
  } catch (error) {
    return "https://via.placeholder.com/150?text=Image+Error";
  }
};

const PaymentPage: React.FC = () => {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rentTotal, setRentTotal] = useState(0);
  const [buyTotal, setBuyTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedOrder = localStorage.getItem("current_order");
    if (storedOrder) {
      try {
        const parsedOrder = JSON.parse(storedOrder);
        const userId = localStorage.getItem("token");
        if (userId) {
          const userDataStr = localStorage.getItem(`user_${userId}`);
          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              if (userData && userData.data) {
                parsedOrder.user_name = `${userData.data.first_name || ''} ${userData.data.last_name || ''}`.trim();
                parsedOrder.user_phone = userData.data.phone || '';
                parsedOrder.delivery_address = {
                  street: userData.data.address || parsedOrder.delivery_address.street,
                  city: userData.data.city || parsedOrder.delivery_address.city,
                  state: userData.data.state || parsedOrder.delivery_address.state,
                  country: userData.data.country || parsedOrder.delivery_address.country,
                  zipcode: userData.data.pin_code || parsedOrder.delivery_address.zipcode,
                };
              }
            } catch (e) {
              console.error("Error parsing user data for address:", e);
            }
          }
        }
        setOrderData(parsedOrder);
        let rentSum = 0;
        let buySum = 0;
        parsedOrder.items.forEach((item: OrderItem) => {
          if (item.is_for_rent) {
            let days = 1;
            if (item.duration) {
              const [dType, value] = item.duration.split("-");
              const numericValue = parseInt(value);
              switch (dType) {
                case "Daily":
                  days = numericValue;
                  break;
                case "Weekly":
                  days = numericValue * 7;
                  break;
                case "Monthly":
                  days = numericValue * 30;
                  break;
              }
            }
            rentSum += item.price * days * item.quantity;
          } else if (item.is_for_sale) {
            buySum += item.price * item.quantity;
          }
        });
        setRentTotal(rentSum);
        setBuyTotal(buySum);
      } catch (err) {
        setError("Failed to parse order data. Please try again.");
      }
    } else {
      setError("No order data found. Please try again.");
    }
    setLoading(false);
  }, []);

  const formatDuration = (duration: string | null): string => {
    if (!duration) return "1 day (default)";
    const [type, value] = duration.split("-");
    const numValue = parseInt(value);
    switch (type) {
      case "Daily":
        return `${numValue} day${numValue > 1 ? 's' : ''}`;
      case "Weekly":
        return `${numValue} week${numValue > 1 ? 's' : ''} (${numValue * 7} days)`;
      case "Monthly":
        return `${numValue} month${numValue > 1 ? 's' : ''} (${numValue * 30} days)`;
      default:
        return duration;
    }
  };

  const getDurationDays = (duration: string | null): number => {
    if (!duration) return 1;
    const [type, value] = duration.split("-");
    const numValue = parseInt(value);
    switch (type) {
      case "Daily":
        return numValue;
      case "Weekly":
        return numValue * 7;
      case "Monthly":
        return numValue * 30;
      default:
        return 1;
    }
  };

  const onApprove = async (_data: any, actions: any) => {
    try {
      const transaction = await actions.order.capture();
      if (!orderData) {
        setError("Order data not available");
        return;
      }
      let userEmail = localStorage.getItem("userEmail");
      if (!userEmail || !userEmail.includes('@')) {
        const userId = orderData.user_id || localStorage.getItem("token");
        if (userId) {
          const userDataStr = localStorage.getItem(`user_${userId}`);
          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              if (userData?.data?.email) {
                userEmail = userData.data.email;
                if (userEmail) {
                  localStorage.setItem("userEmail", userEmail);
                }
              }
            } catch (e) {
              console.error("Error parsing user data:", e);
            }
          }
        }
      }
      let durationInDays = null;
      if (orderData.duration && !orderData.is_buying) {
        durationInDays = getDurationDays(orderData.duration);
      }
      const bookingData = {
        user_id: orderData.user_id || localStorage.getItem("token"),
        user_name: orderData.user_name,
        user_phone: orderData.user_phone,
        user_email: userEmail,
        furniture_id: orderData.furniture_ids,
        booking_date: new Date().toISOString(),
        booking_status: "pending",
        duration: durationInDays,
        total_price: orderData.total_price,
        payment_id: transaction.id,
        payment_status: "completed",
        payment_method: "paypal",
        delivery_address: orderData.delivery_address,
        payment_date: new Date().toISOString(),
        is_buying: orderData.is_buying,
        transaction: transaction,
        payment_history: [{
          payment_id: transaction.id,
          payment_date: new Date().toISOString(),
          payment_amount: orderData.total_price,
          payment_status: "completed",
          payment_method: "paypal"
        }]
      };
      const response = await fetch("http://localhost:10007/api/v1/booking/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });
      const result = await response.json();
      if (response.ok) {
        const confirmedUserId = bookingData.user_id || "unknown";
        const emailSentKey = `receipt_email_sent_${result.data.booking_id}_${confirmedUserId}`;
        localStorage.removeItem(emailSentKey);
        if (userEmail) {
          localStorage.setItem("userEmail", userEmail);
        }
        localStorage.setItem("booking_confirmation", JSON.stringify({
          booking_id: result.data.booking_id,
          transaction: transaction,
          order: {
            ...orderData,
            user_id: confirmedUserId,
            user_name: orderData.user_name,
            user_phone: orderData.user_phone,
            user_email: userEmail,
            send_email_once: true,
            email_sent: false
          }
        }));
        localStorage.removeItem("current_order");
        const cartUserId = localStorage.getItem("token");
        if (cartUserId) {
          const cartString = localStorage.getItem(`cart_${cartUserId}`);
          if (cartString) {
            const currentCart = JSON.parse(cartString);
            const purchasedItemIds = orderData.furniture_ids;
            const updatedCart = currentCart.filter(
              (item: any) => !purchasedItemIds.includes(item._id)
            );
            localStorage.setItem(`cart_${cartUserId}`, JSON.stringify(updatedCart));
            localStorage.removeItem(`selectedItems_${cartUserId}`);
            if (confirmedUserId !== cartUserId) {
              localStorage.removeItem(`selectedItems_${confirmedUserId}`);
            }
          }
        }
        navigate("/booking-confirmation");
      } else {
        setError(`Booking failed: ${result.message}`);
      }
    } catch (err) {
      setError("Payment processing failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-800 mb-4"></div>
        <p className="text-lg animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{error}</h2>
          <p className="mb-6 text-gray-600">There was a problem processing your order. Please try again.</p>
          <button 
            className="px-6 py-3 bg-gray-700 text-white rounded-full shadow-md hover:shadow-lg transition duration-300 flex items-center justify-center mx-auto"
            onClick={() => navigate("/checkout")}
          >
            <FaArrowLeft className="mr-2" /> Return to Checkout
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Order Data Found</h2>
          <p className="mb-6 text-gray-600">We couldn't find your order details. Please return to checkout and try again.</p>
          <button 
            className="px-6 py-3 bg-gray-700 text-white rounded-full shadow-md hover:shadow-lg transition duration-300 flex items-center justify-center mx-auto"
            onClick={() => navigate("/checkout")}
          >
            <FaArrowLeft className="mr-2" /> Return to Checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 shadow-lg">
        <MainHeader logoText="Furniture Store" onSearch={() => {}} />
      </div>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 sm:px-8 pt-24 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-6 sm:p-8"
        >
          <h1 className="text-3xl font-bold text-center mb-8 relative pb-3">
            Complete Your Payment
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-24 rounded-full bg-gray-800"></span>
          </h1>
          
          <div className="mb-10">
            <div className="flex items-center mb-5">
              <FaShoppingCart className="text-xl mr-3" />
              <h2 className="text-2xl font-semibold">Order Summary</h2>
            </div>
            
            {orderData && orderData.items.some(item => item.is_for_rent) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <div className="flex items-center mb-3">
                  <FaRegClock className="mr-2" />
                  <h3 className="font-semibold text-lg">Rental Items</h3>
                </div>
                <div className="border rounded-xl shadow-sm overflow-hidden">
                  {orderData.items
                    .filter(item => item.is_for_rent)
                    .map((item, index) => {
                      const days = getDurationDays(item.duration);
                      const itemTotal = item.price * days * item.quantity;

                      return (
                        <div key={index} className={`flex p-4 ${index !== 0 ? 'border-t' : ''} hover:bg-gray-50 transition-colors duration-200`}>
                          <div className="w-20 h-20 flex-shrink-0 mr-4 overflow-hidden rounded-lg shadow-sm">
                            <img 
                              src={getProductImage(item)}
                              alt={item.title} 
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                console.log(`Failed to load image for ${item.title} using fallback`);
                                e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image";
                                e.currentTarget.onerror = null;
                              }}
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <p className="font-semibold text-lg">{item.title}</p>
                            <div className="flex flex-wrap gap-3 mt-1 text-sm">
                              <span className="inline-flex items-center">
                                <FaTag className="mr-1" /> {item.category || "Not specified"}
                              </span>
                              <span className="inline-flex items-center">
                                <FaBoxOpen className="mr-1" /> Qty: {item.quantity}
                              </span>
                              <span className="inline-flex items-center">
                                <FaCalendarAlt className="mr-1" /> {formatDuration(item.duration)}
                              </span>
                            </div>
                            <p className="text-sm mt-1">
                              <span className="font-medium">${item.price.toFixed(2)}</span>/day
                            </p>
                          </div>
                          <div className="ml-auto text-right">
                            <p className="font-bold text-lg">${itemTotal.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })
                  }
                  <div className="flex justify-between p-4 bg-gray-50 border-t">
                    <p className="font-semibold">Rental Subtotal:</p>
                    <p className="font-bold">${rentTotal.toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {orderData && orderData.items.some(item => item.is_for_sale) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div className="flex items-center mb-3">
                  <FaShoppingCart className="mr-2" />
                  <h3 className="font-semibold text-lg">Purchase Items</h3>
                </div>
                <div className="border rounded-xl shadow-sm overflow-hidden">
                  {orderData.items
                    .filter(item => item.is_for_sale)
                    .map((item, index) => {
                      const itemTotal = item.price * item.quantity;
                      
                      return (
                        <div key={index} className={`flex p-4 ${index !== 0 ? 'border-t' : ''} hover:bg-gray-50 transition-colors duration-200`}>
                          <div className="w-20 h-20 flex-shrink-0 mr-4 overflow-hidden rounded-lg shadow-sm">
                            <img 
                              src={getProductImage(item)}
                              alt={item.title} 
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                console.log(`Failed to load image for ${item.title} using fallback`);
                                e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image";
                                e.currentTarget.onerror = null;
                              }}
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <p className="font-semibold text-lg">{item.title}</p>
                            <div className="flex flex-wrap gap-3 mt-1 text-sm">
                              <span className="inline-flex items-center">
                                <FaTag className="mr-1" /> {item.category || "Not specified"}
                              </span>
                              <span className="inline-flex items-center">
                                <FaBoxOpen className="mr-1" /> Qty: {item.quantity}
                              </span>
                            </div>
                            <p className="text-sm mt-1">
                              <span className="font-medium">${item.price.toFixed(2)}</span> each
                            </p>
                          </div>
                          <div className="ml-auto text-right">
                            <p className="font-bold text-lg">${itemTotal.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })
                  }
                  <div className="flex justify-between p-4 bg-gray-50 border-t">
                    <p className="font-semibold">Purchase Subtotal:</p>
                    <p className="font-bold">${buyTotal.toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-between pt-4 text-xl font-bold rounded-lg p-4 bg-gray-100 shadow-inner"
            >
              <p>Total Amount</p>
              <p>${orderData ? orderData.total_price.toFixed(2) : "0.00"}</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-10"
          >
            <div className="flex items-center mb-5">
              <FaShippingFast className="text-xl mr-3" />
              <h2 className="text-2xl font-semibold">Shipping Information</h2>
            </div>
            {orderData && (
              <div className="bg-gray-50 p-5 rounded-xl shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="font-semibold">{orderData.user_name || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="font-semibold">{orderData.user_phone || "Not provided"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Delivery Address</p>
                  <p className="font-semibold">
                    {orderData.delivery_address.street}, {orderData.delivery_address.city}, {orderData.delivery_address.state}, {orderData.delivery_address.country}, {orderData.delivery_address.zipcode}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-10"
          >
            <div className="flex items-center justify-center mb-5">
              <FaCreditCard className="text-xl mr-3" />
              <h2 className="text-2xl font-semibold">Payment Method</h2>
            </div>
            <div className="flex justify-center w-full py-4 border-t border-b">
              {orderData && (
                <PaymentIntegration
                  amountInr={orderData.total_price}
                  onApprove={onApprove}
                />
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <button
              className="py-3 px-8 bg-gray-700 text-white rounded-full shadow-md hover:shadow-lg transition duration-300 flex items-center"
              onClick={() => navigate("/checkout")}
            >
              <FaArrowLeft className="mr-2" /> Back to Checkout
            </button>
          </motion.div>
        </motion.div>
      </div>

      <MainFooter />
    </>
  );
};

export default PaymentPage;
