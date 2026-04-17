import React, { useState, useEffect } from "react";
import MainFooter from "../../../../components/user/MainFooter";
import { FiTrash2 } from "react-icons/fi";
import MainHeader from "../../../../components/user/MainHeader";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";

// types.ts
export interface Product {
  id: string;
  _id: string;
  name: string;
  description: string;
  image?: string;
  images: string[];
  title: string;
  price: string;
  category: string;
  is_for_rent: boolean;
  rent_price: string;
  is_for_sale: boolean;
  condition: string;
  availability: string;
  availability_status: string;
  createdAt: string;
  sizes?: string[];
  dimensions: string;
  location: string;
  created_by: string;
  created_at: string;
  discount?: number; // Added discount field
  discountedPrice?: string; // Added discounted price field
}

const Wishlist: React.FC = () => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [quantityMap, setQuantityMap] = useState<{ [key: string]: number }>({});
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlistProducts = () => {
      const userId = localStorage.getItem("token");
      if (userId) {
        const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${userId}`) || "[]");
        setWishlistProducts(storedWishlist);

        const initialQuantities: { [key: string]: number } = {};
        storedWishlist.forEach((product: Product) => {
          initialQuantities[`${product.id}-${product._id}`] = 1;
        });
        setQuantityMap(initialQuantities);
      }
    };
    fetchWishlistProducts();
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(wishlistProducts.length / pageSize));
  }, [wishlistProducts, pageSize]);

  const handlePageChange = (newPage: number) => setPage(newPage);

  const handleRemoveFromWishlist = (productId: string, index: number) => {
    const userId = localStorage.getItem("token");
    if (!userId) return alert("User not found.");
    if (!window.confirm("Remove this item from wishlist?")) return;
    const updatedWishlist = wishlistProducts.filter((product, i) => !(product.id === productId && i === index));
    setWishlistProducts(updatedWishlist);
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(updatedWishlist));
  };

  const handleProductClick = (product: Product) => {
    navigate(`/view-product/${product.id}`, { state: { product } });
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setQuantityMap((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  return (
    <>
      <MainHeader logoText="Furniture Store" onSearch={(query) => console.log(query)} />
      <div className="min-h-screen bg-gray-100 px-6 pt-24 pb-16">
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
            <p className="mt-2 text-sm text-gray-500">Start exploring and save items you love!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {wishlistProducts.slice((page - 1) * pageSize, page * pageSize).map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className="bg-white rounded-xl shadow-md overflow-hidden w-full h-full flex flex-col cursor-pointer card-hover"
                onClick={() => handleProductClick(product)}
                style={{ animation: `fadeSlideUp 0.5s ease forwards ${index * 0.1}s`, opacity: 0 }}
              >
                <div className="relative">
                  <div className="relative overflow-hidden group">
                    <div className="aspect-w-1 aspect-h-1 w-full bg-gray-200">
                      <img
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                        className="w-full h-60 object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=No+Image+Available";
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs opacity-80 mt-1">{product.category}</p>
                    </div>

                    <div className="absolute top-3 right-3 bg-white/90 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                      {product.availability_status || "In Stock"}
                    </div>

                    {product.discount && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(product.id, index);
                    }}
                    className="absolute bottom-3 right-3 text-xl transition-all p-2 bg-white rounded-full shadow-lg text-red-500 hover:bg-red-50 hover:scale-110"
                    aria-label="Remove from wishlist"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>

                    <div className="mt-3 space-y-1">
                      {product.condition && (
                        <div className="flex items-center text-xs text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span>{product.condition}</span>
                        </div>
                      )}
                      {product.location && (
                        <div className="flex items-center text-xs text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{product.location}</span>
                        </div>
                      )}
                      {product.dimensions && (
                        <div className="flex items-center text-xs text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                          </svg>
                          <span>{product.dimensions}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      {product.discount ? (
                        <div className="flex flex-col">
                          <div className="text-xl font-bold text-green-600">
                            ${product.discountedPrice || (parseFloat(product.price) * (1 - (product.discount || 0) / 100)).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 line-through">${product.price}</div>
                        </div>
                      ) : (
                        <div className="text-xl font-bold text-gray-900">${product.price}</div>
                      )}
                      <input
                        type="number"
                        value={quantityMap[`${product.id}-${product._id}`] || 1}
                        min={1}
                        onChange={(e) => handleQuantityChange(`${product.id}-${product._id}`, parseInt(e.target.value))}
                        className="ml-auto w-16 p-1 border rounded-md text-center"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const productToAdd = {
                          ...product,
                          discountedPrice:
                            product.discountedPrice ||
                            (product.discount && product.price
                              ? (parseFloat(product.price) * (1 - product.discount / 100)).toFixed(2)
                              : product.price),
                        };
                        const productWithDiscount = {
                          ...productToAdd,
                          discount: productToAdd.discount || 0,
                        };

                        addToCart(productWithDiscount, quantityMap[`${product.id}-${product._id}`] || 1);
                        alert("Added to cart!");
                      }}
                      className="w-full py-2.5 px-4 bg-yellow-400 text-gray-900 rounded-lg font-medium hover:bg-yellow-500 transition-all transform hover:scale-105 focus:ring-2 focus:ring-yellow-300 flex items-center justify-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 0 0 0 2h1.22l.305 1.222a.997.997 0 0 0 .042.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 0 0 0-2H6.414l1-1H14a1 1 0 0 0 .894-.553l3-6A1 1 0 0 0 17 3H6.28l-.31-1.243A1 1 0 0 0 5 1H3z" />
                      </svg>
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .card-hover {
            transition: all 0.3s ease;
          }
          
          .card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          
          .aspect-w-1 {
            position: relative;
            padding-bottom: 100%;
          }
          
          .aspect-w-1 > img {
            position: absolute;
            height: 100%;
            width: 100%;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            object-fit: cover;
          }
          
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
          
          .line-clamp-2 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
        `}</style>

        <PaginationControls page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
      <MainFooter />
    </>
  );
};


const PaginationControls: React.FC<{
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}> = ({ page, totalPages, onPageChange }) => (
  <div className="flex justify-center items-center mt-6 space-x-4">
    <button
      onClick={() => onPageChange(page - 1)}
      disabled={page === 1}
      className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
    >
      Previous
    </button>
    <span className="px-4 py-2 bg-gray-200 rounded-lg">
      Page {page} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(page + 1)}
      disabled={page >= totalPages}
      className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
    >
      Next
    </button>
  </div>
);

export default Wishlist;
