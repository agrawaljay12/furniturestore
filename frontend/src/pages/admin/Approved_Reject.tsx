import React, { useState, useEffect, useCallback } from "react";
import AdminFooter from "../../components/admin/AdminFooter";
import axios from "axios";
import Sidebar from "../../components/admin/Sidebar";
import AdminHeader from "../../components/admin/AdminHeader";

// Create an error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-slate-900">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Something went wrong</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">We're having trouble displaying this page. Please try refreshing or contact support if the problem persists.</p>
            <button 
              onClick={() => {this.setState({ hasError: false }); window.location.reload();}}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ApprovedRejectedFurniture: React.FC = () => {
  const [furniture, setFurniture] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [loading, setLoading] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<{[key: string]: {firstName: string, lastName: string}}>({});
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchFurniture = useCallback(async () => {
    setLoading(true);
    try {
      const headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json"
      };

      const response = await axios.get(
        "http://127.0.0.1:10007/api/v1/furniture/list_all_furniture",
        { headers: headersList }
      );
      
      if (response.data && Array.isArray(response.data.data)) {
        // Add debugging to see what we're getting from the API
        console.log("API Response data:", response.data.data);
        
        interface FurnitureItem {
          id?: string;
          _id?: string;
          status?: string;
          created_by?: string;
          created_at?: string;
          createdAt?: string;
          updatedAt?: string;
          image_url?: string;
          title?: string;
          rent_price?: string;
          category?: string;
          review_note?: string;
        }

        interface ApiResponse {
          data: FurnitureItem[];
        }

        // Make the status check case-insensitive and check for status in different properties
        const filteredData = (response.data as ApiResponse).data.filter(
          (item: FurnitureItem) => {
            // Check status in various property names with case insensitivity
            const itemStatus = (item.status || '').toLowerCase();
            console.log(`Item ID: ${item.id || item._id}, Status: ${itemStatus}`);
            return itemStatus === "approved" || itemStatus === "rejected";
          }
        );
        
        console.log("Filtered furniture items:", filteredData);
        console.log("Approved count:", filteredData.filter(item => (item.status || '').toLowerCase() === 'approved').length);
        console.log("Rejected count:", filteredData.filter(item => (item.status || '').toLowerCase() === 'rejected').length);
        
        setFurniture(filteredData);
        
        if (filteredData.length === 0) {
          // If we have data but nothing after filtering, show a message
          if (response.data.data.length > 0) {
            setError("No approved or rejected furniture items found. Items may be pending review.");
          }
        }
      } else {
        console.error("Unexpected API response format:", response.data);
        setError("Received invalid data format from server.");
        setFurniture([]);
      }
      setLoading(false);
    } catch (error: any) {
      console.error("API Error:", error);
      setError(`Failed to fetch furniture items: ${error.message || "Unknown error"}`);
      setFurniture([]);
      setLoading(false);
    }
  }, []);

  const fetchUserDetails = async (userId: string) => {
    if (!userId) return { firstName: "", lastName: "" };
    
    try {
      const headersList = {
        "Accept": "*/*"
      };

      const response = await axios.get(
        `http://127.0.0.1:10007/api/v1/auth/user/fetch/${userId}`,
        { headers: headersList }
      );

      if (response.data && response.data.data) {
        const userData = response.data.data;
        return {
          firstName: userData.first_name || "",
          lastName: userData.last_name || ""
        };
      } else {
        return { firstName: "", lastName: "" };
      }
    } catch (error) {
      console.error(`Error fetching user details for ${userId}:`, error);
      return { firstName: "", lastName: "" };
    }
  };

  useEffect(() => {
    fetchFurniture();
  }, [fetchFurniture]);

  useEffect(() => {
    const fetchAllUserDetails = async () => {
      if (!furniture || furniture.length === 0) return;
      
      const userIds = furniture
        .map(item => item?.created_by)
        .filter(id => id && typeof id === 'string');
      
      if (userIds.length === 0) return;
      
      const uniqueUserIds = [...new Set(userIds)];
      
      const userDetailsObj: {[key: string]: {firstName: string, lastName: string}} = {};
      
      for (const userId of uniqueUserIds) {
        const details = await fetchUserDetails(userId);
        userDetailsObj[userId] = details;
      }
      
      setUserDetails(userDetailsObj);
    };
    
    fetchAllUserDetails();
  }, [furniture]);

  const getDateValue = (dateString: string | undefined | null): number => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const filteredItems = furniture.filter((item) => {
    if (!item) return false;
    
    // Get status with fallback to empty string, and normalize to lowercase
    const itemStatus = (item.status || '').toLowerCase();
    
    // If we're showing all statuses, include the item
    if (filterStatus === "all") return true;
    
    // Check if the status matches the filter
    const matches = itemStatus === filterStatus.toLowerCase();
    return matches;
  });

  // Add debug log for filtered items by status
  useEffect(() => {
    console.log(`Items after '${filterStatus}' filter:`, filteredItems.length);
  }, [filteredItems, filterStatus]);

  // Update total items count for pagination
  useEffect(() => {
    setTotalItems(filteredItems.length);
    
    // Reset to page 1 if the current page would be empty with the new filtered items
    const maxPage = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [filteredItems, itemsPerPage]);

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOrder === "status") {
      return (a.status || "").localeCompare(b.status || "");
    } else if (sortOrder === "newest") {
      const dateA = getDateValue(b.created_at) || getDateValue(b.createdAt) || getDateValue(b.updatedAt);
      const dateB = getDateValue(a.created_at) || getDateValue(a.createdAt) || getDateValue(a.updatedAt);
      return dateA - dateB;
    } else if (sortOrder === "oldest") {
      const dateA = getDateValue(a.created_at) || getDateValue(a.createdAt) || getDateValue(a.updatedAt);
      const dateB = getDateValue(b.created_at) || getDateValue(b.createdAt) || getDateValue(b.updatedAt);
      return dateA - dateB;
    }
    return 0;
  });

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Add page change handler
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Apply pagination to get the current page items
  const currentItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatus = (item: any): string => item?.status?.toLowerCase() || "";
  const getImageUrl = (item: any): string => item?.image_url || "";
  const getTitle = (item: any): string => item?.title || "No Title";
  const getCreatedBy = (item: any): string => item?.created_by || "";
  
  // New helper functions to determine if an item is for rent or sale
  const isItemForRent = (item: any): boolean => {
    return (
      item?.is_for_rent === true || 
      item?.is_for_rent === "true" || 
      item?.isForRent === true ||
      item?.isForRent === "true" ||
      item?.for_rent === true ||
      item?.for_rent === "true" ||
      (item?.rent_price && Number(item?.rent_price) > 0)
    );
  };
  
  const isItemForSale = (item: any): boolean => {
    return (
      item?.is_for_sale === true || 
      item?.is_for_sale === "true" ||
      item?.isForSale === true ||
      item?.isForSale === "true" ||
      item?.for_sale === true ||
      item?.for_sale === "true" ||
      (item?.price && Number(item?.price) > 0 && !item?.rent_price)
    );
  };
  
  // Updated getPrice function to return appropriate price
  const getPrice = (item: any): string => {
    if (isItemForRent(item)) {
      return item?.rent_price || "N/A";
    }
    
    if (isItemForSale(item)) {
      return item?.price || item?.sale_price || "N/A";
    }
    
    // If we can't determine, return any available price
    return item?.price || item?.rent_price || item?.sale_price || "N/A";
  };
  
  // Get price type label (for display)
  const getPriceLabel = (item: any): string => {
    if (isItemForRent(item)) {
      return "Rent Price:";
    }
    
    if (isItemForSale(item)) {
      return "Sale Price:";
    }
    
    return "Price:";
  };
  
  const getCategory = (item: any): string => item?.category || "Unknown";
  const getCreatedDate = (item: any): string => {
    const date = new Date(item?.created_at || item?.createdAt);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : "Unknown date";
  };
  const getReviewNote = (item: any): string => item?.review_note || "";

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-white text-gray-800 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col w-full ml-0 lg:ml-72">
          <AdminHeader />
          
          <main className="flex-1 p-6 bg-white text-gray-800 overflow-y-auto">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Furniture Review Status
              </h1>
              
              <div className="flex space-x-3">
                <select
                  className="bg-gray-100 border-gray-300 text-gray-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <select
                  className="bg-gray-100 border-gray-300 text-gray-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="status">By Status</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center h-60 bg-gray-50 rounded-xl border border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-600">
                      {filterStatus === "all" 
                        ? "No approved or rejected furniture items found"
                        : `No ${filterStatus.toLowerCase()} furniture items found`}
                    </p>
                  </div>
                ) : (
                  currentItems.map((item, index) => (
                    <div
                      key={item?.id || item?._id || index}
                      className={`bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden ${
                        getStatus(item) === "approved" 
                          ? 'border-l-4 border-green-500' 
                          : 'border-l-4 border-red-500'
                      }`}
                    >
                      <div className={`p-4 ${
                        getStatus(item) === "approved" 
                          ? 'bg-gradient-to-r from-green-100 to-green-50' 
                          : 'bg-gradient-to-r from-red-100 to-red-50'
                      }`}>
                        <div className="flex justify-between items-center">
                          <h2 className="flex items-center font-bold text-gray-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1.5 ${
                              getStatus(item) === "approved" ? 'text-green-600' : 'text-red-600'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {getStatus(item) === "approved" ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              )}
                            </svg>
                            {(item?.status?.charAt(0)?.toUpperCase() + item?.status?.slice(1)) || "Unknown"}
                          </h2>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            getStatus(item) === "approved" 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item?.status?.toUpperCase() || "UNKNOWN"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        {getImageUrl(item) && (
                          <div className="mb-4 h-40 overflow-hidden rounded-lg">
                            <img 
                              src={getImageUrl(item)} 
                              alt={getTitle(item)} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Furniture Title:</span>
                            <span className="text-sm font-bold text-gray-800">{getTitle(item)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Creator:</span>
                            <span className="text-sm font-bold text-gray-800">
                              {userDetails[getCreatedBy(item)] ? 
                                `${userDetails[getCreatedBy(item)].firstName} ${userDetails[getCreatedBy(item)].lastName}` : 
                                'Unknown User'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">{getPriceLabel(item)}</span>
                            <span className="text-sm font-bold text-gray-800">
                              ${getPrice(item)}
                              {isItemForRent(item) && <span className="text-xs text-gray-500 ml-1">/day</span>}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Category:</span>
                            <span className="text-sm font-bold text-gray-800">{getCategory(item)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Date:</span>
                            <span className="text-sm font-bold text-gray-800">
                              {getCreatedDate(item)}
                            </span>
                          </div>
                          
                          {getReviewNote(item) && (
                            <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 mb-1">Review Note:</p>
                              <p className="text-sm text-gray-800">{getReviewNote(item)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {/* Pagination with light theme */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 border border-gray-300"
                    title="First Page"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 border border-gray-300"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-1 rounded bg-blue-700 text-white">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 border border-gray-300"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 border border-gray-300"
                    title="Last Page"
                  >
                    &raquo;
                  </button>
                </nav>
              </div>
            )}
          </main>
          <AdminFooter />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ApprovedRejectedFurniture;
