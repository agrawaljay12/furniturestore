import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/UserSidebar';
import UserHeader from '../../components/UserHeader';
import AdminFooter from "../../components/admin/AdminFooter";
import { FaCouch, FaShoppingCart, FaListAlt, FaChartLine, FaDollarSign, FaCreditCard, FaShoppingBag, FaBox } from 'react-icons/fa';
import { ResponsiveContainer,  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,  ComposedChart, Area, ReferenceLine } from 'recharts';

const RetailerDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [totalFurniture, setTotalFurniture] = useState(0);
  const [forSaleFurniture, setForSaleFurniture] = useState(0);
  const [forRentFurniture, setForRentFurniture] = useState(0);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [rentRevenue, setRentRevenue] = useState(0);
  const [saleRevenue, setSaleRevenue] = useState(0);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);
  const [userCache,] = useState<{[key: string]: {firstName: string, lastName: string}}>({});
  

  type FurnitureItem = {
    is_for_sale: boolean;
    is_for_rent: boolean;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'true' || (savedTheme === null && prefersDark);
    setDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const getUserId = () => {
    const possibleKeys = ['userId', 'user_id', 'token', 'id', 'retailerId'];
    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`Found user identifier in localStorage with key: ${key}`);
        return value;
      }
    }
    return null;
  };

  useEffect(() => {
    const checkAuth = () => {
      const userId = getUserId();
      if (!userId) {
        console.error("User ID not available in localStorage. User might not be logged in.");
        setRevenueError("Authentication required. Please login again.");
        return false;
      }
      return true;
    };
    if (checkAuth()) {
      fetchFurniture();
      fetchRevenueData();
    }
  }, [selectedPeriod]);

  const fetchFurniture = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        console.error("User ID is not available in localStorage");
        return;
      }
      let headersList = {
        "Content-Type": "application/json"
      };
      console.log(`Fetching furniture for user ID: ${userId}`);
      
      // Use the working endpoint directly to avoid unnecessary API calls
      let response = await fetch(`https://furnspace.onrender.com/api/v1/furniture/list_all_furniture`, { 
        method: "GET",
        headers: headersList
      });
      
      if (response.ok) {
        const allFurniture = await response.json();
        if (allFurniture.data && Array.isArray(allFurniture.data)) {
          // Filter by user ID
          const userFurniture = allFurniture.data.filter((item: any) => item.created_by === userId);
          setTotalFurniture(userFurniture.length);
          const forSaleCount = userFurniture.filter((item: FurnitureItem) => item.is_for_sale === true).length;
          setForSaleFurniture(forSaleCount);
          const forRentCount = userFurniture.filter((item: FurnitureItem) => item.is_for_rent === true).length;
          setForRentFurniture(forRentCount);
        } else {
          console.warn("No furniture data returned or invalid format");
          setTotalFurniture(0);
          setForSaleFurniture(0);
          setForRentFurniture(0);
        }
      } else {
        console.error(`Failed to fetch furniture: ${response.status}`);
        setTotalFurniture(0);
        setForSaleFurniture(0);
        setForRentFurniture(0);
      }
    } catch (error) {
      console.error("Error fetching furniture data:", error);
      setTotalFurniture(0);
      setForSaleFurniture(0);
      setForRentFurniture(0);
    }
  };

  const fetchRevenueData = async () => {
    setIsLoadingRevenue(true);
    setRevenueError(null);
    setIsLoadingPurchases(true);
    setPurchasesError(null);
    try {
      const userId = getUserId();
      console.log("User ID from localStorage:", userId);
      if (!userId) {
        setRevenueError("User ID not found. Please log in again.");
        setPurchasesError("User ID not found. Please log in again.");
        setIsLoadingRevenue(false);
        setIsLoadingPurchases(false);
        return;
      }
      console.log(`Fetching revenue data for user ID: ${userId}`);
      let headersList = {
        "Content-Type": "application/json"
      };
      let response = await fetch(`https://furnspace.onrender.com/api/v1/booking/seller_revenue/${userId}?period=${selectedPeriod}`, { 
        method: "GET",
        headers: headersList
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch revenue data: ${response.status}`);
      }
      let result = await response.json();
      console.log("Revenue data:", result);
      if (result.data) {
        setRevenueData(result.data.period_data || []);
        setTotalRevenue(result.data.total_revenue || 0);
        setRentRevenue(result.data.rent_revenue || 0);
        setSaleRevenue(result.data.sale_revenue || 0);
        setPurchaseHistory(result.data.transactions || []);
      } else {
        setRevenueData([]);
        setTotalRevenue(0);
        setRentRevenue(0);
        setSaleRevenue(0);
        setPurchaseHistory([]);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setRevenueError(error instanceof Error ? error.message : "An unknown error occurred");
      setPurchasesError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoadingRevenue(false);
      setIsLoadingPurchases(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

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

  const getPeriodName = (period: string) => {
    switch(period) {
      case 'day': return 'Daily';
      case 'week': return 'Weekly';
      case 'month': return 'Monthly';
      case 'year': return 'Yearly';
      default: return 'Monthly';
    }
  };

  // Create a local fallback image base64 data URL instead of using external services
  const fallbackImageBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNlMmU4ZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNnB4IiBmaWxsPSIjOTRhM2I4Ij5Ob1BJPC90ZXh0Pjwvc3ZnPg==";

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
        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mr-2">
          <span className="text-indigo-700 dark:text-indigo-300 font-medium">
            {initials}
          </span>
        </div>
        <span className="text-gray-900 dark:text-gray-100 font-medium">{displayName}</span>
      </div>
    );
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
              // Use local fallback image instead of external placeholder service
              (e.target as HTMLImageElement).src = fallbackImageBase64;
            }}
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
            <FaBox className="text-gray-500 dark:text-gray-400" />
          </div>
        )}
        <span className="text-gray-800 dark:text-gray-200 font-medium line-clamp-1">{displayName}</span>
      </div>
    );
  };

  const Spinner = () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
    </div>
  );

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col w-full ml-0 lg:ml-72">
        <div className="sticky top-0 z-50 w-full">
          <UserHeader />
        </div>
        <main className={`flex-1 p-6 overflow-y-auto transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
          {revenueError && revenueError.includes("Authentication") && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
              <p className="text-red-700 dark:text-red-400 font-medium">{revenueError}</p>
              <p className="text-red-600 dark:text-red-300 mt-1">Please go to the login page to authenticate again. Your session may have expired.</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                If you've just logged in and still see this message, there might be an issue with how the user ID is stored.
                Please contact support or try clearing your browser cache and logging in again.
              </p>
            </div>
          )}
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Furniture Manager
                </h1>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Manage your furniture inventory and listings
                </p>
              </div>
              <div className="flex gap-3">
                <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Furniture
                </button>
                <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  View Inventory
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
                darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-white border border-gray-100'
              }`}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-4xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        {totalFurniture}
                      </p>
                      <h2 className={`text-sm uppercase tracking-wider font-semibold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        Total Furniture
                      </h2>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Items in your inventory
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${darkMode ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
                      <FaListAlt className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} text-xl`} />
                    </div>
                  </div>
                  
                </div>
              </div>
              
              <div className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
                darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-white border border-gray-100'
              }`}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-4xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        {forSaleFurniture}
                      </p>
                      <h2 className={`text-sm uppercase tracking-wider font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        For Sale
                      </h2>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Available for purchase
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${darkMode ? 'bg-green-900/40' : 'bg-green-100'}`}>
                      <FaShoppingCart className={`${darkMode ? 'text-green-400' : 'text-green-600'} text-xl`} />
                    </div>
                  </div>
                 
                </div>
              </div>
              
              <div className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
                darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-white border border-gray-100'
              }`}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-4xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        {forRentFurniture}
                      </p>
                      <h2 className={`text-sm uppercase tracking-wider font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        For Rent
                      </h2>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Available for rental
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${darkMode ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                      <FaCouch className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-xl`} />
                    </div>
                  </div>
                 
                </div>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl shadow-sm overflow-hidden mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg mr-3 ${darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                    <FaChartLine className={darkMode ? 'text-indigo-400 text-lg' : 'text-indigo-600 text-lg'} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Revenue Analytics</h2>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Track your sales and rental performance
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center mt-4 sm:mt-0">
                  <div className="mr-4 mb-2 sm:mb-0">
                    <select 
                      className={`px-3 py-1.5 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-slate-200' : 'bg-white border-gray-200 text-slate-800'
                      }`}
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
                      <span className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Rent</span>
                    </span>
                    <span className="flex items-center text-sm">
                      <span className="w-3 h-3 bg-teal-500 rounded-full mr-1.5"></span>
                      <span className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Sale</span>
                    </span>
                    <span className="flex items-center text-sm">
                      <span className="w-3 h-3 bg-purple-500 rounded-full mr-1.5"></span>
                      <span className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Total</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {revenueError && (
                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-red-700 dark:text-red-400">{revenueError}</p>
                </div>
              )}
              <div className="h-80 mt-6">
                {isLoadingRevenue ? (
                  <Spinner />
                ) : revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={revenueData}
                      margin={{ top: 10, right: 30, left: 50, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#f0f0f0"} />
                      <XAxis 
                        dataKey="label" 
                        stroke={darkMode ? "#9ca3af" : "#6b7280"} 
                        tick={{ fill: darkMode ? '#d1d5db' : '#4b5563', fontSize: 12 }}
                        tickLine={{ stroke: darkMode ? '#6b7280' : '#9ca3af' }}
                        axisLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis 
                        stroke={darkMode ? "#9ca3af" : "#6b7280"}
                        tickFormatter={(value) => `$${value}`}
                        tick={{ fill: darkMode ? '#d1d5db' : '#4b5563', fontSize: 12 }}
                        tickLine={{ stroke: darkMode ? '#6b7280' : '#9ca3af' }}
                        axisLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
                        domain={['dataMin - 500', 'dataMax + 1000']}
                        allowDataOverflow={false}
                        scale="linear"
                        width={60}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? '#1f2937' : '#fff', 
                          border: 'none', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          padding: '10px 14px',
                          color: darkMode ? '#f3f4f6' : '#111827'
                        }}
                        formatter={(value: number) => [formatCurrency(value), '']}
                        labelFormatter={(label) => `${getPeriodName(selectedPeriod)}: ${label}`}
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
                        fill={darkMode ? "#6366f180" : "#6366f180"}
                        stroke={darkMode ? "#8388ff" : "#6366f1"}
                        strokeWidth={2}
                        activeDot={{ r: 8, stroke: darkMode ? "#8388ff" : "#6366f1", strokeWidth: 2 }}
                        name="Rent Revenue"
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Area
                        type="monotone"
                        dataKey="saleRevenue"
                        fill={darkMode ? "#14b8a680" : "#14b8a680"}
                        stroke={darkMode ? "#2dd4c2" : "#14b8a6"}
                        strokeWidth={2}
                        activeDot={{ r: 8, stroke: darkMode ? "#2dd4c2" : "#14b8a6", strokeWidth: 2 }}
                        name="Sale Revenue"
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        animationBegin={300}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalRevenue"
                        stroke={darkMode ? "#c77dff" : "#a855f7"}
                        strokeWidth={3}
                        dot={{ strokeWidth: 2, r: 5, fill: darkMode ? "#c77dff" : "#a855f7" }}
                        activeDot={{ r: 8, stroke: darkMode ? "#c77dff" : "#a855f7", strokeWidth: 2 }}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        animationBegin={600}
                        name="Total Revenue"
                      />
                      {revenueData.length > 1 && (
                        <ReferenceLine
                          y={revenueData.reduce((sum, item) => sum + item.totalRevenue, 0) / revenueData.length}
                          stroke={darkMode ? "#bb8eff" : "#9333ea"}
                          strokeDasharray="3 3"
                          label={{
                            value: 'Avg Revenue',
                            position: 'insideBottomRight',
                            fill: darkMode ? "#bb8eff" : "#9333ea",
                            fontSize: 12
                          }}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={`flex items-center justify-center h-full rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No revenue data available for this period</p>
                  </div>
                )}
              </div>
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                <div className={`rounded-lg p-4 shadow-sm transition-colors duration-300 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'
                }`}>
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${darkMode ? 'bg-purple-900/40' : 'bg-purple-100'}`}>
                      <FaDollarSign className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</p>
                      <p className={`text-xl font-bold ${darkMode ? 'text-white' : ''}`}>{formatCurrency(totalRevenue)}</p>
                    </div>
                  </div>
                </div>
                <div className={`rounded-lg p-4 shadow-sm transition-colors duration-300 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'
                }`}>
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${darkMode ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
                      <FaCouch className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rent Revenue</p>
                      <p className={`text-xl font-bold ${darkMode ? 'text-white' : ''}`}>{formatCurrency(rentRevenue)}</p>
                    </div>
                  </div>
                </div>
                <div className={`rounded-lg p-4 shadow-sm transition-colors duration-300 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-100'
                }`}>
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${darkMode ? 'bg-teal-900/40' : 'bg-teal-100'}`}>
                      <FaCreditCard className={darkMode ? 'text-teal-400' : 'text-teal-600'} />
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sale Revenue</p>
                      <p className={`text-xl font-bold ${darkMode ? 'text-white' : ''}`}>{formatCurrency(saleRevenue)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg mr-3 ${darkMode ? 'bg-amber-900/40' : 'bg-amber-100'}`}>
                    <FaShoppingBag className={darkMode ? 'text-amber-400 text-lg' : 'text-amber-600 text-lg'} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Recent Purchases</h2>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Latest customer transactions
                    </p>
                  </div>
                </div>
                
                <button className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}>
                  <span>View All</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
              
              {purchasesError && (
                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-red-700 dark:text-red-400">{purchasesError}</p>
                </div>
              )}
              <div className="overflow-x-auto">
                {isLoadingPurchases ? (
                  <Spinner />
                ) : purchaseHistory.length > 0 ? (
                  <>
                    <table className={`min-w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <tr>
                          <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>Date</th>
                          <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>User</th>
                          <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>Item</th>
                          <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>Type</th>
                          <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>Amount</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {purchaseHistory.slice(0, 5).map((purchase, index) => {
                          const timestamp = new Date(purchase.date || Date.now()).getTime();
                          const randomPart = Math.random().toString(36).substring(2, 10);
                          const uniqueKey = [
                            purchase.id,
                            purchase.transaction_id,
                            purchase.booking_id, 
                            purchase._id,
                            `item-${index}`,
                            `time-${timestamp}`,
                            randomPart
                          ].filter(Boolean).join('-');
                          return (
                            <tr key={uniqueKey} className={`hover:bg-opacity-80 transition duration-150 ${
                              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}>
                              <td className={`py-3 px-4 text-sm ${
                                darkMode ? 'text-gray-300' : 'text-gray-500'
                              }`}>{formatDate(purchase.date)}</td>
                              <td className="py-3 px-4 text-sm">
                                <UserDisplay userName={purchase.userName || "Unknown User"} userId={purchase.userId} />
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <TransactionItem purchase={purchase} />
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  purchase.type === 'Rent' 
                                    ? darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'
                                    : darkMode ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-800'
                                }`}>
                                  {purchase.type}
                                </span>
                              </td>
                              <td className={`py-3 px-4 text-sm font-medium ${
                                darkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}>{formatCurrency(purchase.amount)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {purchaseHistory.length > 5 && (
                      <div className="text-center mt-4">
                        <button 
                          onClick={() => { }}
                          className={`hover:underline font-medium transition-colors duration-300 ${
                            darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                          }`}
                        >
                          View All Transactions
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={`text-center py-8 rounded-lg ${
                    darkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-50'
                  }`}>
                    No purchase history available
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default RetailerDashboard;