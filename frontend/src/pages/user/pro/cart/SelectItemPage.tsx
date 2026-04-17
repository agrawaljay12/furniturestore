import React, { useState } from "react";
import MainHeader from "../../../../components/user/MainHeader";
import MainFooter from "../../../../components/user/MainFooter";
import { useCart } from "../cart/CartContext";
import { useNavigate } from "react-router-dom";

const SelectItemPage: React.FC = () => {
  const { cart } = useCart();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleDropdownToggle = (productId: string, index: number) => {
    const uniqueId = `${productId}-${index}`;
    setSelectedProductId(selectedProductId === uniqueId ? null : uniqueId);
  };

  const handleCheckboxChange = (productId: string, index: number) => {
    const uniqueId = `${productId}-${index}`;
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(uniqueId)
        ? prevSelectedItems.filter((id) => id !== uniqueId)
        : [...prevSelectedItems, uniqueId]
    );
  };

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'rent' | 'buy') => {
    if (e.target.checked) {
      const allItems = cart
        .filter((item) => (type === 'rent' ? item.is_for_rent : item.is_for_sale))
        .map((item, index) => `${item._id}-${index}`);
      setSelectedItems((prevSelectedItems) => [...prevSelectedItems, ...allItems]);
    } else {
      const filteredItems = cart
        .filter((item) => (type === 'rent' ? item.is_for_rent : item.is_for_sale))
        .map((item, index) => `${item._id}-${index}`);
      setSelectedItems((prevSelectedItems) => prevSelectedItems.filter((id) => !filteredItems.includes(id)));
    }
  };

  const calculateTotalPrice = () => {
    return selectedItems
      .reduce((acc, uniqueId) => {
        const [productId] = uniqueId.split("-");
        const item = cart.find((item) => item._id === productId);
        return acc + (item ? parseFloat(item.is_for_rent ? item.rent_price : item.price) * (item.quantity ?? 1) : 0);
      }, 0)
      .toFixed(2);
  };

  const handleProceedToCheckout = () => {
    const userId = localStorage.getItem("token");
    if (userId) {
      // Store selected items with userId in local storage
      localStorage.setItem(`selectedItems_${userId}`, JSON.stringify(selectedItems));
      navigate("/checkout", { state: { selectedItems } });
    }
  };

  const isAllRentSelected = cart.filter(item => item.is_for_rent).every(item => selectedItems.includes(`${item._id}-${cart.indexOf(item)}`));
  const isAllBuySelected = cart.filter(item => item.is_for_sale).every(item => selectedItems.includes(`${item._id}-${cart.indexOf(item)}`));

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 shadow-lg">
        <MainHeader logoText="Furniture Store" onSearch={() => {}} />
      </div>

      <div className="min-h-screen bg-gray-50 px-8 pt-24 pb-16">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800">Select Your Item to Process</h1>

        {cart.length === 0 ? (
          <p className="text-center text-xl text-gray-600">Your cart is empty. Add some items!</p>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Items for Rent</h2>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={isAllRentSelected}
                  onChange={(e) => handleSelectAllChange(e, 'rent')}
                  className="mr-2"
                />
                <label className="text-lg font-bold text-gray-800">Select All Rent Items</label>
              </div>
              <div className="space-y-4">
                {cart.filter(item => item.is_for_rent).map((item, index) => (
                  <div key={`${item._id}-${index}`} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(`${item._id}-${index}`)}
                          onChange={() => handleCheckboxChange(item._id, index)}
                          className="mr-2"
                        />
                        <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                      </div>
                      <button
                        onClick={() => handleDropdownToggle(item._id, index)}
                        className="py-1 px-4 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition duration-300"
                      >
                        {selectedProductId === `${item._id}-${index}` ? "Hide Details" : "Show Details"}
                      </button>
                    </div>
                    {selectedProductId === `${item._id}-${index}` && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Description:</span> {item.description}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Category:</span> {item.category}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Condition:</span> {item.condition}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Availability Status:</span> {item.availability_status}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Dimensions:</span> {item.dimensions}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Location:</span> {item.location}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Price:</span> ${item.rent_price}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Quantity:</span> {item.quantity}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Total Price:</span> ${(parseFloat(item.rent_price) * (item.quantity ?? 1)).toFixed(2)}</p>
                        <div className="relative w-24 h-24 mt-2">
                          {item.images?.length ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Items for Sale</h2>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={isAllBuySelected}
                  onChange={(e) => handleSelectAllChange(e, 'buy')}
                  className="mr-2"
                />
                <label className="text-lg font-bold text-gray-800">Select All Buy Items</label>
              </div>
              <div className="space-y-4">
                {cart.filter(item => item.is_for_sale).map((item, index) => (
                  <div key={`${item._id}-${index}`} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(`${item._id}-${index}`)}
                          onChange={() => handleCheckboxChange(item._id, index)}
                          className="mr-2"
                        />
                        <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                      </div>
                      <button
                        onClick={() => handleDropdownToggle(item._id, index)}
                        className="py-1 px-4 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition duration-300"
                      >
                        {selectedProductId === `${item._id}-${index}` ? "Hide Details" : "Show Details"}
                      </button>
                    </div>
                    {selectedProductId === `${item._id}-${index}` && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Description:</span> {item.description}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Category:</span> {item.category}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Condition:</span> {item.condition}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Availability Status:</span> {item.availability_status}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Dimensions:</span> {item.dimensions}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Location:</span> {item.location}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Price:</span> ${item.price}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Quantity:</span> {item.quantity}</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Total Price:</span> ${(parseFloat(item.price) * (item.quantity ?? 1)).toFixed(2)}</p>
                        <div className="relative w-24 h-24 mt-2">
                          {item.images?.length ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedItems.length > 0 && (
          <div className="mt-8 flex justify-between items-center">
            <div className="font-bold text-2xl text-teal-600">
              Total: ${calculateTotalPrice()}
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="py-2 px-6 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition duration-300"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      <MainFooter />
    </>
  );
};

export default SelectItemPage;