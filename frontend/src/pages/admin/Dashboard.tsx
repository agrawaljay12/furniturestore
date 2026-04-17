import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminFooter from "../../components/admin/AdminFooter";
import axios from "axios";
import { FiUsers, FiUserCheck, FiShoppingBag, FiPackage, FiTrendingUp, FiDollarSign, FiX, FiCalendar, FiInfo } from "react-icons/fi";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Area, ComposedChart, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

const Dashboard: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalModerators, setTotalModerators] = useState<number>(0);
  const [totalDeliveryBoys, setTotalDeliveryBoys] = useState<number>(0);
  const [totalRetailers, setTotalRetailers] = useState<number>(0);
  const [totalRentItems, setTotalRentItems] = useState<number>(0);
  const [totalSaleItems, setTotalSaleItems] = useState<number>(0);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [showRevenueDetails, setShowRevenueDetails] = useState<boolean>(false);
  const [detailedView, setDetailedView] = useState<'monthly' | 'transactions'>('monthly');
  const [dataStatus, setDataStatus] = useState({
    users: { loaded: false, error: false },
    furniture: { loaded: false, error: false },
    revenue: { loaded: false, error: false },
    purchases: { loaded: false, error: false }
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [userCache, setUserCache] = useState<{[key: string]: {firstName: string, lastName: string}}>({});
  const [furnitureCache, setFurnitureCache] = useState<{[key: string]: {category: string}}>({});
  const [failedUserIds, setFailedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token is missing. Please log in again.");
        setDataStatus(prev => ({...prev, users: { loaded: true, error: true }}));
        setLoading(false);
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.post(
          "http://127.0.0.1:10007/api/v1/auth/get_users",
          {}, 
          { headers }
        );

        const users = response.data.data || [];
        const totalUsersCount = users.filter((user: any) => user.type === "user").length;
        const totalModeratorsCount = users.filter((user: any) => user.type === "moderator").length;
        const totalDeliveryBoysCount = users.filter((user: any) => user.type === "deliveryboy").length;
        const totalRetailersCount = users.filter((user: any) => user.type === "retailer").length;

        setTotalUsers(totalUsersCount);
        setTotalModerators(totalModeratorsCount);
        setTotalDeliveryBoys(totalDeliveryBoysCount);
        setTotalRetailers(totalRetailersCount);
        setDataStatus(prev => ({...prev, users: { loaded: true, error: false }}));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch user data. Please check your connection or API.");
        setDataStatus(prev => ({...prev, users: { loaded: true, error: true }}));
      }
    };

    const fetchFurnitureData = async () => {
      try {
        const headersList = { "Content-Type": "application/json" };
        
        const bodyContent = JSON.stringify({ 
          "page": 1, 
          "page_size": 1000, 
          "sort_by": "price", 
          "sort_order": "asc", 
          "search": "", 
          "title": "" 
        });

        const response = await fetch("http://127.0.0.1:10007/api/v1/furniture/list_all", { 
          method: "POST", 
          body: bodyContent, 
          headers: headersList 
        });

        const result = await response.json();
        
        if (result.status === 200 && result.data) {
          const forRent = result.data.filter((item: any) => item.is_for_rent === true).length;
          const forSale = result.data.filter((item: any) => item.is_for_sale === true).length;
          
          setTotalRentItems(forRent);
          setTotalSaleItems(forSale);
          setDataStatus(prev => ({...prev, furniture: { loaded: true, error: false }}));
        }
      } catch (err) {
        console.error("Error fetching furniture data:", err);
        setError((prevError) => 
          prevError ? `${prevError} Also failed to fetch furniture data.` : "Failed to fetch furniture data."
        );
        setDataStatus(prev => ({...prev, furniture: { loaded: true, error: true }}));
      }
    };

    const fetchRevenueData = async () => {
      try {
        const headersList = {
          "Content-Type": "application/json"
        };

        const response = await fetch(`http://localhost:10007/api/v1/booking/revenue_statistics?period=${selectedPeriod}`, { 
          method: "GET",
          headers: headersList
        });

        if (!response.ok) {
          throw new Error('Failed to fetch revenue data');
        }

        const result = await response.json();
        
        if (result && result.data) {
          const statsData = result.data;
          
          setRevenueData(statsData.period_data || statsData.monthly_data || []);
          setPurchaseHistory(statsData.transactions || []);
          
          setDataStatus(prev => ({
            ...prev, 
            revenue: { loaded: true, error: false },
            purchases: { loaded: true, error: false }
          }));
        } else {
          setRevenueData([]);
          setPurchaseHistory([]);
          console.warn("No revenue data available from API");
          setDataStatus(prev => ({
            ...prev,
            revenue: { loaded: true, error: false },
            purchases: { loaded: true, error: false }
          }));
        }
      } catch (err) {
        console.error("Error fetching revenue statistics:", err);
        setError((prevError) => 
          prevError ? `${prevError} Also failed to fetch revenue data.` : "Failed to fetch revenue data."
        );
        setDataStatus(prev => ({
          ...prev,
          revenue: { loaded: true, error: true },
          purchases: { loaded: true, error: true }
        }));
        setRevenueData([]);
        setPurchaseHistory([]);
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      setDataStatus({
        users: { loaded: false, error: false },
        furniture: { loaded: false, error: false },
        revenue: { loaded: false, error: false },
        purchases: { loaded: false, error: false }
      });

      await Promise.all([
        fetchUsers(), 
        fetchFurnitureData(), 
        fetchRevenueData()
      ]);
      
      setLoading(false);
    };

    fetchAllData();
  }, [selectedPeriod]);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // const prepareRevenueData = (data: any[]) => {
  //   return data.map(item => ({
  //     month: item.month || 'Unknown',
  //     rentRevenue: item.rentRevenue || 0,
  //     saleRevenue: item.saleRevenue || 0,
  //     totalRevenue: item.totalRevenue || 0
  //   }));
  // };

  // const extractDisplayName = (fullName: string) => {
  //   if (!fullName || fullName === "Unknown User") return "Unknown";
    
  //   const nameParts = fullName.trim().split(' ');
    
  //   if (nameParts.length === 0) return "Unknown";
  //   if (nameParts.length === 1) return nameParts[0];
    
  //   return nameParts[0].length < 2 ? nameParts[nameParts.length - 1] : nameParts[0];
  // };

  const fetchUserDetails = async (userId: string) => {
    if (!userId) return null;
    
    if (userCache[userId]) {
      return userCache[userId];
    }

    // Skip fetch if we already tried and failed to fetch this user
    if (failedUserIds.has(userId)) {
      return {
        firstName: "Unknown",
        lastName: "User"
      };
    }

    try {
      // Use the exact headers from the working example
      const headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)"
      };

      // Log the request for debugging
      console.log("Fetching user with ID:", userId);

      // Use the exact API endpoint format from the example
      const response = await fetch(`http://127.0.0.1:10007/api/v1/auth/user/fetch/${userId}`, { 
        method: "GET",
        headers: headersList
      });

      if (!response.ok) {
        // Add to failed IDs set so we don't try again
        setFailedUserIds(prev => new Set([...prev, userId]));
        return {
          firstName: "Unknown",
          lastName: "User"
        };
      }

      const data = await response.json();
      
      if (data && data.data) {
        const userDetails = {
          firstName: data.data.first_name || '',
          lastName: data.data.last_name || ''
        };
        
        setUserCache(prev => ({
          ...prev,
          [userId]: userDetails
        }));
        
        return userDetails;
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      // Add to failed IDs so we don't retry
      setFailedUserIds(prev => new Set([...prev, userId]));
      return {
        firstName: "Unknown",
        lastName: "User"
      };
    }
    
    // Add to failed IDs if we reached here (fallback case)
    setFailedUserIds(prev => new Set([...prev, userId]));
    return {
      firstName: "Unknown",
      lastName: "User"
    };
  };

  const fetchFurnitureCategory = async (furnitureId: string, furnitureName: string) => {
    if (furnitureName && furnitureName !== "Unknown Item") return null;

    if (furnitureId && furnitureCache[furnitureId]) {
      return furnitureCache[furnitureId];
    }

    if (!furnitureId) {
      return { category: "Furniture" };
    }

    try {
      const headersList = { 
        "Content-Type": "application/json" 
      };

      // Log the request for debugging
      console.log("Fetching furniture with ID:", furnitureId);

      // Direct API call to get specific furniture item by ID
      const response = await fetch(`http://127.0.0.1:10007/api/v1/furniture/${furnitureId}`, { 
        method: "GET",
        headers: headersList
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch furniture data: ${response.status}`);
      }

      const result = await response.json();
      
      if (result && result.data) {
        const furnitureDetails = {
          category: result.data.category || "Furniture"
        };
        
        // Cache the result
        setFurnitureCache(prev => ({
          ...prev,
          [furnitureId]: furnitureDetails
        }));
        
        return furnitureDetails;
      }
    } catch (err) {
      console.error("Error fetching furniture category:", err);
    }

    return { category: "Furniture" };
  };

  useEffect(() => {
    const enrichPurchaseWithFurnitureData = async () => {
      if (purchaseHistory.length === 0) return;

      let hasUpdates = false;
      const updatedPurchases = [...purchaseHistory];

      for (let i = 0; i < updatedPurchases.length; i++) {
        const purchase = updatedPurchases[i];

        if ((purchase.furnitureName && purchase.furnitureName !== "Unknown Item") || purchase.furnitureCategory) {
          continue;
        }

        const furnitureDetails = await fetchFurnitureCategory(
          purchase.furnitureId,
          purchase.furnitureName
        );

        if (furnitureDetails) {
          updatedPurchases[i] = {
            ...purchase,
            furnitureCategory: furnitureDetails.category
          };
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        setPurchaseHistory(updatedPurchases);
      }
    };

    enrichPurchaseWithFurnitureData();
  }, [purchaseHistory]);

  useEffect(() => {
    const enrichPurchaseHistory = async () => {
      if (purchaseHistory.length === 0) return;
      
      let hasUpdates = false;
      const updatedPurchases = [...purchaseHistory];
      
      for (let i = 0; i < updatedPurchases.length; i++) {
        const purchase = updatedPurchases[i];
        
        if (!purchase.userId || (purchase.userFirstName && purchase.userLastName)) {
          continue;
        }
        
        // Skip users we've already failed to fetch
        if (failedUserIds.has(purchase.userId)) {
          updatedPurchases[i] = {
            ...purchase,
            userFirstName: "Unknown",
            userLastName: "User"
          };
          hasUpdates = true;
          continue;
        }
        
        const userDetails = await fetchUserDetails(purchase.userId);
        
        if (userDetails) {
          updatedPurchases[i] = {
            ...purchase,
            userFirstName: userDetails.firstName,
            userLastName: userDetails.lastName
          };
          hasUpdates = true;
        }
      }
      
      if (hasUpdates) {
        setPurchaseHistory(updatedPurchases);
      }
    };
    
    enrichPurchaseHistory();
  }, [purchaseHistory.length, failedUserIds]); // Only re-run when length changes or failed IDs change

  const RevenueDetailsModal = () => {
    const totalRevenue = revenueData.length > 0 
      ? revenueData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0)
      : 0;
    
    const totalRentRevenue = revenueData.length > 0
      ? revenueData.reduce((sum, item) => sum + (item.rentRevenue || 0), 0)
      : 0;
    
    const totalSaleRevenue = revenueData.length > 0
      ? revenueData.reduce((sum, item) => sum + (item.saleRevenue || 0), 0)
      : 0;

    const handlePeriodChange = (period: 'day' | 'week' | 'month' | 'year') => {
      setSelectedPeriod(period);
    };

    const getPeriodName = (period: string) => {
      switch(period) {
        case 'day': return 'Daily';
        case 'week': return 'Weekly';
        case 'month': return 'Monthly';
        case 'year': return 'Yearly';
        default: return 'Monthly';
      }
    };

    return (
      <AnimatePresence>
        {showRevenueDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRevenueDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FiTrendingUp className="text-indigo-600 mr-2" />
                  Revenue Details
                </h2>
                <button 
                  onClick={() => setShowRevenueDetails(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-4 text-white shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100">Total Revenue</p>
                        <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="bg-white bg-opacity-30 p-3 rounded-full">
                        <FiDollarSign className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Rent Revenue</p>
                        <p className="text-3xl font-bold">${totalRentRevenue.toLocaleString()}</p>
                      </div>
                      <div className="bg-white bg-opacity-30 p-3 rounded-full">
                        <FiPackage className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-4 text-white shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-teal-100">Sale Revenue</p>
                        <p className="text-3xl font-bold">${totalSaleRevenue.toLocaleString()}</p>
                      </div>
                      <div className="bg-white bg-opacity-30 p-3 rounded-full">
                        <FiShoppingBag className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6 flex space-x-2 bg-gray-100 p-1 rounded-lg max-w-md">
                  {(['day', 'week', 'month', 'year'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => handlePeriodChange(period)}
                      className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors
                        ${selectedPeriod === period 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      {getPeriodName(period)}
                    </button>
                  ))}
                </div>
                
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    className={`py-2 px-4 font-medium ${detailedView === 'monthly' 
                      ? 'text-indigo-600 border-b-2 border-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setDetailedView('monthly')}
                  >
                    <FiCalendar className="inline mr-2" />
                    Monthly Breakdown
                  </button>
                  <button
                    className={`py-2 px-4 font-medium ${detailedView === 'transactions' 
                      ? 'text-indigo-600 border-b-2 border-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setDetailedView('transactions')}
                  >
                    <FiInfo className="inline mr-2" />
                    Transaction History
                  </button>
                </div>
                
                {detailedView === 'monthly' ? (
                  <>
                    <div className="mb-8 h-80">
                      {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={revenueData}
                            margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="label" 
                              stroke="#6b7280" 
                              tick={{ fill: '#4b5563', fontSize: 12 }}
                            />
                            <YAxis 
                              stroke="#6b7280" 
                              tickFormatter={(value) => `$${value}`}
                              tick={{ fill: '#4b5563', fontSize: 12 }}
                              domain={[0, 'dataMax + 1000']}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: 'none', 
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                              }}
                              formatter={(value: number) => [formatCurrency(value), '']}
                              labelFormatter={(label) => `${getPeriodName(selectedPeriod)}: ${label}`}
                            />
                            <Legend iconType="circle" iconSize={10} />
                            <Bar dataKey="rentRevenue" name="Rent Revenue" fill="#a855f7" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="saleRevenue" name="Sale Revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                          <p className="text-gray-500">No revenue data available</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="overflow-x-auto">
                      {revenueData.length > 0 ? (
                        <table className="min-w-full bg-white border border-gray-200 rounded-md">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getPeriodName(selectedPeriod)}</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent Revenue</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Revenue</th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {revenueData.map((item, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.label}</td>
                                <td className="py-3 px-4 text-sm text-gray-500">${formatCurrency(item.rentRevenue)}</td>
                                <td className="py-3 px-4 text-sm text-gray-500">${formatCurrency(item.saleRevenue)}</td>
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">${formatCurrency(item.totalRevenue)}</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-100">
                              <td className="py-3 px-4 text-sm font-bold text-gray-900">Total</td>
                              <td className="py-3 px-4 text-sm font-bold text-gray-900">${formatCurrency(totalRentRevenue)}</td>
                              <td className="py-3 px-4 text-sm font-bold text-gray-900">${formatCurrency(totalSaleRevenue)}</td>
                              <td className="py-3 px-4 text-sm font-bold text-gray-900">${formatCurrency(totalRevenue)}</td>
                            </tr>
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                          No revenue data available
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="overflow-x-auto">
                    {purchaseHistory.length > 0 ? (
                      <table className="min-w-full bg-white border border-gray-200 rounded-md">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {purchaseHistory.map((purchase, index) => (
                            <tr key={purchase.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="py-3 px-4 text-sm text-gray-500">{formatDate(purchase.date)}</td>
                              <td className="py-3 px-4 text-sm">
                                <UserDisplay userName={purchase.userName || "Unknown User"} userId={purchase.userId} />
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <TransactionItem purchase={purchase} />
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  purchase.type === 'Rent' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-teal-100 text-teal-800'
                                }`}>
                                  {purchase.type}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">${formatCurrency(purchase.amount)}</td>
                              <td className="py-3 px-4 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  purchase.status === 'Completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : purchase.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {purchase.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        No transaction history available
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button 
                  onClick={() => setShowRevenueDetails(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mr-2"
                >
                  Close
                </button>
                {(revenueData.length > 0 || purchaseHistory.length > 0) && (
                  <button 
                    onClick={() => alert("Export functionality would be implemented here")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Export Data
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

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

  const TransactionItem = ({ purchase }: { purchase: any }) => {
    const displayName = purchase.furnitureCategory 
      ? purchase.furnitureCategory
      : purchase.furnitureName && purchase.furnitureName !== "Unknown Item"
        ? purchase.furnitureName
        : "Unknown Item";

    return (
      <div className="flex items-center">
        {purchase.furnitureImage ? (
          <img 
            src={purchase.furnitureImage} 
            alt={displayName} 
            className="w-10 h-10 object-cover rounded-md mr-3"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=No+Image';
            }}
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center mr-3">
            <FiPackage className="text-gray-500" />
          </div>
        )}
        <span className="text-gray-800 font-medium line-clamp-1">{displayName}</span>
      </div>
    );
  };

  const UserDisplay = ({ userName, userId }: { userName: string, userId?: string }) => {
    const userInfo = userId ? userCache[userId] : null;
    const displayName = userInfo ? 
      `${userInfo.firstName} ${userInfo.lastName}`.trim() : 
      userName;
    
    const initials = displayName
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase() || "UN";
    
    return (
      <div className="flex items-center">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
          <span className="text-indigo-700 font-medium">
            {initials}
          </span>
        </div>
        <span className="text-gray-900 font-medium">{displayName}</span>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="fixed top-0 left-0 h-full">
      <Sidebar />
      </div>

      <div className="flex-1 ml-72 flex flex-col">
      <AdminHeader />

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
          Welcome back, <span className="text-teal-600 dark:text-teal-500">Admin</span> 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here's what's happening with your store today.
        </p>
        </motion.div>

        {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Total Users</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalUsers}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400">
              <FiUsers size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-500 mr-1"></span>
              Active customer accounts
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
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Moderators</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalModerators}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <FiUserCheck size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
              Support team members
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
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Delivery Boys</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalDeliveryBoys}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
              <FiUserCheck size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              Delivery personnel
              </p>
            </div>
            </div>
          </motion.div>
          
          <motion.div 
            custom={3}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Retailers</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalRetailers}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
              <FiUserCheck size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1"></span>
              Retail partners
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
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">For Rent</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalRentItems}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
              <FiPackage size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1"></span>
              Available rental furniture
              </p>
            </div>
            </div>
          </motion.div>
          
          <motion.div 
            custom={5}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">For Sale</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalSaleItems}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
              <FiShoppingBag size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
              Purchasable furniture items
              </p>
            </div>
            </div>
          </motion.div>
          </div>

          <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-8"
          >
          <div className="flex flex-wrap items-center mb-6">
            <div className="flex items-center mr-auto">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
              <FiTrendingUp className="text-indigo-600 dark:text-indigo-400 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Revenue Overview</h2>
            </div>
            
            <div className="flex flex-wrap items-center mt-4 sm:mt-0">
            <div className="mr-4 mb-2 sm:mb-0">
              <select 
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'day' | 'week' | 'month' | 'year')}
              >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <span className="flex items-center text-sm">
              <span className="w-3 h-3 bg-indigo-500 rounded-full mr-1.5"></span>
              <span className="text-slate-600 dark:text-slate-300">Rent</span>
              </span>
              <span className="flex items-center text-sm">
              <span className="w-3 h-3 bg-teal-500 rounded-full mr-1.5"></span>
              <span className="text-slate-600 dark:text-slate-300">Sale</span>
              </span>
              <span className="flex items-center text-sm">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-1.5"></span>
              <span className="text-slate-600 dark:text-slate-300">Total</span>
              </span>
            </div>
            </div>
          </div>

          <div className="h-80 mt-6">
            {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
              data={revenueData}
              margin={{ top: 10, right: 30, left: 50, bottom: 20 }}
              >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="label" 
                stroke="#6b7280" 
                tick={{ fill: '#4b5563', fontSize: 12 }}
                tickLine={{ stroke: '#9ca3af' }}
                axisLine={{ stroke: '#d1d5db' }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                stroke="#6b7280"
                tickFormatter={(value) => `$${value}`}
                tick={{ fill: '#4b5563', fontSize: 12 }}
                tickLine={{ stroke: '#9ca3af' }}
                axisLine={{ stroke: '#d1d5db' }}
                domain={['dataMin - 500', 'dataMax + 1000']}
                allowDataOverflow={false}
                scale="linear"
                width={60}
              />
              <Tooltip 
                contentStyle={{ 
                backgroundColor: '#fff', 
                border: 'none', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '10px 14px'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label) => `Month: ${label}`}
                separator=": "
                itemStyle={{ padding: '4px 0' }}
                cursor={{ strokeDasharray: '3 3' }}
                isAnimationActive={true}
              />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
                iconType="circle"
                iconSize={10}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
              <Area
                type="monotone"
                dataKey="rentRevenue"
                fill="#6366f180"
                stroke="#6366f1"
                strokeWidth={2}
                activeDot={{ r: 8, stroke: '#6366f1', strokeWidth: 2 }}
                name="Rent Revenue"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Area
                type="monotone"
                dataKey="saleRevenue"
                fill="#14b8a680"
                stroke="#14b8a6"
                strokeWidth={2}
                activeDot={{ r: 8, stroke: '#14b8a6', strokeWidth: 2 }}
                name="Sale Revenue"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
                animationBegin={300}
              />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ strokeWidth: 2, r: 5, fill: '#a855f7' }}
                activeDot={{ r: 8, stroke: '#a855f7', strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-out"
                animationBegin={600}
                name="Total Revenue"
              />
              <ReferenceLine
                y={revenueData.reduce((sum, item) => sum + item.totalRevenue, 0) / revenueData.length}
                stroke="#9333ea"
                strokeDasharray="3 3"
                label={{
                value: 'Avg Revenue',
                position: 'insideBottomRight',
                fill: '#9333ea',
                fontSize: 12
                }}
              />
              </ComposedChart>
            </ResponsiveContainer>
            ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
              <p className="text-gray-500">
              {dataStatus.revenue.error 
                ? "Error loading revenue data" 
                : "No revenue data available"}
              </p>
            </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center mb-4 sm:mb-0">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mr-3">
              <FiDollarSign className="text-emerald-600 dark:text-emerald-400 text-lg" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {revenueData.length > 0 
                ? formatCurrency(revenueData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0))
                : "$0"}
              </p>
            </div>
            </div>
            <button 
            onClick={() => setShowRevenueDetails(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={revenueData.length === 0 && purchaseHistory.length === 0}
            >
            View Details
            </button>
          </div>
          </motion.div>

          <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
          >
          <div className="flex items-center mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg mr-3">
            <FiShoppingBag className="text-amber-600 dark:text-amber-400 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Purchases</h2>
          </div>

          <div className="overflow-x-auto">
            {purchaseHistory.length > 0 ? (
            <>
              <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {purchaseHistory.slice(0, 5).map((purchase, index) => (
                <tr key={purchase.id || index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-500">{formatDate(purchase.date)}</td>
                  <td className="py-3 px-4 text-sm">
                  <UserDisplay userName={purchase.userName || "Unknown User"} userId={purchase.userId} />
                  </td>
                  <td className="py-3 px-4 text-sm">
                  <TransactionItem purchase={purchase} />
                  </td>
                  <td className="py-3 px-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    purchase.type === 'Rent' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-teal-100 text-teal-800'
                  }`}>
                    {purchase.type}
                  </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{formatCurrency(purchase.amount)}</td>
                </tr>
                ))}
              </tbody>
              </table>
              
              {purchaseHistory.length > 5 && (
              <div className="text-center mt-4">
                <button 
                onClick={() => {
                  setDetailedView('transactions');
                  setShowRevenueDetails(true);
                }}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                View All Transactions
                </button>
              </div>
              )}
            </>
            ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              {dataStatus.purchases.error 
              ? "Error loading purchase data" 
              : "No purchase history available"}
            </div>
            )}
          </div>
          </motion.div>
        </>
        )}
      </main>

      <AdminFooter />
      </div>
      
      <RevenueDetailsModal />
    </div>
  );
};

export default Dashboard;