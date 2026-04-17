import React, { useEffect, useState } from 'react';
import DeliverySidebar from '../../components/admin/DeliverySidebar';
import DeliveryHeader from '../../components/admin/DeliveryHeader';
import { FaBox, FaShippingFast, FaTruckLoading, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const DeliveryDashboard: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState(0);
  const [processingOrders, setProcessingOrders] = useState(0);
  const [shippedOrders, setShippedOrders] = useState(0);
  const [deliveredOrders, setDeliveredOrders] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  interface Order {
    booking_status: string;
    // Add other properties of the Order object if needed
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        let headersList = {
          "Content-Type": "application/json"
        };

        const response = await fetch("https://furnspace.onrender.com/api/v1/booking/get_booking", { 
          method: "GET",
          headers: headersList
        });

        const result = await response.json();
        console.log("Orders data:", result);

        if (result && result.data && Array.isArray(result.data)) {
          const orders = result.data;
          
          // Count orders by booking_status instead of status
          const pending: number = orders.filter((order: Order) => order.booking_status === "pending").length;
          const processing: number = orders.filter((order: Order) => order.booking_status === "processing").length;
          
          // Calculate shipped orders with extra logging for debugging
          const shippedOrdersArray = orders.filter((order: Order) => order.booking_status === "shipped");
          console.log("Shipped orders:", shippedOrdersArray);
          const shipped: number = shippedOrdersArray.length;
          
          const delivered: number = orders.filter((order: Order) => order.booking_status === "delivered").length;
          
          setPendingOrders(pending);
          setProcessingOrders(processing);
          setShippedOrders(shipped);
          setDeliveredOrders(delivered);
          setTotalOrders(orders.length);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders data. Please check your connection or API.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar - properly integrated */}
      <div className="fixed top-0 left-0 h-full">
        <DeliverySidebar />
      </div>

      {/* Main content area - adjusted to match sidebar width */}
      <div className="flex-1 ml-72 flex flex-col">
        {/* Header */}
        <DeliveryHeader />
        
        {/* Content */}
        <main className="flex-1 p-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-100 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 p-4 mb-6 rounded-md shadow-sm"
            >
              <p className="font-medium">{error}</p>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Welcome back, <span className="text-teal-600 dark:text-teal-500">Delivery Partner</span> 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Here's what's happening with your deliveries today.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full mr-4"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              <motion.div 
                custom={0}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalOrders}</p>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                      <FaBox size={24} />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-1"></span>
                      All deliveries
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Pending</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">{pendingOrders}</p>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                      <FaBox size={24} />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
                      Orders awaiting action
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                custom={2}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Processing</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">{processingOrders}</p>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                      <FaTruckLoading size={24} />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                      Orders being prepared
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                custom={3}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/30 dark:to-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-purple-200 dark:border-purple-800/50"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase mb-1">Shipped</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">{shippedOrders}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Active deliveries in transit</p>
                    </div>
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                      <FaShippingFast size={28} />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-800/30">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                      Shipments requiring your attention
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                custom={4}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Delivered</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">{deliveredOrders}</p>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                      <FaCheckCircle size={24} />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                      Completed deliveries
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center mb-6">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg mr-3">
                <FaBox className="text-amber-600 dark:text-amber-400 text-xl" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Delivery Tips</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <h3 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Maintain Excellent Communication
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Keep customers informed about their delivery status, especially if there are any delays or issues.
                </p>
              </div>
              
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <h3 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Handle Products With Care
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Furniture items need special care during transportation. Ensure proper handling to avoid damage.
                </p>
              </div>
              
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <h3 className="font-medium text-slate-800 dark:text-white mb-2 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Plan Your Route Efficiently
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Use navigation tools to plan the most efficient delivery route to save time and fuel.
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DeliveryDashboard;