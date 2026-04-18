import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../../../components/user/MainHeader";
import MainFooter from "../../../../components/user/MainFooter";

// Define interfaces for our data types
interface FurnitureDetail {
  _id: string;
  title: string;
  category: string;
  image?: string;
  images?: string[];
  price: number;
  rent_price: string;
}

interface PaymentHistoryItem {
  payment_id: string;
  payment_date: string;
  payment_amount: number;
  payment_status: string;
  payment_method: string;
}

interface BookingDetail {
  _id: string;
  booking_id?: string;
  user_id: string;
  user_name?: string;
  user_phone?: string;
  furniture_id: string[];
  booking_date: string;
  booking_status: string;
  duration?: number;
  total_price: number;
  payment_id: string;
  payment_status: string;
  payment_method: string;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  };
  payment_date: string;
  is_buying: boolean;
  furniture_details: FurnitureDetail[];
  payment_history?: PaymentHistoryItem[];
}

// Improve the getProductImage function to handle URL formatting
const getProductImage = (furniture: FurnitureDetail): string => {
  let imagePath = "";
  
  if (furniture.images && furniture.images.length > 0) {
    imagePath = furniture.images[0];
  } else if (furniture.image) {
    imagePath = furniture.image;
  } else {
    return "https://via.placeholder.com/100?text=No+Image";
  }
  
  // Check if the image path is already a complete URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, assume it's a relative path and prefix with server URL
  return `https://furnspace.onrender.com${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const PaymentHistoryPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all"); // all, completed, pending, failed
  const [sortBy, setSortBy] = useState<string>("date-desc"); // date-desc, date-asc, amount-desc, amount-asc
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: "",
    end: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      const userId = localStorage.getItem("token");
      if (!userId) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://furnspace.onrender.com/api/v1/booking/user/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.data) {
          setBookings(data.data);
        } else {
          setBookings([]);
        }
      } catch (err) {
        setError(`Error fetching payment history: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  // Helper function to format dates nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate total spent
  const calculateTotalSpent = (): number => {
    return bookings.reduce((total, booking) => {
      if (booking.payment_status === "completed") {
        return total + booking.total_price;
      }
      return total;
    }, 0);
  };

  // Filter bookings based on current filter state
  const getFilteredBookings = (): BookingDetail[] => {
    let filtered = [...bookings];

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter(booking => booking.payment_status === filter);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.payment_id.toLowerCase().includes(term) || 
        booking._id.toLowerCase().includes(term) ||
        (booking.furniture_details && booking.furniture_details.some(furniture => 
          furniture.title.toLowerCase().includes(term)
        ))
      );
    }

    // Apply date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(booking => new Date(booking.payment_date) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      // Add one day to include the end date fully
      endDate.setDate(endDate.getDate() + 1); 
      filtered = filtered.filter(booking => new Date(booking.payment_date) <= endDate);
    }

    // Apply sorting
    return sortBookings(filtered);
  };

  // Sort bookings based on current sort state
  const sortBookings = (bookingsToSort: BookingDetail[]): BookingDetail[] => {
    const sorted = [...bookingsToSort];
    
    switch (sortBy) {
      case "date-desc":
        return sorted.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
      case "date-asc":
        return sorted.sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());
      case "amount-desc":
        return sorted.sort((a, b) => b.total_price - a.total_price);
      case "amount-asc":
        return sorted.sort((a, b) => a.total_price - b.total_price);
      default:
        return sorted;
    }
  };

  // Get color class based on payment status
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get icon for payment method
  const getPaymentMethodIcon = (method: string): string => {
    switch (method.toLowerCase()) {
      case "paypal":
        return "💳"; // PayPal icon - replace with actual icon in production
      case "credit card":
        return "💳"; // Credit card icon
      case "bank transfer":
        return "🏦"; // Bank icon
      case "cash":
        return "💵"; // Cash icon
      default:
        return "💰"; // Generic payment icon
    }
  };

  // Count bookings by status for summary
  const countBookingsByStatus = () => {
    const counts = {
      completed: 0,
      pending: 0,
      failed: 0
    };

    bookings.forEach(booking => {
      if (booking.payment_status === "completed") counts.completed++;
      else if (booking.payment_status === "pending") counts.pending++;
      else if (booking.payment_status === "failed") counts.failed++;
    });

    return counts;
  };

  const statusCounts = countBookingsByStatus();
  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 shadow-lg">
        <MainHeader logoText="Furniture Store" onSearch={() => {}} />
      </div>

      <div className="min-h-screen bg-gray-50 px-4 md:px-8 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 text-gray-800 text-center">
            Your Payment History
          </h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
              <h3 className="text-lg font-medium text-gray-600">Total Spent</h3>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(calculateTotalSpent())}</p>
              <p className="text-sm text-gray-500 mt-1">Across {bookings.length} transactions</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-medium text-gray-600">Completed Payments</h3>
              <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
              <p className="text-sm text-gray-500 mt-1">Successfully processed</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <h3 className="text-lg font-medium text-gray-600">Pending Payments</h3>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              <p className="text-sm text-gray-500 mt-1">Awaiting confirmation</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <h3 className="text-lg font-medium text-gray-600">Failed Payments</h3>
              <p className="text-2xl font-bold text-red-600">{statusCounts.failed}</p>
              <p className="text-sm text-gray-500 mt-1">Require attention</p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  id="status-filter"
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              {/* Sort By */}
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select 
                  id="sort-by"
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="date-asc">Date (Oldest First)</option>
                  <option value="amount-desc">Amount (High to Low)</option>
                  <option value="amount-asc">Amount (Low to High)</option>
                </select>
              </div>
              
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search payments..."
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Date Range Picker would be here */}
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <label htmlFor="date-start" className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    id="date-start"
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="date-end" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    id="date-end"
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {filteredBookings.length} of {bookings.length} payments
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {/* Payment List */}
          {filteredBookings.length > 0 ? (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Header with payment info */}
                  <div className="p-6 border-b flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getPaymentMethodIcon(booking.payment_method)}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{booking.payment_method}</h3>
                          <p className="text-gray-500 text-sm">
                            {formatDate(booking.payment_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-xl">{formatCurrency(booking.total_price)}</p>
                        <p className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(booking.payment_status)}`}>
                          {booking.payment_status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product summary */}
                  <div className="px-6 py-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      {booking.is_buying ? "Purchased Items" : "Rented Items"}
                    </h4>
                    
                    <div className="flex flex-wrap gap-2">
                      {booking.furniture_details.map((furniture) => (
                        <div key={furniture._id} className="flex items-center bg-white p-2 rounded border">
                          <img 
                            src={getProductImage(furniture)} 
                            alt={furniture.title}
                            className="w-10 h-10 object-cover rounded mr-2"
                            onError={(e) => {
                              console.log("Failed to load thumbnail image:", e.currentTarget.src);
                              e.currentTarget.src = "https://via.placeholder.com/40?text=No+Image";
                            }}
                          />
                          <div className="text-sm">
                            <p className="font-medium truncate max-w-[120px]">{furniture.title}</p>
                            <p className="text-xs text-gray-500">{furniture.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Type & ID */}
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                      <p>Order Type: {booking.is_buying ? "Purchase" : `Rental (${booking.duration || 0} days)`}</p>
                      <p>Order ID: {booking._id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-medium mt-4">No Payment History Found</h3>
              <p className="text-gray-500 mt-2">There are no payments matching your search criteria.</p>
              <button 
                onClick={() => {
                  setFilter("all");
                  setSortBy("date-desc");
                  setSearchTerm("");
                  setDateRange({start: "", end: ""});
                }}
                className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate("/bookings")}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300"
            >
              View All Bookings
            </button>
          </div>
        </div>
      </div>

      <MainFooter />
    </>
  );
};

export default PaymentHistoryPage;
