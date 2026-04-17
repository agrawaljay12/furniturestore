import React, { useEffect, useState } from 'react';
import { 
  Button,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip
} from '@mui/material';
import DeliveryHeader from '../../components/admin/DeliveryHeader';
import DeliverySidebar from '../../components/admin/DeliverySidebar';
import { FiPackage, FiUser, FiMapPin, FiCalendar, FiDollarSign } from "react-icons/fi";

// Updated booking interface to match the API response structure
interface Booking {
  _id: string;
  userName: string;
  furnitureItems: Array<{
    id: string;
    title: string;
    category: string;
    image?: string;
  }>;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  address: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentId?: string;
}

// Updated interface for the API response
// interface BookingResponse {
//   message: string;
//   data: {
//     _id: string;
//     user_id: string;
//     furniture_id: string[];
//     booking_date: string;
//     booking_status: string;
//     duration: number | null;
//     total_price: number;
//     payment_id: string;
//     payment_status: string;
//     payment_method: string;
//     delivery_address: {
//       street: string;
//       city: string;
//       state: string;
//       country: string;
//       zipcode: string;
//     };
//     payment_date: string;
//     is_buying: boolean;
//   }
// }

const fetchUserDetails = async (userId: string) => {
  try {
    const headersList = {
      "Accept": "*/*",
      "Content-Type": "application/json"
    };

    // Try the first endpoint format
    let response = await fetch(`http://127.0.0.1:10007/api/v1/auth/user/fetch/${userId}`, {
      method: "GET",
      headers: headersList
    });

    // If first endpoint fails, try alternative endpoint
    if (!response.ok) {
      console.log(`First user endpoint failed for ${userId}, trying alternative...`);
      response = await fetch(`http://127.0.0.1:10007/api/v1/auth/user/${userId}`, {
        method: "GET",
        headers: headersList
      });
    }

    // If response is successful, parse the data
    if (response.ok) {
      const userData = await response.json();
      console.log("User data response:", userData);
      return userData;
    } else {
      // Instead of throwing, we'll just return a null result with userId
      console.warn(`All user API attempts failed for user ID: ${userId}`);
      return { data: { userId: userId, user_id: userId } };
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    // Return a minimal object with just the user ID so we can display something
    return { data: { userId: userId, user_id: userId } };
  }
};

const fetchFurnitureDetails = async (furnitureId: string) => {
  try {
    const headersList = {
      "Accept": "*/*",
      "User-Agent": "Thunder Client (https://www.thunderclient.com)",
      "Content-Type": "application/json"
    };

    const bodyContent = JSON.stringify({
      "search": "" // Empty search to get all furniture
    });

    console.log(`Fetching details for furniture ID: ${furnitureId}`);
    const response = await fetch("http://127.0.0.1:10007/api/v1/furniture/list_all", { 
      method: "POST",
      body: bodyContent,
      headers: headersList
    });

    if (!response.ok) {
      console.warn(`Furniture API request failed: ${response.status}`);
      return null; // Return null to indicate the furniture wasn't found
    }

    const responseData = await response.json();
    
    // Handle various response formats
    let furnitureItems = [];
    
    if (responseData.data && Array.isArray(responseData.data)) {
      furnitureItems = responseData.data;
    } else if (responseData.furnitures && Array.isArray(responseData.furnitures)) {
      furnitureItems = responseData.furnitures;
    } else if (Array.isArray(responseData)) {
      furnitureItems = responseData;
    } else {
      console.error("Unexpected furniture response structure");
      return null; // Return null to indicate the furniture wasn't found
    }
    
    // Find the specific furniture by ID
    const furniture = furnitureItems.find((item: any) => 
      (item._id && item._id.toString() === furnitureId) || 
      (item.id && item.id.toString() === furnitureId) ||
      (item.furniture_id && item.furniture_id.toString() === furnitureId)
    );
    
    if (furniture) {
      // Extract category from the nested data structure if available
      let category = "Furniture";
      
      if (furniture.data && furniture.data.data && furniture.data.data.category) {
        category = furniture.data.data.category;
      } else if (furniture.category) {
        category = furniture.category;
      } else if (furniture.type) {
        category = furniture.type;
      }
      
      return {
        _id: furniture._id || furniture.id || furnitureId,
        title: furniture.title || furniture.name || "Furniture Item",
        category: category,
        image: furniture.image || (furniture.images && furniture.images.length > 0 ? furniture.images[0] : ""),
        found: true
      };
    }
    
    // If furniture not found in the first request, return null
    return null;
  } catch (error) {
    console.error('Error fetching furniture details:', error);
    return null;
  }
};

const fetchSpecificFurnitureDetails = async (furnitureId: string) => {
  try {
    const headersList = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    console.log(`Attempting to fetch specific furniture details for ID: ${furnitureId}`);
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`http://127.0.0.1:10007/api/v1/furniture/${furnitureId}`, { 
      method: "GET",
      headers: headersList,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Log different error types differently
      if (response.status === 500) {
        console.error(`Server error (500) when fetching furniture details for ID: ${furnitureId}`);
      } else {
        console.warn(`Specific furniture API request failed with status: ${response.status}`);
      }
      
      // Return null for any error to trigger fallback
      return null;
    }

    const data = await response.json();
    console.log(`Successfully retrieved specific furniture details for ${furnitureId}`);
    
    return data;
  } catch (error) {
    // Check if it's an abort error (timeout)
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn(`Request for furniture ${furnitureId} timed out`);
    } else {
      console.error('Error fetching specific furniture details:', error);
    }
    
    // Return null for any error to trigger fallback
    return null;
  }
};

const PendingStatus: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  
  // Feature flags to disable problematic endpoints after multiple failures
  const [specificFurnitureApiDisabled, setSpecificFurnitureApiDisabled] = useState(false);
  const [specificFurnitureApiFailures, setSpecificFurnitureApiFailures] = useState(0);
  
  // Modified fetchSpecificFurnitureDetails function with feature flag check
  const fetchFurnitureDetailsWithFeatureFlags = async (furnitureId: string) => {
    try {
      // Skip the specific furniture API if it's been disabled due to too many failures
      if (specificFurnitureApiDisabled) {
        console.log(`Skipping specific furniture API (disabled) for ID: ${furnitureId}`);
        // Use the fallback method directly
        return await fetchFurnitureDetails(furnitureId);
      }
      
      // First try to get specific furniture details with category
      const specificDetails = await fetchSpecificFurnitureDetails(furnitureId);
      
      // Check if we got a valid response
      if (specificDetails && specificDetails.data) {
        // Reset the failure counter on success
        if (specificFurnitureApiFailures > 0) {
          setSpecificFurnitureApiFailures(0);
        }
        
        // Extract furniture data from the response
        if (specificDetails.data.data && specificDetails.data.data.category) {
          // Successfully got specific details with nested data structure
          return {
            id: furnitureId,
            title: specificDetails.data.data.title || specificDetails.data.data.name || 'Furniture Item',
            category: specificDetails.data.data.category,
            image: specificDetails.data.data.image || 
                  (specificDetails.data.data.images && specificDetails.data.data.images.length > 0 ? 
                  specificDetails.data.data.images[0] : '')
          };
        } else if (specificDetails.data.category) {
          // Success with less nested structure
          return {
            id: furnitureId,
            title: specificDetails.data.title || specificDetails.data.name || 'Furniture Item',
            category: specificDetails.data.category,
            image: specificDetails.data.image || 
                  (specificDetails.data.images && specificDetails.data.images.length > 0 ? 
                  specificDetails.data.images[0] : '')
          };
        }
      } else {
        // Increment the failure counter
        const newFailureCount = specificFurnitureApiFailures + 1;
        setSpecificFurnitureApiFailures(newFailureCount);
        
        // If we've reached a threshold (5 failures), disable the specific API endpoint
        if (newFailureCount >= 5) {
          console.warn('Too many specific furniture API failures, disabling endpoint');
          setSpecificFurnitureApiDisabled(true);
        }
      }
      
      // Fallback to the original method if specific API doesn't work
      const furnitureDetails = await fetchFurnitureDetails(furnitureId);
      
      if (furnitureDetails) {
        // Furniture found in database
        return {
          id: furnitureId,
          title: furnitureDetails.title,
          category: furnitureDetails.category,
          image: furnitureDetails.image || ''
        };
      } else {
        // Furniture not found, just return the ID
        return {
          id: furnitureId,
          title: `Furniture ID: ${furnitureId.substring(0, 8)}...`,
          category: "Unknown",
          image: ''
        };
      }
    } catch (error) {
      console.error(`Error getting details for furniture ${furnitureId}:`, error);
      // Return basic info in case of error
      return {
        id: furnitureId,
        title: `Furniture ID: ${furnitureId.substring(0, 8)}...`,
        category: "Unknown",
        image: ''
      };
    }
  };

  const fetchBookings = async () => {
    try {
      // Reset feature flags when refreshing bookings
      setSpecificFurnitureApiDisabled(false);
      setSpecificFurnitureApiFailures(0);
      
      setLoading(true);
      const headersList = {
        "Content-Type": "application/json"
      };

      // Use the original endpoint
      const response = await fetch("http://localhost:10007/api/v1/booking/get_booking", { 
        method: "GET",
        headers: headersList
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);
      
      // Extract bookings from the response data
      let bookingsData;
      
      // Handle various response formats
      if (responseData.data && Array.isArray(responseData.data)) {
        bookingsData = responseData.data;
      } else if (responseData.data && responseData.data.bookings) {
        bookingsData = responseData.data.bookings;
      } else if (responseData.bookings) {
        bookingsData = responseData.bookings;
      } else if (Array.isArray(responseData)) {
        bookingsData = responseData;
      } else {
        bookingsData = [];
        console.error("Unexpected response format:", responseData);
      }
      
      if (!Array.isArray(bookingsData)) {
        console.error("Expected bookings to be an array, got:", bookingsData);
        setBookings([]);
        throw new Error('Unexpected response format: bookings is not an array');
      }
      
      // Process each booking to match our display format
      const processedBookings = await Promise.all(
        bookingsData.map(async (booking: any) => {
          try {
            // Handle the new format (with nested delivery_address)
            let addressString = 'No address provided';
            if (booking.delivery_address) {
              const addr = booking.delivery_address;
              addressString = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''}, ${addr.country || ''} ${addr.zipcode || ''}`;
            } else if (booking.address) {
              addressString = booking.address;
            }
            
            // Handle furniture IDs as array
            let furnitureIds = booking.furniture_id || booking.furnitureId;
            if (!Array.isArray(furnitureIds)) {
              furnitureIds = [furnitureIds];
            }
            
            // Get details for ALL furniture items in this booking
            const furnitureItems = await Promise.all(
              furnitureIds.map(async (furnitureId: string) => {
                return await fetchFurnitureDetailsWithFeatureFlags(furnitureId);
              })
            );
            
            // Get user details
            const userId = booking.user_id || booking.userId;
            const userData = await fetchUserDetails(userId);
            
            // Extract user information with better fallbacks
            let fullName = 'User';

            // Try different possible nested data structures for user information
            if (userData?.data?.data?.first_name || userData?.data?.data?.last_name) {
              const firstName = userData.data.data.first_name || '';
              const lastName = userData.data.data.last_name || '';
              fullName = `${firstName} ${lastName}`.trim();
            } else if (userData?.data?.first_name || userData?.data?.last_name) {
              const firstName = userData.data.first_name || '';
              const lastName = userData.data.last_name || '';
              fullName = `${firstName} ${lastName}`.trim();
            } else if (userData?.first_name || userData?.last_name) {
              const firstName = userData.first_name || '';
              const lastName = userData.last_name || '';
              fullName = `${firstName} ${lastName}`.trim();
            } else if (userData?.data?.name) {
              fullName = userData.data.name;
            } else if (userData?.name) {
              fullName = userData.name;
            } else if (userData?.data?.email) {
              fullName = userData.data.email;
            } else if (userData?.email) {
              fullName = userData.email;
            } else {
              // If no name is available, use the user ID with a prefix
              fullName = `User ${userId.substring(0, 6)}...`;
            }
            
            return {
              _id: booking._id,
              userName: fullName,
              furnitureItems: furnitureItems,
              startDate: booking.booking_date || booking.startDate || new Date().toISOString(),
              endDate: booking.endDate || '', 
              totalAmount: booking.total_price || booking.totalAmount || 0,
              status: booking.booking_status || booking.status || 'pending',
              address: addressString,
              paymentStatus: booking.payment_status || booking.paymentStatus,
              paymentMethod: booking.payment_method || booking.paymentMethod,
              paymentId: booking.payment_id || booking.paymentId
            };
          } catch (error) {
            console.error("Error processing booking:", error);
            return {
              _id: booking._id || booking.id,
              userName: 'Error loading user',
              furnitureItems: [],
              startDate: booking.booking_date || booking.startDate || '',
              endDate: booking.endDate || '',
              totalAmount: booking.total_price || booking.totalAmount || 0,
              status: booking.booking_status || booking.status || 'pending',
              address: 'Error loading address'
            };
          }
        })
      );
      
      // Filter to only show pending bookings
      const pendingBookings = processedBookings.filter(booking => booking.status === 'pending');
      setBookings(pendingBookings);
      setError(null);
    } catch (err) {
      setError('Error fetching bookings: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Detailed error:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      setUpdateLoading(bookingId);
      const headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json"
      };

      const bodyContent = JSON.stringify({
        status: status
      });

      const response = await fetch(`http://localhost:10007/api/v1/booking/update_status/${bookingId}`, { 
        method: "POST",
        body: bodyContent,
        headers: headersList
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      // If status is updated to something other than pending, remove it from the list
      if (status !== 'pending') {
        setBookings(prevBookings => 
          prevBookings.filter(booking => booking._id !== bookingId)
        );
      } else {
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === bookingId ? { ...booking, status } : booking
          )
        );
      }
      
      setUpdateSuccess(`Booking ${bookingId} status updated to ${status}`);
      setTimeout(() => setUpdateSuccess(null), 3000);
    } catch (err) {
      setError('Error updating status: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleStatusChange = (event: SelectChangeEvent, bookingId: string) => {
    updateBookingStatus(bookingId, event.target.value);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="fixed top-0 left-0 h-full">
        <DeliverySidebar />
      </div>
      <div className="flex-1 ml-72 flex flex-col">
        <DeliveryHeader />
        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          {error && (
            <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-4 mb-6 rounded-md">
              <p className="font-medium">{error}</p>
            </div>
          )}
          {updateSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md">
              <p className="font-medium">{updateSuccess}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
              <FiPackage className="mr-2 text-indigo-600 dark:text-indigo-400" />
              Pending Orders
            </h1>
            
            <Button 
              variant="contained" 
              onClick={fetchBookings} 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
              sx={{ px: 4 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Refresh Bookings"}
            </Button>
          </div>

          {/* Booking Cards */}
          {loading ? (
            <div className="col-span-full flex items-center justify-center h-60 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <CircularProgress />
              <p className="text-gray-500 dark:text-gray-400 ml-3">
                Loading booking information...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.length === 0 ? (
                <div className="col-span-full flex items-center justify-center h-60 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    <span className="block text-5xl mb-3 opacity-30">📦</span>
                    No bookings found
                  </p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                  >
                    <div className={`
                      ${booking.status === 'pending' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                      booking.status === 'processing' ? 'bg-gradient-to-r from-blue-500 to-sky-600' :
                      booking.status === 'shipped' ? 'bg-gradient-to-r from-purple-500 to-indigo-600' :
                      booking.status === 'delivered' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                      'bg-gradient-to-r from-indigo-500 to-purple-600'}
                      h-20 relative
                    `}>
                      <div className="absolute left-6 top-5 right-6 flex justify-between items-start">
                        <div className="bg-white dark:bg-slate-700 rounded-full p-1 shadow-md transform -translate-y-2 group-hover:scale-110 transition-transform">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-600">
                            <FiPackage className="w-8 h-8 text-gray-500 dark:text-gray-300" />
                          </div>
                        </div>
                        <Chip 
                          label={booking.status.toUpperCase()} 
                          size="small"
                          color={
                            booking.status === 'pending' ? 'warning' :
                            booking.status === 'processing' ? 'info' :
                            booking.status === 'shipped' ? 'secondary' :
                            booking.status === 'delivered' ? 'success' :
                            'default'
                          }
                          className="transform translate-y-2"
                        />
                      </div>
                    </div>
                    
                    <div className="px-6 pt-10 pb-6">
                      <div className="bg-indigo-50 dark:bg-slate-700 px-3 py-2 rounded-lg mb-4">
                        {/* Display all furniture items */}
                        <h3 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                          Furniture Items ({booking.furnitureItems.length})
                        </h3>
                        
                        <div className="space-y-2">
                          {booking.furnitureItems.map((item, index) => (
                            <div key={item.id} className="pb-2 border-b border-indigo-100 dark:border-slate-600 last:border-0">
                              <div className="flex justify-between items-start">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                  {index + 1}. {item.title}
                                </h2>
                                <span className={`${
                                  item.category === "Unknown" 
                                    ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300" 
                                    : "bg-[#67d31520] text-[#67d315d0] dark:bg-[#67d31520] dark:text-[#67d315d0]"
                                  } px-2 py-0.5 rounded-full text-xs font-medium`}
                                >
                                  {item.category}
                                </span>
                              </div>
                              
                              {/* Optional: Display furniture image if available */}
                              {item.image && (
                                <div className="mt-2">
                                  <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="h-16 w-16 object-cover rounded-md border border-gray-200"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start text-sm">
                          <FiUser className="mt-0.5 mr-2 text-indigo-500 dark:text-indigo-400" />
                          <span className="text-gray-600 dark:text-gray-300">{booking.userName}</span>
                        </div>
                        
                        <div className="flex items-start text-sm">
                          <FiMapPin className="mt-0.5 mr-2 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 break-words">
                            {booking.address}
                          </span>
                        </div>
                        
                        <div className="flex items-start text-sm">
                          <FiCalendar className="mt-0.5 mr-2 text-indigo-500 dark:text-indigo-400" />
                          <div className="text-gray-600 dark:text-gray-300">
                            <div>From: {new Date(booking.startDate).toLocaleDateString()}</div>
                            {booking.endDate && !isNaN(new Date(booking.endDate).getTime()) ? (
                              <div>To: {new Date(booking.endDate).toLocaleDateString()}</div>
                            ) : null}
                          </div>
                        </div>
                        
                        <div className="flex items-start text-sm">
                          <FiDollarSign className="mt-0.5 mr-2 text-indigo-500 dark:text-indigo-400" />
                          <div>
                            <span className="text-gray-700 dark:text-gray-200 font-bold">${booking.totalAmount}</span>
                            {booking.paymentStatus && (
                              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                                {booking.paymentStatus}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {booking.paymentMethod && (
                          <div className="flex items-start text-sm">
                            <span className="text-gray-600 dark:text-gray-300">
                              Payment via {booking.paymentMethod}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Update Status
                        </label>
                        {updateLoading === booking._id ? (
                          <div className="flex justify-center py-2">
                            <CircularProgress size={24} />
                          </div>
                        ) : (
                          <FormControl fullWidth size="small">
                            <Select
                              value={booking.status}
                              onChange={(e) => handleStatusChange(e, booking._id)}
                              className="bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg"
                            >
                              <MenuItem value="processing">Processing</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PendingStatus;
