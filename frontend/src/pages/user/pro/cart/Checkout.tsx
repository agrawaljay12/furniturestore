import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainHeader from "../../../../components/user/MainHeader";
import MainFooter from "../../../../components/user/MainFooter";

interface Product {
  _id: string;
  title: string;
  price: number;
  image?: string;
  description: string;
  category: string;
  is_for_rent: boolean;
  rent_price: string;
  is_for_sale: boolean;
  condition: string;
  availability_status: string;
  dimensions: string;
  location: string;
  created_by: string;
  created_at: string;
  images: string[];
  quantity?: number;
  totalPrice?: string; // To hold the total price for each item
  currentImageIndex?: number; // To hold the current image index for each item
  selectedDuration?: string;
  discount?: number; // Added discount field
  discountedPrice?: string; // Added discounted price field
}

// Update address formatting function to handle empty fields properly
const formatAddress = (data: any) => {
  // Filter out empty, null, or undefined values before joining
  const parts = [
    data.address, 
    data.city, 
    data.state, 
    data.country, 
    data.pin_code || data.pincode || data.zipcode
  ].filter(part => part && part.trim() !== "");
  
  // If no valid parts, return placeholder text
  if (parts.length === 0) return "No address available";
  
  // Join the valid parts with commas
  return parts.join(", ");
};

const CheckoutPage: React.FC = () => {
  // const durationOptions = [
  //   { type: "Daily", values: [1, 3, 7], label: "Day" },
  //   { type: "Weekly", values: [2, 3], label: "Week" },
  //   { type: "Monthly", values: [1, 3, 6], label: "Month" }
  // ];
  const [cart, setCart] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPhone2, setNewPhone2] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newPinCode, setNewPinCode] = useState("");
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [showOrderSummary, setShowOrderSummary] = useState(true);
  

  const navigate = useNavigate();
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];

  // Fetch user details from the backend
  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`https://furnspace.onrender.com/api/v1/auth/user/fetch/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUser(data);
      setNewFirstName(data.first_name);
      setNewLastName(data.last_name);
      setNewEmail(data.email);
      setNewPhone(data.phone);
      setNewPhone2(data.phone2);
      setNewAddress(data.address);
      setNewCity(data.city);
      setNewState(data.state);
      setNewCountry(data.country);
      setNewPinCode(data.pin_code);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to fetch user details. Please try again.");
    }
  };

  // Fetch product details from local storage
  useEffect(() => {
    const userId = localStorage.getItem("token");
    if (userId) {
      // Fetch selected items from local storage using userId
      const storedSelectedItems = localStorage.getItem(`selectedItems_${userId}`);
      if (storedSelectedItems) {
        const selectedItems = JSON.parse(storedSelectedItems);

        // Clean up selectedItems by removing the suffix (e.g., "-1", "-0")
        const cleanedSelectedItems = selectedItems.map((item: string) => item.split("-")[0]);

        // Fetch cart from local storage
        const storedCart = localStorage.getItem(`cart_${userId}`);
        if (storedCart) {
          const cartItems = JSON.parse(storedCart);

          // Debugging: Log selected items and cart items
          console.log("Selected Items:", selectedItems);
          console.log("Cleaned Selected Items:", cleanedSelectedItems);
          console.log("Cart Items:", cartItems);

          // Filter cart items based on cleanedSelectedItems
          const detailedCart = cartItems.filter((item: Product) =>
            cleanedSelectedItems.includes(item._id)
          );

          // Debugging: Log filtered cart items
          console.log("Filtered Cart Items:", detailedCart);

          setCart(detailedCart);
        }
      }

      // Fetch user details from backend
      fetchUserDetails(userId);
    }
    setLoading(false);
  }, [location.state]);


  // Debugging
  console.log("Selected Items:", selectedItems);
  console.log("Cart Items:", JSON.parse(localStorage.getItem(`cart_${localStorage.getItem("token")}`) || "[]"));
  console.log("Filtered Cart Items:", cart);

  // show detail of prduct in detail
  // const handleDetailClick = (product: Product) => {
  //   setSelectedProduct(product);
  // };

  // Improved getDiscountedPrice function that properly handles discounts
  const getDiscountedPrice = (item: Product): number => {
    if (item.discount && item.discount > 0) {
      const basePrice = item.is_for_rent ? parseFloat(item.rent_price) : item.price;
      return basePrice * (1 - (item.discount / 100));
    } else {
      // Return regular price if no discount
      return item.is_for_rent ? parseFloat(item.rent_price) : item.price;
    }
  };

  // Function to calculate days based on selected duration
  const calculateDaysFromDuration = (durationString?: string): number => {
    if (!durationString) return 1; // Default to 1 day if no duration
    
    const [durationType, value] = durationString.split("-");
    const numericValue = parseInt(value);
    
    switch (durationType) {
      case "Daily": return numericValue;
      case "Weekly": return numericValue * 7;
      case "Monthly": return numericValue * 30;
      default: return 1;
    }
  };

  // Calculate the total price of the products in the cart with improved duration handling
  const calculateTotalPrice = () => {
    return cart
      .reduce((total, item) => {
        const itemPrice = getDiscountedPrice(item);
        const quantity = item.quantity || 1;
        
        if (item.is_for_rent) {
          const days = calculateDaysFromDuration(item.selectedDuration);
          return total + (itemPrice * days * quantity);
        } else {
          return total + (itemPrice * quantity);
        }
      }, 0)
      .toFixed(2);
  };

  // Calculate the rent and buy product quantities and prices with improved accuracy
  const calculateQuantitiesAndPrices = () => {
    let rentQuantity = 0;
    let buyQuantity = 0;
    let rentTotalPrice = 0;
    let buyTotalPrice = 0;
  
    cart.forEach((item) => {
      const quantity = item.quantity || 1;
      const basePrice = getDiscountedPrice(item);
      
      if (item.is_for_sale) {
        buyQuantity += quantity;
        buyTotalPrice += basePrice * quantity;
      }
      
      if (item.is_for_rent) {
        rentQuantity += quantity;
        
        // Calculate duration-based price with improved handling
        const days = calculateDaysFromDuration(item.selectedDuration);
        rentTotalPrice += basePrice * days * quantity;
      }
    });
  
    return { 
      rentQuantity, 
      buyQuantity, 
      rentTotalPrice: parseFloat(rentTotalPrice.toFixed(2)), 
      buyTotalPrice: parseFloat(buyTotalPrice.toFixed(2)) 
    };
  };

  const { rentQuantity, buyQuantity, rentTotalPrice, buyTotalPrice } = calculateQuantitiesAndPrices();

  // Function to calculate the total quantity of items in the cart
  const calculateTotalQuantity = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  // Modify handlePlaceOrder to include category information
  const handlePlaceOrder = () => {
    // Prepare order data to send to payment page
    const orderData = {
      user_id: localStorage.getItem("token"),
      user_name: `${user?.data?.first_name || ''} ${user?.data?.last_name || ''}`.trim(),
      user_phone: user?.data?.phone || '',
      user_email: user?.data?.email || '', // Ensure email is included
      furniture_ids: cart.map(item => item._id),
      total_price: parseFloat(calculateTotalPrice()),
      is_buying: buyQuantity > 0 && rentQuantity === 0, // True if only buying items
      duration: rentQuantity > 0 ? 
        // Get the duration of the first rental product if available
        cart.find(item => item.is_for_rent && item.selectedDuration)?.selectedDuration : null,
      delivery_address: {
        street: user?.data?.address || newAddress,
        city: user?.data?.city || newCity,
        state: user?.data?.state || newState,
        country: user?.data?.country || newCountry,
        zipcode: user?.data?.pin_code || newPinCode,
      },
      items: cart.map(item => {
        // Calculate the actual price including any discounts
        const actualPrice = getDiscountedPrice(item);
        
        return {
          id: item._id,
          title: item.title,
          price: actualPrice,
          original_price: item.is_for_rent ? parseFloat(item.rent_price) : parseFloat(item.price.toString()),
          quantity: item.quantity || 1,
          category: item.category,
          is_for_rent: item.is_for_rent,
          is_for_sale: item.is_for_sale,
          duration: item.selectedDuration || null,
          image: item.image,
          images: item.images,
          discount: item.discount || 0,
          discounted_price: actualPrice
        };
      })
    };
    
    // Store user email in localStorage if available
    if (user?.data?.email) {
      localStorage.setItem("userEmail", user.data.email);
    }
    
    // Store order data in localStorage for the payment page
    localStorage.setItem("current_order", JSON.stringify(orderData));
    
    // Navigate to payment page
    navigate("/payment");
  };

  // Fetch saved addresses from the API
  const fetchSavedAddresses = async () => {
    try {
      const userId = localStorage.getItem("token");
      if (!userId) {
        console.error("User ID not found");
        return;
      }
      
      const headersList = { 
        "Content-Type": "application/json" 
      };

      console.log("Fetching addresses for user:", userId);

      const response = await fetch(`https://furnspace.onrender.com/api/v1/address/get_address/${userId}`, { 
        method: "GET", 
        headers: headersList 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log("Raw address response:", responseData);
      
      // Specifically handle the case where addresses are in responseData.data
      if (responseData && responseData.data) {
        // If data is an array, use it directly
        if (Array.isArray(responseData.data)) {
          console.log("Found address array in responseData.data:", responseData.data);
          setSavedAddresses(responseData.data);
          setShowSavedAddresses(true);
          return;
        }
        
        // If data is an object containing address objects
        if (typeof responseData.data === 'object') {
          // Try to extract addresses as an array from the data object
          const addressesArray = [];
          
          // If the data object contains address objects with numeric keys
          for (const key in responseData.data) {
            if (typeof responseData.data[key] === 'object') {
              addressesArray.push({
                _id: key,
                ...responseData.data[key]
              });
            }
          }
          
          if (addressesArray.length > 0) {
            console.log("Extracted addresses from data object:", addressesArray);
            setSavedAddresses(addressesArray);
            setShowSavedAddresses(true);
            return;
          }
          
          // If data itself looks like a single address
          if (responseData.data.address || responseData.data.city) {
            console.log("Data appears to be a single address object:", responseData.data);
            setSavedAddresses([responseData.data]);
            setShowSavedAddresses(true);
            return;
          }
        }
      }
      
      // Fallbacks for other response formats
      
      // If the responseData is directly an array
      if (Array.isArray(responseData)) {
        console.log("Response is directly an array:", responseData);
        setSavedAddresses(responseData);
        setShowSavedAddresses(true);
        return;
      }
      
      // If responseData itself looks like a single address
      if (!Array.isArray(responseData) && typeof responseData === 'object' && 
          (responseData.address || responseData.city)) {
        console.log("Response appears to be a single address object:", responseData);
        setSavedAddresses([responseData]);
        setShowSavedAddresses(true);
        return;
      }
      
      console.error("Could not identify address structure in API response:", responseData);
      alert("Could not load addresses in the expected format. Please try again.");
      
    } catch (error) {
      console.error("Error fetching saved addresses:", error);
      alert("Failed to load saved addresses. Please try again.");
    }
  };

  // Improved handle select address function with better logging
  const handleSelectAddress = (address: any) => {
    console.log("Selected address object:", address);
    
    const addressId = address._id || address.id;
    setSelectedAddressId(addressId);
    
    // More detailed logging for debugging
    console.log("Address fields present:", Object.keys(address));
    
    // Clean up address fields - ensure no undefined or empty values
    const cleanAddress = address.address && address.address.trim() !== "" ? address.address.trim() : "";
    const cleanCity = address.city && address.city.trim() !== "" ? address.city.trim() : "";
    const cleanState = address.state && address.state.trim() !== "" ? address.state.trim() : "";
    const cleanCountry = address.country && address.country.trim() !== "" ? address.country.trim() : "";
    const cleanPinCode = address.pin_code || address.pincode || address.zipcode || "";
    
    console.log("Cleaned address fields:", {
      address: cleanAddress,
      city: cleanCity,
      state: cleanState,
      country: cleanCountry,
      pinCode: cleanPinCode
    });
    
    setNewAddress(cleanAddress);
    setNewCity(cleanCity);
    setNewState(cleanState);
    setNewCountry(cleanCountry);
    setNewPinCode(cleanPinCode);
    
    // Update the user object with selected address
    setUser({
      data: {
        ...user.data,
        address: cleanAddress,
        city: cleanCity, 
        state: cleanState,
        country: cleanCountry,
        pin_code: cleanPinCode,
      },
    });
    
    // Hide the saved addresses list
    setShowSavedAddresses(false);
    setIsEditingAddress(false);
  };

  const handleAddressChange = () => {
    if (
      newFirstName.trim() !== "" &&
      newLastName.trim() !== "" &&
      newEmail.trim() !== "" &&
      newPhone.trim() !== "" &&
      newAddress.trim() !== "" &&
      newCity.trim() !== "" &&
      newState.trim() !== "" &&
      newCountry.trim() !== "" &&
      newPinCode.trim() !== ""
    ) {
      setUser({
        data: {
          ...user.data,
          first_name: newFirstName,
          last_name: newLastName,
          email: newEmail,
          phone: newPhone,
          phone2: newPhone2,
          address: newAddress,
          city: newCity,
          state: newState,
          country: newCountry,
          pin_code: newPinCode,
        },
      });
      setIsEditingAddress(false);
      // Update user address in local storage
      const userId = localStorage.getItem("token");
      if (userId) {
        localStorage.setItem(
          `user_${userId}`,
          JSON.stringify({
            data: {
              ...user.data,
              first_name: newFirstName,
              last_name: newLastName,
              email: newEmail,
              phone: newPhone,
              phone2: newPhone2,
              address: newAddress,
              city: newCity,
              state: newState,
              country: newCountry,
              pin_code: newPinCode,
            },
          })
        );
      }
    }
  };

  const handleCancelEdit = () => {
    setNewFirstName(user.data.first_name);
    setNewLastName(user.data.last_name);
    setNewEmail(user.data.email);
    setNewPhone(user.data.phone);
    setNewPhone2(user.data.phone2);
    setNewAddress(user.data.address);
    setNewCity(user.data.city);
    setNewState(user.data.state);
    setNewCountry(user.data.country);
    setNewPinCode(user.data.pin_code);
    setIsEditingAddress(false);
    setShowSavedAddresses(false);
  };

  const handleAddAddress = async () => {
    const userId = localStorage.getItem("token");
    if (!userId) {
      alert("User not logged in!");
      return;
    }

    const addressData = {
      user_id: userId,
      address: newAddress,
      pin_code: newPinCode,
      state: newState,
      city: newCity,
      country: newCountry,
    };

    try {
      const headersList = {
        "Content-Type": "application/json",
      };

      const bodyContent = JSON.stringify(addressData);

      const response = await fetch("http://localhost:10007/api/v1/address/add", {
        method: "POST",
        body: bodyContent,
        headers: headersList,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Address added successfully:", data);

      // Store the new address in localStorage
      const storedAddresses = localStorage.getItem(`addresses_${userId}`) || "[]";
      const addresses = JSON.parse(storedAddresses);
      addresses.push(addressData);
      localStorage.setItem(`addresses_${userId}`, JSON.stringify(addresses));

      // Reset form fields
      setNewAddress("");
      setNewCity("");
      setNewState("");
      setNewCountry("");
      setNewPinCode("");

      // Close the add address form
      setIsAddingAddress(false);

      alert("Address added successfully!");
    } catch (error) {
      console.error("Error adding address:", error);
      alert("Failed to add address. Please try again.");
    }
  };

  const getTitle = () => {
    const hasRentItems = cart.some((item) => item.is_for_rent);
    const hasSaleItems = cart.some((item) => item.is_for_sale);

    if (hasRentItems && hasSaleItems) {
      return "Selected Items (Rent & Buy)";
    } else if (hasRentItems) {
      return "Selected Items (Rent)";
    } else if (hasSaleItems) {
      return "Selected Items (Buy)";
    } else {
      return "Selected Items";
    }
  };

  // Filter rent and buy products from the cart
  const rentProducts = cart.filter((item) => item.is_for_rent);
  const buyProducts = cart.filter((item) => item.is_for_sale);

  const handleDurationChange = (productId: string, duration: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId ? { ...item, selectedDuration: duration } : item
      )
    );
  };

  const handleAddressChangeClick = () => {
    setIsEditingAddress(true);
    fetchSavedAddresses(); // Fetch saved addresses when clicking "Change"
  };

  // Helper function to get the appropriate image URL
  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      // If product has images array, return the first image
      return product.images[0];
    } else if (product.image) {
      // Fall back to single image property if available
      return product.image;
    } else {
      // Default placeholder if no image is available
      return "https://via.placeholder.com/150?text=No+Image";
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 shadow-lg">
        <MainHeader logoText="Furniture Store" onSearch={() => {}} />
      </div>

      <div className="min-h-screen bg-gray-50 px-8 pt-24 pb-16">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800">Checkout</h1>

        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="py-2 px-6 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-300"
          >
            Back to Cart
          </button>
  
          <div className="flex mx-auto">
            <button
              onClick={() => setShowOrderSummary(true)}
              className={`py-2 px-6 ${showOrderSummary ? "bg-teal-500" : "bg-gray-300"} text-white rounded-lg hover:bg-teal-400 transition duration-300`}
            >
              Order Summary
            </button>
            <button
              onClick={() => setShowOrderSummary(false)}
              className={`py-2 px-6 ml-4 ${!showOrderSummary ? "bg-teal-500" : "bg-gray-300"} text-white rounded-lg hover:bg-teal-400 transition duration-300`}
            >
              Detail
            </button>
          </div>
        </div>

        {showOrderSummary ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="mb-4">
              <p className="text-lg">Total Items: {calculateTotalQuantity()}</p>
              
              {rentQuantity > 0 && (
                <div className="ml-4 mt-2">
                  <p className="text-lg font-medium text-blue-700">Rental Items:</p>
                  <p className="text-md ml-2">Quantity: {rentQuantity}</p>
                  <p className="text-md ml-2">Subtotal: ${rentTotalPrice.toFixed(2)}</p>
                </div>
              )}
              
              {buyQuantity > 0 && (
                <div className="ml-4 mt-2">
                  <p className="text-lg font-medium text-amber-700">Purchase Items:</p>
                  <p className="text-md ml-2">Quantity: {buyQuantity}</p>
                  <p className="text-md ml-2">Subtotal: ${buyTotalPrice.toFixed(2)}</p>
                </div>
              )}
              
              <div className="mt-4 pt-2 border-t border-gray-200">
                <p className="text-xl font-bold text-teal-700">Grand Total: ${calculateTotalPrice()}</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Delivery to</h2>
            {user && (
              <div className="mb-4 relative">
                <p className="text-lg">
                  Name: {user.data.first_name} {user.data.last_name}
                </p>
                <p className="text-lg">Email: {user.data.email}</p>
                <div className="flex items-center">
                  {/* Display address with proper formatting to avoid empty commas */}
                  <p className="text-lg">Address: {user.data ? formatAddress(user.data) : "No address available"}</p>
                  <button
                    onClick={handleAddressChangeClick}
                    className="absolute right-0 py-1 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Change
                  </button>
                </div>
                <p className="text-lg">Contact no: {user.data.phone}</p>
                {user.data.phone2 && (
                  <p className="text-lg">Contact no2: {user.data.phone2}</p>
                )}
                
                {/* Saved addresses display */}
                {showSavedAddresses && savedAddresses.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">Your Saved Addresses</h3>
                    <div className="space-y-3">
                      {savedAddresses.map((address, index) => {
                        console.log(`Rendering address ${index}:`, address);
                        
                        // Extract address fields with fallbacks
                        const addressId = address._id || address.id || `address-${index}`;
                        const street = address.address || address.street || "No street address";
                        const city = address.city || "";
                        const state = address.state || "";
                        const country = address.country || "";
                        const pincode = address.pin_code || address.pincode || address.zipcode || "";
                        
                        // Format address parts for display
                        const cityState = [city, state].filter(Boolean).join(", ");
                        const countryPin = [country, pincode].filter(Boolean).join(", ");
                        
                        return (
                          <div key={addressId} className="flex items-start p-3 border rounded">
                            <input
                              type="radio"
                              name="savedAddress"
                              id={`address-${addressId}`}
                              checked={selectedAddressId === addressId}
                              onChange={() => handleSelectAddress(address)}
                              className="mt-1 mr-2"
                            />
                            <label htmlFor={`address-${addressId}`} className="cursor-pointer flex-1">
                              <p className="font-medium">{street}</p>
                              {cityState && <p className="text-gray-600">{cityState}</p>}
                              {countryPin && <p className="text-gray-600">{countryPin}</p>}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex space-x-4 mt-3">
                      <button
                        onClick={() => setShowSavedAddresses(false)}
                        className="py-1 px-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {isEditingAddress && !showSavedAddresses && (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      placeholder="First Name"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      placeholder="Last Name"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Email"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Phone"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newPhone2}
                      onChange={(e) => setNewPhone2(e.target.value)}
                      placeholder="Phone 2"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Address"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="City"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="State"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      placeholder="Country"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newPinCode}
                      onChange={(e) => setNewPinCode(e.target.value)}
                      placeholder="Pin Code"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <div className="flex space-x-4 mt-2">
                      <button
                        onClick={handleAddressChange}
                        className="py-2 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                      >
                        Save Address
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="py-2 px-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={fetchSavedAddresses}
                        className="py-2 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                      >
                        Choose Saved Address
                      </button>
                    </div>
                  </div>
                )}
                {!isEditingAddress && !showSavedAddresses && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="mt-4 py-2 px-6 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition duration-300"
                  >
                    Add New Address
                  </button>
                )}
              </div>
            )}
            {isAddingAddress && (
              <div className="mt-4">
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Address"
                  className="py-2 px-4 border rounded-lg w-full mb-2"
                />
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="City"
                  className="py-2 px-4 border rounded-lg w-full mb-2"
                />
                <input
                  type="text"
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  placeholder="State"
                  className="py-2 px-4 border rounded-lg w-full mb-2"
                />
                <input
                  type="text"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  placeholder="Country"
                  className="py-2 px-4 border rounded-lg w-full mb-2"
                />
                <input
                  type="text"
                  value={newPinCode}
                  onChange={(e) => setNewPinCode(e.target.value)}
                  placeholder="Pin Code"
                  className="py-2 px-4 border rounded-lg w-full mb-2"
                />
                <div className="flex space-x-4 mt-2">
                  <button
                    onClick={handleAddAddress}
                    className="py-2 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                  >
                    Save Address
                  </button>
                  <button
                    onClick={() => setIsAddingAddress(false)}
                    className="py-2 px-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              className="mt-4 py-2 px-6 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition duration-300"
            >
              Place Order
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-8">
            {/* Selected Products Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">{getTitle()}</h3>
              <div className="flex flex-wrap gap-6">
                {rentProducts.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">Rent Products</h2>
                    {rentProducts.map((item) => {
                      // Calculate days based on selected duration
                      const days = calculateDaysFromDuration(item.selectedDuration);
                      const originalPrice = parseFloat(item.rent_price);
                      const discountedPrice = getDiscountedPrice(item);
                      const totalPrice = (discountedPrice * days * (item.quantity || 1)).toFixed(2);
                      const hasDiscount = item.discount && item.discount > 0;

                      return (
                        <div key={item._id} className="mb-4 flex border-b pb-4">
                          {/* Add image display */}
                          <div className="w-24 h-24 flex-shrink-0 mr-4 overflow-hidden rounded border">
                            <img 
                              src={getProductImage(item)} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image";
                              }}
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="text-lg font-bold">{item.title}</h3>
                            <p className="text-gray-600 mb-2 font-bold">{item.category}</p>
                            <p className="text-gray-600 mb-2">{item.description}</p>
                            
                            <div className="flex gap-4 mb-2">
                              {/* Duration Dropdown */}
                              <div>
                                <label>Duration: </label>
                                <select
                                  value={item.selectedDuration || ""}
                                  onChange={(e) => handleDurationChange(item._id, e.target.value)}
                                  className="ml-2 p-1 border rounded"
                                >
                                  <option value="">Select duration</option>
                                  <optgroup label="Daily">
                                    <option value="Daily-1">1 Day</option>
                                    <option value="Daily-3">3 Days</option>
                                    <option value="Daily-7">7 Days (1 Week)</option>
                                  </optgroup>
                                  <optgroup label="Weekly">
                                    <option value="Weekly-2">2 Weeks</option>
                                    <option value="Weekly-3">3 Weeks</option>
                                  </optgroup>
                                  <optgroup label="Monthly">
                                    <option value="Monthly-1">1 Month</option>
                                    <option value="Monthly-3">3 Months</option>
                                    <option value="Monthly-6">6 Months</option>
                                  </optgroup>
                                </select>
                              </div>

                              {/* Quantity Display */}
                              <div>
                                <p className="text-gray-600">Quantity: {item.quantity || 1}</p>
                              </div>
                            </div>

                            {hasDiscount ? (
                              <div>
                                <p className="text-gray-600 mb-2">
                                  <span className="line-through text-gray-400">Daily Rate: ${originalPrice.toFixed(2)}/day</span>
                                </p>
                                <p className="text-green-600 font-semibold mb-2">
                                  Discounted Rate: ${discountedPrice.toFixed(2)}/day ({item.discount}% OFF)
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-600 mb-2">
                                Daily Rate: ${originalPrice.toFixed(2)}/day
                              </p>
                            )}
                            
                            <p className="text-gray-600 mb-2">
                              Total Duration: {days} day{days !== 1 ? 's' : ''}
                            </p>
                            <p className="text-gray-600 mb-2">
                              Total Price: ${totalPrice}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-lg font-bold">Total Rent Price: ${rentTotalPrice.toFixed(2)}</p>
                  </div>
                )}
                {/* Display buy products */}
                {buyProducts.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">Buy Products</h2>
                    {buyProducts.map((item) => {
                      const originalPrice = item.price;
                      const discountedPrice = getDiscountedPrice(item);
                      const totalPrice = (discountedPrice * (item.quantity || 1)).toFixed(2);
                      const hasDiscount = item.discount && item.discount > 0;
                      
                      return (
                        <div key={item._id} className="mb-4 flex border-b pb-4">
                          {/* Add image display */}
                          <div className="w-24 h-24 flex-shrink-0 mr-4 overflow-hidden rounded border">
                            <img 
                              src={getProductImage(item)} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/150?text=No+Image";
                              }}
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="text-lg font-bold">{item.title}</h3>
                            <p className="text-gray-600 mb-2 font-bold">{item.category}</p>
                            <p className="text-gray-600 mb-2">{item.description}</p>
                            
                            {hasDiscount ? (
                              <div>
                                <p className="text-gray-600 mb-2">
                                  <span className="line-through text-gray-400">Original Price: ${originalPrice}</span>
                                </p>
                                <p className="text-green-600 font-semibold mb-2">
                                  Discounted Price: ${discountedPrice.toFixed(2)} ({item.discount}% OFF)
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-600 mb-2">Buy Price: ${originalPrice}</p>
                            )}
                            
                            <p className="text-gray-600 mb-2">Quantity: {item.quantity || 1}</p>
                            <p className="text-gray-600 mb-2">
                              Total Price: ${totalPrice}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-lg font-bold">Total Buy Price: ${buyTotalPrice.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Total Price Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Total Price</h3>
              <p className="text-lg">Total Price: ${calculateTotalPrice()}</p>
            </div>

            {/* Delivery Address Section */}
            {user && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-4">Delivery Address</h3>
                {!isEditingAddress && !isAddingAddress ? (
                  <div className="relative">
                    <p className="text-lg">
                      Name: {user.data.first_name} {user.data.last_name}
                    </p>
                    <p className="text-lg">Email: {user.data.email}</p>
                    {/* Display address directly using data fields with commas */}
                    <p className="text-lg">Address: {user.data ? formatAddress(user.data) : "No address available"}</p>
                    <p className="text-lg">Contact no: {user.data.phone}</p>
                    {user.data.phone2 && (
                      <p className="text-lg">Contact no2: {user.data.phone2}</p>
                    )}
                    <button
                      onClick={handleAddressChangeClick}
                      className="absolute top-0 right-0 py-1 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="mt-4 py-2 px-6 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition duration-300"
                    >
                      Add New Address
                    </button>
                  </div>
                ) : isAddingAddress ? (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Address"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="City"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="State"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      placeholder="Country"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newPinCode}
                      onChange={(e) => setNewPinCode(e.target.value)}
                      placeholder="Pin Code"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <div className="flex space-x-4 mt-2">
                      <button
                        onClick={handleAddAddress}
                        className="py-2 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                      >
                        Save Address
                      </button>
                      <button
                        onClick={() => setIsAddingAddress(false)}
                        className="py-2 px-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      placeholder="First Name"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      placeholder="Last Name"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Email"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Phone"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newPhone2}
                      onChange={(e) => setNewPhone2(e.target.value)}
                      placeholder="Phone 2"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Address"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="City"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="State"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      placeholder="Country"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <input
                      type="text"
                      value={newPinCode}
                      onChange={(e) => setNewPinCode(e.target.value)}
                      placeholder="Pin Code"
                      className="py-2 px-4 border rounded-lg w-full mb-2"
                    />
                    <div className="flex space-x-4 mt-2">
                      <button
                        onClick={handleAddressChange}
                        className="py-2 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                      >
                        Save Address
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="py-2 px-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={fetchSavedAddresses}
                        className="py-2 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                      >
                        Choose Saved Address
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Place Order Button */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <button
                onClick={handlePlaceOrder}
                className="mt-4 py-2 px-6 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition duration-300"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>

      <MainFooter />
    </>
  );
};

export default CheckoutPage;