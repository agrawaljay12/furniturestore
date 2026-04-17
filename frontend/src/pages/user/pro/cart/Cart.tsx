import React, { useEffect, useState } from "react";
import MainHeader from "../../../../components/user/MainHeader";
import { useNavigate } from "react-router-dom";
import MainFooter from "../../../../components/user/MainFooter";
import { useCart } from "../cart/CartContext";

interface Product {
  _id: string;
  title: string;
  price: string;
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
  totalPrice?: string;
  discount?: number; // Added discount field
  discountedPrice?: string; // Added discounted price field
}

const CartPage: React.FC = () => {
  const { cart, setCart, updateCartCount } = useCart();
  const navigate = useNavigate();
  const [, setCurrentImageIndexes] = useState<number[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem("token");
    if (userId) {
      const storedCart = localStorage.getItem(`cart_${userId}`);
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    }
    updateCartCount(); // Ensure cart count is updated on page load
  }, [setCart, updateCartCount]);

  useEffect(() => {
    setCurrentImageIndexes(cart.map(() => 0)); // Initialize current image index for each cart item
  }, [cart]);

  const handleRemoveFromCart = (productId: string, index: number) => {
    const userId = localStorage.getItem("token");
    if (!userId) return alert("User not found.");
    if (!window.confirm("Remove this item from cart?")) return;
    const updatedCart = cart.filter((product, i) => !(product._id === productId && i === index));
    setCart(updatedCart);
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
    updateCartCount(); // Update the cart count
    
    // Also remove from selectedItems if it was selected
    setSelectedItems(selectedItems.filter(item => item !== `${productId}-${index}`));
  };

  // Add quantity increase function
  const handleIncreaseQuantity = (productId: string, index: number) => {
    const userId = localStorage.getItem("token");
    if (!userId) return alert("User not found.");
    
    const updatedCart = cart.map((product, i) => {
      if (product._id === productId && i === index) {
        const currentQty = product.quantity || 1;
        // Set a reasonable maximum quantity (e.g., 10)
        const newQty = Math.min(currentQty + 1, 10); 
        return { ...product, quantity: newQty };
      }
      return product;
    });
    
    setCart(updatedCart);
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
  };

  // Add quantity decrease function
  const handleDecreaseQuantity = (productId: string, index: number) => {
    const userId = localStorage.getItem("token");
    if (!userId) return alert("User not found.");
    
    const updatedCart = cart.map((product, i) => {
      if (product._id === productId && i === index) {
        const currentQty = product.quantity || 1;
        // Ensure quantity never goes below 1
        const newQty = Math.max(currentQty - 1, 1);
        return { ...product, quantity: newQty };
      }
      return product;
    });
    
    setCart(updatedCart);
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
  };

  // Add function to checkout an individual item
  const handleCheckoutItem = (productId: string, index: number) => {
    const userId = localStorage.getItem("token");
    if (!userId) {
      alert("Please log in to proceed to checkout.");
      return;
    }
    
    // Create a selectedItems array with just this item
    const itemId = `${productId}-${index}`;
    localStorage.setItem(`selectedItems_${userId}`, JSON.stringify([itemId]));
    
    // Navigate to checkout page
    navigate("/checkout");
  };

  const handleClearCart = () => {
    const userId = localStorage.getItem("token");
    if (userId) {
      localStorage.removeItem(`cart_${userId}`);
      setCart([]);
      updateCartCount(); // Update the cart count
      setSelectedItems([]); // Clear selected items
      alert("Cart cleared!");
    }
  };

  // Add function to calculate actual item price considering discounts
  const getItemPrice = (item: Product): number => {
    if (item.discount && item.discount > 0) {
      if (item.discountedPrice) {
        return parseFloat(item.discountedPrice);
      } else {
        // Calculate discounted price if not already provided
        const basePrice = item.is_for_rent ? parseFloat(item.rent_price) : parseFloat(item.price);
        return basePrice * (1 - (item.discount / 100));
      }
    } else {
      // Return regular price if no discount
      return item.is_for_rent ? parseFloat(item.rent_price) : parseFloat(item.price);
    }
  };

  // Add function to get formatted discounted rent price - similar to the function in deals.tsx
  const getDiscountedRentPrice = (item: Product): string => {
    if (!item.rent_price) return "0.00";
    const rentPrice = parseFloat(item.rent_price);
    const discount = item.discount || 0;
    return (rentPrice * (1 - discount / 100)).toFixed(2);
  };

  // Update calculateTotalPrice to use getItemPrice
  // const calculateTotalPrice = (items: Product[]) => {
  //   if (selectedItems.length === 0) return "0.00";
    
  //   let total = 0;
    
  //   // Process each selected item ID
  //   for (const selectedItemId of selectedItems) {
  //     const [productId, indexStr] = selectedItemId.split('-');
  //     const index = parseInt(indexStr);
      
  //     // Access the item directly from the full cart array using the index
  //     if (index >= 0 && index < cart.length) {
  //       const product = cart[index];
        
  //       if (product && product._id === productId) {
  //         const quantity = product.quantity || 1;
  //         const itemPrice = getItemPrice(product);
          
  //         // Add to total
  //         total += itemPrice * quantity;
  //       }
  //     }
  //   }
    
  //   return total.toFixed(2);
  // };

  // Update calculateCartTotal to properly handle discounted rent prices
  const calculateCartTotal = () => {
    if (cart.length === 0) return "0.00";
    
    let total = 0;
    
    for (const product of cart) {
      const quantity = product.quantity || 1;
      let itemPrice;
      
      if (product.is_for_rent) {
        // For rent items, directly use the discountedRentPrice function to ensure consistency
        const discountedRentPrice = getDiscountedRentPrice(product);
        itemPrice = parseFloat(discountedRentPrice);
      } else {
        // For sale items, continue using the getItemPrice function
        itemPrice = getItemPrice(product);
      }
      
      total += itemPrice * quantity;
    }
    
    return total.toFixed(2);
  };

  const handleProductClick = (product: Product) => {
    navigate(`/cart-product/${product._id}`, { state: { product } });
  };

  const rentItems = cart.filter(item => item.is_for_rent);
  const saleItems = cart.filter(item => item.is_for_sale);

  function onRemove(productId: string, index: number) {
    const userId = localStorage.getItem("token");
    if (!userId) return alert("User not found.");
    if (!window.confirm("Remove this item from cart?")) return;
    const updatedCart = cart.filter((product, i) => !(product._id === productId && i === index));
    setCart(updatedCart);
    localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
    updateCartCount(); // Update the cart count
    
    // Also remove from selectedItems if it was selected
    setSelectedItems(selectedItems.filter(item => item !== `${productId}-${index}`));
  }

  // New functions for item selection
  const handleSelectItem = (productId: string, index: number) => {
    const itemId = `${productId}-${index}`;
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>, itemType?: 'rent' | 'sale') => {
    if (e.target.checked) {
      // Select items based on type
      let itemsToSelect;
      if (itemType === 'rent') {
        itemsToSelect = rentItems.map((item) => {
          const globalIndex = cart.findIndex(cartItem => cartItem._id === item._id);
          return `${item._id}-${globalIndex}`;
        });
      } else if (itemType === 'sale') {
        itemsToSelect = saleItems.map((item) => {
          const globalIndex = cart.findIndex(cartItem => cartItem._id === item._id);
          return `${item._id}-${globalIndex}`;
        });
      } else {
        itemsToSelect = cart.map((item, index) => `${item._id}-${index}`);
      }
      setSelectedItems(itemsToSelect);
    } else {
      // If deselecting, only remove items of the specified type
      if (itemType === 'rent') {
        const rentItemIds = rentItems.map(item => {
          const globalIndex = cart.findIndex(cartItem => cartItem._id === item._id);
          return `${item._id}-${globalIndex}`;
        });
        setSelectedItems(prevSelected => prevSelected.filter(id => !rentItemIds.includes(id)));
      } else if (itemType === 'sale') {
        const saleItemIds = saleItems.map(item => {
          const globalIndex = cart.findIndex(cartItem => cartItem._id === item._id);
          return `${item._id}-${globalIndex}`;
        });
        setSelectedItems(prevSelected => prevSelected.filter(id => !saleItemIds.includes(id)));
      } else {
        setSelectedItems([]);
      }
    }
  };

  // Helper functions to check if all items of a certain type are selected
  const isAllRentSelected = rentItems.length > 0 && 
    rentItems.every(item => {
      const globalIndex = cart.findIndex(cartItem => cartItem._id === item._id);
      return selectedItems.includes(`${item._id}-${globalIndex}`);
    });

  const isAllSaleSelected = saleItems.length > 0 && 
    saleItems.every(item => {
      const globalIndex = cart.findIndex(cartItem => cartItem._id === item._id);
      return selectedItems.includes(`${item._id}-${globalIndex}`);
    });

  const isAllSelected = cart.length > 0 && selectedItems.length === cart.length;
  const selectedItemsCount = selectedItems.length;

  const proceedToCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to proceed to checkout.");
      return;
    }
    
    const userId = localStorage.getItem("token");
    if (userId) {
      // Store selected items in localStorage
      localStorage.setItem(`selectedItems_${userId}`, JSON.stringify(selectedItems));
      
      // Navigate to checkout page
      navigate("/checkout");
    } else {
      alert("Please log in to proceed to checkout.");
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 shadow-lg">
        <MainHeader logoText="Furniture Store" onSearch={() => {}} />
      </div>

      <div className="min-h-screen bg-gray-50 px-4 sm:px-8 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Your Shopping Cart</h1>

          {cart.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              {/* Replace problematic SVG with fixed version */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 mx-auto text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" 
                />
              </svg>
              <p className="text-xl text-gray-600 mt-4">Your cart is empty</p>
              <button 
                onClick={() => navigate('/buy')}
                className="mt-6 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all">
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Select All Checkbox - Enhanced with multi-selection options */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center mb-2 sm:mb-0">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e)}
                    className="h-5 w-5 text-teal-500 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="selectAll" className="ml-2 text-lg font-medium text-gray-700 cursor-pointer">
                    Select All Items
                  </label>
                  <div className="ml-4 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                    {selectedItemsCount} of {cart.length} selected
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {rentItems.length > 0 && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="selectAllRent"
                        checked={isAllRentSelected}
                        onChange={(e) => handleSelectAll(e, 'rent')}
                        className="h-5 w-5 text-blue-500 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="selectAllRent" className="ml-2 text-sm font-medium text-gray-600 cursor-pointer">
                        Rent Items ({rentItems.length})
                      </label>
                    </div>
                  )}
                  
                  {saleItems.length > 0 && (
                    <div className="flex items-center ml-4">
                      <input
                        type="checkbox"
                        id="selectAllSale"
                        checked={isAllSaleSelected}
                        onChange={(e) => handleSelectAll(e, 'sale')}
                        className="h-5 w-5 text-amber-500 rounded focus:ring-amber-500"
                      />
                      <label htmlFor="selectAllSale" className="ml-2 text-sm font-medium text-gray-600 cursor-pointer">
                        Sale Items ({saleItems.length})
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {rentItems.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Rent Items</h2>
                    <span className="ml-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                      {rentItems.length} items
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {rentItems.map((item) => {
                      // Find the actual index in the cart array
                      const cartIndex = cart.findIndex(cartItem => cartItem._id === item._id);
                      const itemKey = `${item._id}-${cartIndex}`;
                      const isSelected = selectedItems.includes(itemKey);
                      
                      // Calculate proper discounted price
                     
      
                      const discountedRentPrice = getDiscountedRentPrice(item);

                      return (
                        <div
                          key={itemKey}
                          className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${isSelected ? 'ring-2 ring-teal-500' : ''}`}
                        >
                          <div className="p-3 bg-gray-50 border-b flex items-center">
                            <input
                              type="checkbox"
                              id={`select-${itemKey}`}
                              checked={isSelected}
                              onChange={() => handleSelectItem(item._id, cartIndex)}
                              className="h-5 w-5 text-teal-500 rounded focus:ring-teal-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label htmlFor={`select-${itemKey}`} className="ml-2 flex-grow cursor-pointer font-medium text-gray-700 truncate">
                              {item.title}
                            </label>
                          </div>

                          <div 
                            className="cursor-pointer"
                            onClick={() => handleProductClick(item)}
                          >
                            <div className="relative w-full h-40 overflow-hidden">
                              {item.images?.length ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                                />
                              )}
                              <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                Rental
                              </div>
                              
                              {/* Add discount badge */}
                              {item.discount !== undefined && item.discount > 0 && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                                  {item.discount}% OFF
                                </div>
                              )}
                            </div>

                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-800 hover:text-teal-500 transition-all line-clamp-1">
                                  {item.title}
                                </h3>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                              
                              <div className="flex items-center justify-between mt-2">
                                {item.discount && item.discount > 0 ? (
                                  <div className="flex flex-col">
                                    <span className="text-green-600 font-bold">
                                      ${discountedRentPrice}/day
                                    </span>
                                    <span className="text-xs text-gray-500 line-through">
                                      ${item.rent_price}/day
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-blue-600 font-bold">${item.rent_price}/day</span>
                                )}
                                <div className="text-sm px-2 py-1 bg-gray-100 rounded">
                                  {item.dimensions}
                                </div>
                              </div>
                              
                              {/* Quantity control - improved styling */}
                              <div className="flex items-center justify-between mt-4">
                                <span className="text-sm font-medium text-gray-600">Quantity:</span>
                                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDecreaseQuantity(item._id, cartIndex);
                                    }}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 focus:outline-none"
                                  >
                                    −
                                  </button>
                                  <span className="px-4 py-1 flex items-center justify-center min-w-[40px] font-medium">
                                    {item.quantity || 1}
                                  </span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleIncreaseQuantity(item._id, cartIndex);
                                    }}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 focus:outline-none"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              
                                <div className="mt-3 text-teal-600 font-bold text-right">
                                {item.discount && item.discount > 0 ? (
                                  <div className="flex flex-col items-end">
                                  <span className="text-xs text-gray-500">
                                    ${discountedRentPrice} × {item.quantity || 1} {(item.quantity || 1) > 1 ? 'days' : 'day'}
                                  </span>
                                  <span>Total: ${(parseFloat(discountedRentPrice) * (item.quantity || 1)).toFixed(2)}</span>
                                  </div>
                                ) : (
                                  <span>Total: ${(parseFloat(item.rent_price || "0") * (item.quantity || 1)).toFixed(2)}</span>
                                )}
                                </div>

                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRemoveFromCart(item._id, cartIndex); }}
                                  className="flex-1 py-2 px-3 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition duration-300 text-sm font-medium"
                                >
                                  Remove
                                </button>
                                
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleCheckoutItem(item._id, cartIndex); 
                                  }}
                                  className="flex-1 py-2 px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300 text-sm font-medium"
                                >
                                  Checkout
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {saleItems.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Buy Items</h2>
                    <span className="ml-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm font-medium">
                      {saleItems.length} items
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {saleItems.map((item, index) => {
                      const itemKey = `${item._id}-${index}`;
                      const isSelected = selectedItems.includes(itemKey);
                      const itemPrice = getItemPrice(item);
                      const totalItemPrice = itemPrice * (item.quantity || 1);

                      return (
                        <div
                          key={itemKey}
                          className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${isSelected ? 'ring-2 ring-teal-500' : ''}`}
                        >
                          <div className="p-3 bg-gray-50 border-b flex items-center">
                            <input
                              type="checkbox"
                              id={`select-${itemKey}`}
                              checked={isSelected}
                              onChange={() => handleSelectItem(item._id, index)}
                              className="h-5 w-5 text-teal-500 rounded focus:ring-teal-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label htmlFor={`select-${itemKey}`} className="ml-2 flex-grow cursor-pointer font-medium text-gray-700 truncate">
                              {item.title}
                            </label>
                          </div>
                          
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleProductClick(item)}
                          >
                            <div className="relative w-full h-40 overflow-hidden">
                              {item.images?.length ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                                />
                              )}
                              <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                Purchase
                              </div>
                              
                              {/* Add discount badge */}
                              {item.discount && item.discount > 0 && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                                  {item.discount}% OFF
                                </div>
                              )}
                            </div>

                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-800 hover:text-teal-500 transition-all line-clamp-1">
                                  {item.title}
                                </h3>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                              
                              <div className="flex items-center justify-between mt-2">
                                {item.discount && item.discount > 0 ? (
                                  <div className="flex flex-col">
                                    <span className="text-green-600 font-bold">
                                      ${(parseFloat(item.price) * (1 - item.discount / 100)).toFixed(2)}
                                    </span>
                                    <span className="text-xs text-gray-500 line-through">
                                      ${item.price}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-blue-600 font-bold">${item.price}</span>
                                )}
                                <div className="text-sm px-2 py-1 bg-gray-100 rounded">
                                  {item.dimensions}
                                </div>
                              </div>
                              
                              {/* Quantity control for purchase items */}
                              <div className="flex items-center justify-between mt-4">
                                <span className="text-sm font-medium text-gray-600">Quantity:</span>
                                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDecreaseQuantity(item._id, index);
                                    }}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 focus:outline-none"
                                  >
                                    −
                                  </button>
                                  <span className="px-4 py-1 flex items-center justify-center min-w-[40px] font-medium">
                                    {item.quantity || 1}
                                  </span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleIncreaseQuantity(item._id, index);
                                    }}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 focus:outline-none"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              
                              <div className="mt-3 text-teal-600 font-bold text-right">
                                Total: ${totalItemPrice.toFixed(2)}
                              </div>

                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={(e) => {
                                  e.stopPropagation();
                                  onRemove(item._id, index);
                                  }}
                                  className="flex-1 py-2 px-3 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition duration-300 text-sm font-medium"
                                >
                                  Remove
                                </button>
                                
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleCheckoutItem(item._id, index); 
                                  }}
                                  className="flex-1 py-2 px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300 text-sm font-medium"
                                >
                                  Checkout
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {cart.length > 0 && (
            <div className="mt-10 bg-white rounded-lg shadow-md p-6 sticky bottom-4 border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <button
                  onClick={handleClearCart}
                  className="w-full md:w-auto mb-4 md:mb-0 py-2 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300 font-medium"
                >
                  Clear Cart
                </button>

                <div className="flex flex-col items-center md:items-end mb-4 md:mb-0">
                  <div className="text-sm text-gray-600 mb-1">Cart Summary</div>
                  <div className="flex flex-wrap gap-x-4 items-center justify-center md:justify-end">
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-1">Items:</span>
                      <span className="font-bold">{cart.length}</span>
                    </div>
                    <div className="flex items-center font-bold text-2xl text-teal-600">
                      <span className="text-gray-600 text-lg mr-1">Total:</span>
                      ${calculateCartTotal()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={proceedToCheckout}
                  className={`w-full md:w-auto py-3 px-8 rounded-lg transition duration-300 font-bold text-white flex items-center justify-center ${
                    selectedItems.length > 0 
                      ? "bg-teal-500 hover:bg-teal-600" 
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                  disabled={selectedItems.length === 0}
                >
                  <span>Checkout</span>
                  {selectedItems.length > 0 && (
                    <span className="ml-2 bg-white text-teal-500 rounded-full h-6 w-6 flex items-center justify-center text-sm">
                      {selectedItems.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <MainFooter />
    </>
  );
};

export default CartPage;