import React, { useState, useEffect, useCallback } from "react";
import AdminFooter from "../../components/admin/AdminFooter";
import SuperAdminHeader from "../../components/SuperAdminHeader ";
import SuperSidebar from "../../components/SuperSidebar";

const Approved: React.FC = () => {
  const [furniture, setFurniture] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [selectedImageMap, setSelectedImageMap] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState<{[key: string]: {approve: boolean, reject: boolean}}>({});
  const [statusMessage, setStatusMessage] = useState<{[key: string]: {message: string, type: 'success' | 'error'}}>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Add state for total furniture counts
  const [totalCounts, setTotalCounts] = useState<{
    sale: number;
    rent: number;
    total: number;
  }>({
    sale: 0,
    rent: 0,
    total: 0
  });
  
  // Revised sorting state
  const [sortConfig, setSortConfig] = useState<{field: string, order: 'asc' | 'desc'}>({
    field: "createdAt",
    order: "desc"
  });
  
  // Search state with loading indicator
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Add debounce timeout reference
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  
  // Add user data state
  const [userMap, setUserMap] = useState<{[key: string]: {firstName: string, lastName: string}}>({});
  
  // Add furniture type toggle state
  const [furnitureType, setFurnitureType] = useState<'all' | 'rent' | 'sale'>('all');

  // Add seller filtering state
  const [sellers, setSellers] = useState<{id: string, name: string}[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<string>('all');
  const [isLoadingSellers, setIsLoadingSellers] = useState<boolean>(false);

  // Debounced search function
  const debouncedSearch = useCallback(() => {
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set a new timeout to delay the search
    const timeout = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search
      listAllFurniture(true);
    }, 500); // 500ms delay
    
    setSearchTimeout(timeout);
  }, [searchTimeout]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch();
  };

  const fetchUserData = async (userId: string) => {
    try {
      const headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)"
      };

      const response = await fetch(`https://furnspace.onrender.com/api/v1/auth/user/fetch/${userId}`, {
        method: "GET",
        headers: headersList
      });

      const data = await response.json();
      
      if (response.ok && data.data) {
        setUserMap(prev => ({
          ...prev,
          [userId]: {
            firstName: data.data.first_name || '',
            lastName: data.data.last_name || ''
          }
        }));
      }
    } catch (error) {
      console.error(`Error fetching user data for user ID ${userId}:`, error);
    }
  };

  const fetchSellers = async () => {
    try {
      setIsLoadingSellers(true);
      const headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Content-Type": "application/json"
      };
  
      const bodyContent = JSON.stringify({});
  
      const response = await fetch("https://furnspace.onrender.com/api/v1/auth/get_users", { 
        method: "POST",
        body: bodyContent,
        headers: headersList
      });
  
      const data = await response.json();
      
      // Extract retailers from the response
      if (data && data.data) {
        console.log("Users data:", data.data);
        const retailersList = data.data
          .filter((user: any) => user.type === "retailer")
          .map((user: any) => ({
            id: user._id || user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown User'
          }));
        
        setSellers(retailersList);
        console.log("Filtered retailers:", retailersList);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    } finally {
      setIsLoadingSellers(false);
    }
  };

  const listAllFurniture = async (isSearchRequest = false) => {
    try {
      if (isSearchRequest) {
        setIsSearching(true);
      }
      
      const headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Content-Type": "application/json"
      };

      // Using the new API endpoint with GET method
      const response = await fetch("https://furnspace.onrender.com/api/v1/furniture/list_all_furniture", {
        method: "GET",
        headers: headersList
      });

      const result = await response.json();

      // Handle pagination data
      if (result.total) {
        setTotalItems(result.total);
      } else if (result.data) {
        setTotalItems(result.data.length);
      }

      // Client-side handling for pagination, sorting, and filtering
      let processedData = result.data || [];
      
      // Filter to only include pending items (those without approved/rejected status)
      processedData = processedData.filter((item: any) => {
        // Normalize status value for consistent comparison
        const itemStatus = (item.status || '').toLowerCase();
        // Keep only pending items (those with empty status or status='pending')
        return itemStatus === '' || itemStatus === 'pending' || !itemStatus;
      });
      
      console.log(`After status filtering: ${processedData.length} pending items`);
      
      // Apply search filter if needed
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        processedData = processedData.filter((item: any) => 
          (item.title && item.title.toLowerCase().includes(searchLower)) ||
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          (item.category && item.category.toLowerCase().includes(searchLower))
        );
      }

      // Apply seller filter - Prioritize created_by field for seller ID
      if (selectedSellerId !== 'all') {
        console.log('Filtering by seller ID:', selectedSellerId);
        
        // Log the first item to debug seller ID fields
        if (processedData.length > 0) {
          const sampleItem = processedData[0];
          console.log('Sample item seller fields:', {
            created_by: sampleItem.created_by,
            user_id: sampleItem.user_id
          });
        }
        
        processedData = processedData.filter((item: any) => {
          // The created_by field contains the seller ID in furniture data
          const sellerId = item.created_by || item.user_id;
          return sellerId === selectedSellerId;
        });
        
        console.log('After seller filtering:', processedData.length, 'items');
      }
      
      // Apply furniture type filter
      if (furnitureType !== 'all') {
        console.log('Filtering by furniture type:', furnitureType);
        console.log('Before filtering:', processedData.length, 'items');
        
        processedData = processedData.filter((item: any) => {
          // Log a sample item to debug property names and formats
          if (processedData.indexOf(item) === 0) {
            console.log('Sample item properties:', JSON.stringify(item));
          }
          
          if (furnitureType === 'rent') {
            // Check various possible rent property formats
            return (
              item.is_for_rent === true || 
              item.is_for_rent === "true" || 
              item.isForRent === true ||
              item.isForRent === "true" ||
              item.for_rent === true ||
              item.for_rent === "true" ||
              item.rent_price > 0
            );
          }
          if (furnitureType === 'sale') {
            // Check various possible sale property formats
            return (
              item.is_for_sale === true || 
              item.is_for_sale === "true" ||
              item.isForSale === true ||
              item.isForSale === "true" ||
              item.for_sale === true ||
              item.for_sale === "true" ||
              (item.price > 0 && !item.rent_price)
            );
          }
          return true;
        });
        
        console.log('After filtering:', processedData.length, 'items');
      }
      
      // Normalize creation dates for consistent sorting
      processedData = processedData.map((item: any) => {
        // Ensure creation date is properly extracted regardless of field name
        const creationDate = item.created_at || item.createdAt || item.timestamp || item.date;
        return {
          ...item,
          // Store a consistent createdAt field for sorting
          createdAt: creationDate ? new Date(creationDate).getTime() : 0
        };
      });
      
      // Always sort by creation date (newest first) before applying user-selected sort
      if (sortConfig.field === "createdAt" && sortConfig.order === "desc") {
        console.log("Applying default sort: newest first");
        processedData.sort((a: any, b: any) => {
          const dateA = a.createdAt || 0;
          const dateB = b.createdAt || 0;
          return dateB - dateA; // Descending order (newest first)
        });
      } else {
        // Apply the user-selected sort using the existing sorting logic
        processedData.sort((a: any, b: any) => {
          // Helper function to safely get field values with fallbacks for different property names
          const getFieldValue = (item: any, fieldName: string) => {
            // Handle special cases for each field
            if (fieldName === 'price') {
              // Try different price field variations and return the first non-null value
              return item.price || item.sale_price || 
                    (item.is_for_sale ? item.sale_price : item.rent_price) || 0;
            }
            
            if (fieldName === 'createdAt') {
              // Handle different date field name formats
              const dateValue = item.createdAt || item.created_at || item.date || item.timestamp;
              return dateValue ? new Date(dateValue).getTime() : 0; // Convert to timestamp
            }
            
            if (fieldName === 'name') {
              // Handle different name field formats
              return (item.title || item.name || item.product_name || '').toString().toLowerCase();
            }
            
            // Default case: return the field value or empty string if not found
            return (item[fieldName] !== undefined && item[fieldName] !== null) 
              ? item[fieldName] 
              : '';
          };
          
          const fieldA = getFieldValue(a, sortConfig.field);
          const fieldB = getFieldValue(b, sortConfig.field);
          
          // Handle numeric fields
          if (sortConfig.field === 'price' || sortConfig.field === 'createdAt') {
            // Ensure we're comparing numbers
            const numA = typeof fieldA === 'number' ? fieldA : Number(fieldA) || 0;
            const numB = typeof fieldB === 'number' ? fieldB : Number(fieldB) || 0;
            
            return sortConfig.order === 'asc' ? numA - numB : numB - numA;
          }
          
          // String comparison for text fields
          const strA = String(fieldA);
          const strB = String(fieldB);
          
          return sortConfig.order === 'asc'
            ? strA.localeCompare(strB)
            : strB.localeCompare(strA);
        });
      }
      
      // Apply client-side pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedData = processedData.slice(startIndex, startIndex + itemsPerPage);

      console.log("First 3 items after sorting:", 
        paginatedData.slice(0, 3).map((item: any) => ({
          title: item.title || item.name,
          date: new Date(item.createdAt || item.created_at).toISOString().split('T')[0]
        }))
      );

      const processedFurniture = paginatedData.map((item: any) => {
        // Handle different image scenarios
        let displayImage = "";
        let allImages: string[] = [];
        
        // Case 1: Check for singular "image" field
        if (item.image) {
          displayImage = item.image;
          allImages = [item.image];
        }
        // Case 2: Check for plural "images" field as array
        else if (Array.isArray(item.images) && item.images.length > 0) {
          displayImage = item.images[0];
          allImages = [...item.images];
        } 
        // Case 3: Check for plural "images" field as string
        else if (typeof item.images === 'string' && item.images) {
          displayImage = item.images;
          allImages = [item.images];
        }

        return {
          ...item,
          displayImage,
          allImages
        };
      });

      // Set initial selected image for each item
      const initialSelectedImages: {[key: string]: string} = {};
      processedFurniture.forEach((item: { id?: string; _id?: string; displayImage: string; created_by?: string; user_id?: string }) => {
        initialSelectedImages[item.id || item._id || "unknown"] = item.displayImage;
        
        // Fetch user data if we don't already have it
        const userId = item.created_by || item.user_id;
        if (userId && !userMap[userId]) {
          fetchUserData(userId);
        }
      });
      setSelectedImageMap(initialSelectedImages);

      setFurniture(processedFurniture);
      setTotalItems(processedData.length); // Update total for pagination

      // Update total counts for sale, rent, and total
      const saleCount = processedData.filter((item: any) => item.is_for_sale === true || item.is_for_sale === "true").length;
      const rentCount = processedData.filter((item: any) => item.is_for_rent === true || item.is_for_rent === "true").length;
      setTotalCounts({
        sale: saleCount,
        rent: rentCount,
        total: processedData.length
      });

      return processedFurniture;
    } catch (error) {
      console.error("Error fetching all furniture:", error);
      setError("Failed to fetch all furniture items");
      return [];
    } finally {
      if (isSearchRequest) {
        setIsSearching(false);
      }
    }
  };

  // Function to handle image selection
  // const selectImage = (itemId: string, imageUrl: string) => {
  //   setSelectedImageMap(prev => ({
  //     ...prev,
  //     [itemId]: imageUrl
  //   }));
  // };

  // Function to update furniture status (approve/reject)
  const updateFurnitureStatus = async (furnitureId: string, userId: string, status: 'approved' | 'rejected') => {
    // Show confirmation dialog
    const action = status === 'approved' ? 'approve' : 'reject';
    const confirmed = window.confirm(`Are you sure you want to ${action} this furniture item?`);
    
    if (!confirmed) {
      return; // Exit if user cancels
    }
    
    if (!furnitureId || !userId) {
      setStatusMessage(prev => ({
        ...prev,
        [furnitureId]: { message: "Missing furniture or user ID", type: 'error' }
      }));
      return;
    }

    // Set loading state for the specific action only
    setLoading(prev => ({ 
      ...prev, 
      [furnitureId]: {
        ...prev[furnitureId] || {approve: false, reject: false},
        [action]: true
      }
    }));

    try {
      const headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json"
      };

      const bodyContent = JSON.stringify({
        "status": status,
        "review_note": status === 'rejected' ? "Item rejected by admin" : "Item approved by admin"
      });

      // Apply visual indicator before API call
      const element = document.getElementById(`furniture-item-${furnitureId}`);
      if (element) {
        // Add a visual highlight based on action type
        if (status === 'approved') {
          element.style.transition = "all 0.5s ease";
          element.style.borderColor = "#10b981"; // Green border
          element.style.boxShadow = "0 0 10px rgba(16, 185, 129, 0.5)"; // Green glow
        } else {
          element.style.transition = "all 0.5s ease";
          element.style.borderColor = "#ef4444"; // Red border
          element.style.boxShadow = "0 0 10px rgba(239, 68, 68, 0.5)"; // Red glow
        }
      }

      console.log(`Sending status update for furniture ${furnitureId}, setting status to ${status}`);
      
      // Make the API request to update the status
      const response = await fetch(`http://127.0.0.1:10007/api/v1/furniture/status/user/${userId}/furniture/${furnitureId}`, {
        method: "POST",
        body: bodyContent,
        headers: headersList
      });

      const data = await response.json();
      
      console.log(`Status update response for ${furnitureId}:`, data);
      
      if (response.ok) {
        // If item is rejected, also delete it from the database
        if (status === 'rejected') {
          try {
            console.log(`Attempting to delete rejected furniture item ${furnitureId} from database`);
            
            // Make the API request to delete the furniture item
            const deleteResponse = await fetch(`http://127.0.0.1:10007/api/v1/furniture/delete/${furnitureId}`, {
              method: "post",
              headers: headersList
            });
            
            const deleteData = await deleteResponse.json();
            
            if (deleteResponse.ok) {
              console.log(`Successfully deleted furniture item ${furnitureId}:`, deleteData);
            } else {
              console.error(`Failed to delete furniture item ${furnitureId}:`, deleteData);
              // Continue with UI updates even if deletion fails
            }
          } catch (deleteError) {
            console.error(`Error deleting furniture item ${furnitureId}:`, deleteError);
            // Continue with UI updates even if deletion fails
          }
        }

        // Get a reference to the item before removing it
        const itemToRemove = furniture.find(item => (item.id || item._id) === furnitureId);
        
        if (element) {
          // Start the exit animation for both approve and reject actions
          element.style.opacity = "0";
          element.style.transform = "scale(0.9)";
          element.style.height = `${element.offsetHeight}px`; // Fix height to prevent layout shift
          element.style.marginBottom = "0";
          element.style.transition = "opacity 0.5s ease, transform 0.5s ease, margin 0.5s ease, height 0.5s ease";
          
          // Add message with animation
          const messageDiv = document.createElement('div');
          messageDiv.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center';
          messageDiv.innerHTML = `<span class="${status === 'approved' ? 'text-green-400' : 'text-red-400'} text-lg font-bold">
            ${status === 'approved' ? 'Approved!' : 'Rejected!'}</span>`;
          element.style.position = 'relative';
          element.appendChild(messageDiv);
          
          setTimeout(() => {
            element.style.height = "0px";
            element.style.overflow = "hidden";
          }, 300);
        }
        
        // Wait for animation to complete before removing from state
        setTimeout(() => {
          // Remove the item from state
          setFurniture(prevFurniture => 
            prevFurniture.filter(item => (item.id || item._id) !== furnitureId)
          );
          
          // Update statistics based on the removed item
          if (itemToRemove) {
            setTotalCounts(prev => {
              const isForSale = itemToRemove.is_for_sale === true || itemToRemove.is_for_sale === "true";
              const isForRent = itemToRemove.is_for_rent === true || itemToRemove.is_for_rent === "true";
              
              return {
                sale: isForSale ? Math.max(0, prev.sale - 1) : prev.sale,
                rent: isForRent ? Math.max(0, prev.rent - 1) : prev.rent,
                total: Math.max(0, prev.total - 1)
              };
            });
            
            // Update total items for pagination
            setTotalItems(prev => Math.max(0, prev - 1));
          }
          
          // If this was the last item on the page and not the first page, go to previous page
          const currentFurnitureCount = document.querySelectorAll('[id^="furniture-item-"]').length;
          if (currentFurnitureCount <= 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          } else if (currentFurnitureCount <= 1) {
            // If we're on the first page and removed the last item, refresh the list
            listAllFurniture();
          }
          
          // Set a more appropriate message for rejected items that indicates deletion
          setStatusMessage(prev => ({
            ...prev,
            [furnitureId]: { 
              message: status === 'approved' 
                ? "Furniture approved successfully and moved to approved listings" 
                : "Furniture rejected and removed from the system",
              type: 'success' 
            }
          }));
          
          // After successful update, refresh the list to ensure accurate data
          setTimeout(() => {
            listAllFurniture();
          }, 600);
          
        }, 500);
      } else {
        // Handle error response
        const errorMessage = data.message || "Failed to update furniture status";
        console.error("Status update error:", errorMessage);
        
        setStatusMessage(prev => ({
          ...prev,
          [furnitureId]: { 
            message: errorMessage, 
            type: 'error' 
          }
        }));
        
        // Reset visual styles if there was an error
        if (element) {
          element.style.borderColor = "";
          element.style.boxShadow = "";
        }
      }
    } catch (error: any) {
      console.error("Error updating furniture status:", error);
      setStatusMessage(prev => ({
        ...prev,
        [furnitureId]: { 
          message: `An error occurred: ${error.message || "Unknown error"}`, 
          type: 'error' 
        }
      }));
      
      // Reset visual styles if there was an error
      const element = document.getElementById(`furniture-item-${furnitureId}`);
      if (element) {
        element.style.borderColor = "";
        element.style.boxShadow = "";
      }
    } finally {
      // Reset only the specific action that was loading
      setLoading(prev => {
        const newLoading = {...prev};
        if (newLoading[furnitureId]) {
          newLoading[furnitureId] = {
            ...newLoading[furnitureId],
            [action]: false
          };
        }
        return newLoading;
      });
    }
  };

  // Updated sorting options with clearer structure
  const sortOptions = [
    { field: "createdAt", order: "desc", label: "Newest First" },
    { field: "createdAt", order: "asc", label: "Oldest First" },
    { field: "price", order: "asc", label: "Price (Low to High)" },
    { field: "price", order: "desc", label: "Price (High to Low)" },
    { field: "name", order: "asc", label: "Name (A-Z)" },
    { field: "name", order: "desc", label: "Name (Z-A)" }
  ];

  // Simplified sort change handler
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = sortOptions.find(option => 
      `${option.field}-${option.order}` === e.target.value
    );
    
    if (selectedOption) {
      setSortConfig({
        field: selectedOption.field,
        order: selectedOption.order as 'asc' | 'desc'
      });
      setCurrentPage(1); // Reset to first page when sorting changes
    }
  };

  // Handle furniture type change with pagination reset
  const handleFurnitureTypeChange = (type: 'all' | 'rent' | 'sale') => {
    setFurnitureType(type);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handler for seller selection change
  const handleSellerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSellerId(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    listAllFurniture();
  }, [currentPage, sortConfig.field, sortConfig.order, furnitureType, selectedSellerId]); // Added selectedSellerId

  useEffect(() => {
    fetchSellers(); // Fetch the list of sellers when component mounts
    listAllFurniture();
  }, []);

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-full z-30">
        <SuperSidebar />
      </div>

      {/* Main content area with fixed header */}
      <div className="flex-1 ml-0 lg:ml-72">
        {/* Fixed Header */}
        <div className="fixed top-0 right-0 left-0 lg:left-72 z-20 bg-gray-900 border-b border-gray-700">
          <SuperAdminHeader />
        </div>

        {/* Main content with padding for fixed header */}
        <main className="mt-16 p-6 overflow-y-auto">
          {error && <p className="text-red-400 text-center mb-4">{error}</p>}

          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-100">Furniture Catalog</h1>
              <button 
                onClick={() => listAllFurniture()}
                className="bg-blue-700 text-white px-4 py-2 rounded font-bold hover:bg-blue-800 transition duration-300 ease-in-out border border-blue-600"
              >
                Refresh List
              </button>
            </div>

            {/* Search and Sort Controls - Updated with Seller filter */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              {/* Auto-search Input */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search furniture..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-gray-800 text-gray-200 border border-gray-700 px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Seller Dropdown */}
              <div className="flex items-center">
                <label htmlFor="seller" className="text-gray-300 mr-2">Seller:</label>
                <select
                  id="seller"
                  value={selectedSellerId}
                  onChange={handleSellerChange}
                  className="bg-gray-800 text-gray-200 border border-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoadingSellers}
                >
                  <option value="all">All Sellers</option>
                  {sellers.map(seller => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name}
                    </option>
                  ))}
                </select>
                {isLoadingSellers && (
                  <div className="ml-2">
                    <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center">
                <label htmlFor="sort" className="text-gray-300 mr-2">Sort by:</label>
                <select
                  id="sort"
                  value={`${sortConfig.field}-${sortConfig.order}`}
                  onChange={handleSortChange}
                  className="bg-gray-800 text-gray-200 border border-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={`${option.field}-${option.order}`} value={`${option.field}-${option.order}`}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Enhanced Status Indicator with Detailed Counts */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center">
                {/* Left side - Overall counts with context */}
                <div className="text-center md:text-left mb-3 md:mb-0">
                  <h3 className="text-lg font-semibold text-blue-400">
                    {selectedSellerId !== 'all' ? (
                      <span>
                        {sellers.find(s => s.id === selectedSellerId)?.name || 'Selected Seller'} 
                        {furnitureType !== 'all' && ` (${furnitureType === 'rent' ? totalCounts.rent : totalCounts.sale})`}
                        {furnitureType === 'all' && ` (${totalCounts.total})`}
                      </span>
                    ) : (
                      <span>
                        {furnitureType === 'all' 
                          ? `All Items (${totalCounts.total})` 
                          : `${furnitureType === 'rent' ? 'Rent' : 'Sale'} Items (${furnitureType === 'rent' ? totalCounts.rent : totalCounts.sale})`
                        }
                      </span>
                    )}
                  </h3>
                </div>
                
                {/* Right side - Context-aware furniture counts */}
                <div className="flex space-x-6">
                  {furnitureType === 'all' ? (
                    <>
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-blue-400">{totalCounts.total}</span>
                        <span className="text-sm text-gray-400">Total Items</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-green-400">{totalCounts.sale}</span>
                        <span className="text-sm text-gray-400">For Sale</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-cyan-400">{totalCounts.rent}</span>
                        <span className="text-sm text-gray-400">For Rent</span>
                      </div>
                    </>
                  ) : furnitureType === 'rent' ? (
                    <>
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-cyan-400">{totalCounts.rent}</span>
                        <span className="text-sm text-gray-400">Available for Rent</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xl font-medium text-green-400">{totalCounts.sale}</span>
                        <span className="text-sm text-gray-400">Sale Items</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-green-400">{totalCounts.sale}</span>
                        <span className="text-sm text-gray-400">Available for Sale</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xl font-medium text-cyan-400">{totalCounts.rent}</span>
                        <span className="text-sm text-gray-400">Rent Items</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Active filter message - improved with context */}
              {furnitureType !== 'all' && (
                <div className="text-center mt-3 pt-3 border-t border-gray-700">
                  <p className="text-blue-300 font-medium">
                    {selectedSellerId !== 'all' ? (
                      <span>
                        {`Showing ${furnitureType === 'rent' ? totalCounts.rent : totalCounts.sale} furniture ${furnitureType === 'rent' ? 'for rent' : 'for sale'} from ${sellers.find(s => s.id === selectedSellerId)?.name || 'selected seller'}`}
                      </span>
                    ) : (
                      <span>
                        {`Showing ${furnitureType === 'rent' ? totalCounts.rent : totalCounts.sale} furniture items available ${furnitureType === 'rent' ? 'for rent' : 'for sale'}`}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Add Furniture Type Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-800 rounded-full p-1 flex">
                <button 
                  onClick={() => handleFurnitureTypeChange('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    furnitureType === 'all' 
                      ? 'bg-blue-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  } transition-colors duration-200`}
                >
                  All
                </button>
                <button 
                  onClick={() => handleFurnitureTypeChange('rent')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    furnitureType === 'rent' 
                      ? 'bg-blue-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  } transition-colors duration-200`}
                >
                  For Rent
                </button>
                <button 
                  onClick={() => handleFurnitureTypeChange('sale')}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    furnitureType === 'sale' 
                      ? 'bg-blue-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  } transition-colors duration-200`}
                >
                  For Sale
                </button>
              </div>
            </div>

            {/* Furniture Grid with improved empty state message */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
              {furniture.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400 text-lg">
                    {selectedSellerId !== 'all' && furnitureType !== 'all'
                      ? `No ${furnitureType === 'rent' ? 'furniture for rent' : 'furniture for sale'} found from this seller.`
                      : selectedSellerId !== 'all'
                      ? 'No furniture found from this seller.'
                      : furnitureType !== 'all'
                      ? `No furniture for ${furnitureType === 'rent' ? 'rent' : 'sale'} found.`
                      : 'No furniture found.'}
                  </p>
                  <button 
                    onClick={() => {
                      handleFurnitureTypeChange('all');
                      setSelectedSellerId('all');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
                  >
                    Show all furniture
                  </button>
                </div>
              ) : (
                furniture.map((item) => {
                  const itemId = item.id || item._id;
                  const userId = item.created_by || item.user_id;
                  return (
                    <div
                      key={itemId}
                      id={`furniture-item-${itemId}`}
                      className="bg-gray-800 rounded-xl border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      {/* Main Image Display */}
                      {selectedImageMap[itemId] && (
                        <div className="mb-4 h-48 overflow-hidden rounded-t-xl">
                          <img 
                            src={selectedImageMap[itemId]}
                            alt={item.title || item.name || "Furniture"} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="p-6 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Title:</span>
                          <span className="text-gray-200 text-right">{item.title || item.name || "Untitled"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">User:</span>
                          <span className="text-gray-200 text-right">
                            {userMap[userId] 
                              ? `${userMap[userId].firstName} ${userMap[userId].lastName}` 
                              : (userId || "Not available")}
                          </span>
                        </div>
                        
                        {/* Display prices based on sale/rent flags */}
                        {(item.is_for_sale === true || item.is_for_sale === "true") && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Sale Price:</span>
                            <span className="text-gray-200">${item.price}</span>
                          </div>
                        )}
                        {(item.is_for_rent === true || item.is_for_rent === "true") && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Rent Price:</span>
                            <span className="text-gray-200">${item.rent_price} <span className="text-xs">per day</span></span>
                          </div>
                        )}
                        {!(item.is_for_sale === true || item.is_for_sale === "true") && 
                          !(item.is_for_rent === true || item.is_for_rent === "true") && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Price:</span>
                            <span className="text-gray-200">${item.rent_price || item.price || "N/A"}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-gray-400">Category:</span>
                          <span className="text-gray-200">{item.category}</span>
                        </div>
                        
                        {item.description && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Description:</span>
                            <span className="text-gray-200 text-right max-w-[70%]">{item.description.substring(0, 100)}...</span>
                          </div>
                        )}
                        
                        {/* Status message display */}
                        {statusMessage[itemId] && (
                          <p className={`text-sm ${statusMessage[itemId].type === 'success' ? 'text-green-400' : 'text-red-400'} my-2`}>
                            {statusMessage[itemId].message}
                          </p>
                        )}
                        
                        {/* Approval/Rejection buttons */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => updateFurnitureStatus(itemId, userId, 'approved')}
                            disabled={loading[itemId]?.approve || loading[itemId]?.reject}
                            className={`flex-1 px-3 py-2 rounded text-sm font-medium flex justify-center items-center gap-2 ${
                              loading[itemId]?.approve 
                                ? 'bg-green-900 text-green-300 cursor-not-allowed' 
                                : 'bg-green-700 hover:bg-green-800 text-green-100 border border-green-600'
                            }`}
                          >
                            {loading[itemId]?.approve ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-green-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Approving...</span>
                              </>
                            ) : 'Approve'}
                          </button>
                          <button
                            onClick={() => updateFurnitureStatus(itemId, userId, 'rejected')}
                            disabled={loading[itemId]?.approve || loading[itemId]?.reject}
                            className={`flex-1 px-3 py-2 rounded text-sm font-medium flex justify-center items-center gap-2 ${
                              loading[itemId]?.reject 
                                ? 'bg-red-900 text-red-300 cursor-not-allowed' 
                                : 'bg-red-700 hover:bg-red-800 text-red-100 border border-red-600'
                            }`}
                          >
                            {loading[itemId]?.reject ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Rejecting...</span>
                              </>
                            ) : 'Reject'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Pagination Controls - Updated with Previous/Next text */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-700 text-gray-300 disabled:opacity-50 hover:bg-gray-600"
                    title="First Page"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-700 text-gray-300 disabled:opacity-50 hover:bg-gray-600 flex items-center"
                  >
                    <span className="mr-1">&lsaquo;</span> Previous
                  </button>
                  
                  <span className="px-4 py-1 rounded bg-blue-700 text-white">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-700 text-gray-300 disabled:opacity-50 hover:bg-gray-600 flex items-center"
                  >
                    Next <span className="ml-1">&rsaquo;</span>
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-700 text-gray-300 disabled:opacity-50 hover:bg-gray-600"
                    title="Last Page"
                  >
                    &raquo;
                  </button>
                </nav>
              </div>
            )}
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default Approved;