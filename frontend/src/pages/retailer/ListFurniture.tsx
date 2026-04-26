import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import UserSidebar from '../../components/UserSidebar';
import UserHeader from '../../components/UserHeader';
import AdminFooter from "../../components/admin/AdminFooter";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';
import { FiList, FiGrid, FiDollarSign, FiPackage, FiShoppingBag, FiEdit3, FiTrash2, FiFilter, FiEye, FiX, FiSave, FiPlus, FiImage, FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface Furniture {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  is_for_rent: boolean;
  rent_price?: number;
  is_for_sale: boolean;
  condition: string;
  availability_status: string;
  dimensions: string;
  location: string;
  image?: string; // single image field
  images?: string[]; // multiple image field
  created_by: string;
  created_at: string;
  status: string; // Added status field
}

interface Review {
  _id: string;
  userid: string;
  productid: string;
  rating: number;
  review: string;
  created_at: string;
  furniture_title: string;
  furniture_category: string;
  user_name?: string; // Added field for user name
}

function ListFurniture(): React.ReactElement {
  const navigate = useNavigate();
  const [furnitureList, setFurnitureList] = useState<Furniture[]>([]);
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [imageURL, setImageURL] = useState<string>('');
  const [, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'all'>('all');
  const [files, setFiles] = useState<File[]>([]);
  
  const [sortOption, setSortOption] = useState<string>('default');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<Record<string, { first_name: string, last_name: string }>>({}); 


  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  

 const fetchProduct = async () => {
    try {
      setError("Loading furniture...");

      const userid = localStorage.getItem("token");
      if (!userid) {
        setError("User not found");
        return;
      }

      const { sort_by, sort_order } = getSortParams();

      const response = await axios.post(
        `https://furnspace.onrender.com/api/v1/furniture/list/${userid}`,
        {
          data: {
            page,
            limit,
            search: debouncedSearch,
            sort_by,
            sort_order,
            listing_type: activeTab,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.data) {
        setFurnitureList(response.data.data);
        setTotal(response.data.pagination.total);
        setError("");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch furniture");
    }
  };

  const fetchUserDetails = async (userId: string) => {
    // Return from cache if available
    if (userDetails[userId]) {
      return userDetails[userId];
    }
    
    try {
      const headersList = {
        "Accept": "*/*"
      };
      
      const response = await fetch(`https://furnspace.onrender.com/api/v1/auth/user/fetch/${userId}`, { 
        method: "GET",
        headers: headersList
      });
      
      const data = await response.json();
      
      if (data && data.data) {
        const userInfo = {
          first_name: data.data.first_name,
          last_name: data.data.last_name
        };
        
        // Update cache
        setUserDetails(prev => ({
          ...prev,
          [userId]: userInfo
        }));
        
        return userInfo;
      }
    } catch (error) {
      console.error(`Error fetching user details for ${userId}:`, error);
    }
    
    return null;
  };

  const fetchSellerReviews = async (furnitureId: string) => {
    setLoadingReviews(true);
    
    try {
      const headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json"
      };
      
      // Updated API endpoint to include furniture ID as a query parameter
      const response = await fetch(`https://furnspace.onrender.com/api/v1/review/get/${furnitureId}`, { 
        method: "GET",
        headers: headersList
      });
      
      const data = await response.json();
      
      if (data && data.data) {
        console.log("Fetched reviews:", data.data);
        
        // First set reviews with IDs to show content quickly
        setReviews(data.data);
        
        // Then fetch and add user names
        const reviewsWithNames = await Promise.all(
          data.data.map(async (review: Review) => {
            const user = await fetchUserDetails(review.userid);
            return {
              ...review,
              user_name: user ? `${user.first_name} ${user.last_name}` : `User ${review.userid.substring(0, 8)}...`
            };
          })
        );
        
        setReviews(reviewsWithNames);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching seller reviews:", error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [page, debouncedSearch, sortOption, activeTab]);

  // reset to first page on search, sort, or tab change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortOption, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const getDisplayImage = (furniture: Furniture) => {
  if (furniture.images && furniture.images.length > 0) {
    return furniture.images[0];
  }
  return furniture.image || "";
};

  const logFurnitureImageData = (furniture: Furniture | null) => {
    if (!furniture) return;
    
    console.log("Furniture Image Data:");
    console.log("Single Image:", furniture.image);
    console.log("Multiple Images:", furniture.images);
  };

  const handlePreview = (furniture: Furniture) => {
    logFurnitureImageData(furniture);
    setSelectedFurniture(furniture);
    setFile(null);
    setImageURL('');
    setEditingImageIndex(null);
    setEditMode(false); // Ensure it starts in preview mode
    
    // Updated to pass both the seller ID and furniture ID
    if (furniture.created_by) {
      fetchSellerReviews(furniture.created_by);
    }
  };

  const closePreview = () => {
    setSelectedFurniture(null);
    setFile(null);
    setImageURL('');
    setEditingImageIndex(null);
    setEditMode(false);
  };

  const handleSave = async () => {

      if (!selectedFurniture) return;

      const user_id = localStorage.getItem('token');
      if (!user_id) {
        setError("User ID not found");
        return;
      }

      setError("Updating furniture...");

      const url = `https://furnspace.onrender.com/api/v1/furniture/update-furniture`;
      const formData = new FormData();

      // -------------------------
      // CLEAN DATA
      // -------------------------
      const dataToSend: any = {
        furniture_id: selectedFurniture._id,
        title: selectedFurniture.title,
        description: selectedFurniture.description,
        category: selectedFurniture.category,

        price: selectedFurniture.price ? Number(selectedFurniture.price) : null,
        rent_price: selectedFurniture.rent_price ? Number(selectedFurniture.rent_price) : null,

        is_for_sale: Boolean(selectedFurniture.is_for_sale),
        is_for_rent: Boolean(selectedFurniture.is_for_rent),

        condition: selectedFurniture.condition,
        availability_status: selectedFurniture.availability_status,
        dimensions: selectedFurniture.dimensions,
        location: selectedFurniture.location,

        user_id: user_id
      };

      formData.append("data", JSON.stringify(dataToSend));

      // -------------------------
      // IMAGE REPLACEMENT
      // -------------------------
      if (files && files.length > 0) {
        if (editingImageIndex !== null) {
          // ✅ REPLACE MODE (ONLY ONE FILE)
          formData.append("files", files[0]); // ONLY first file
          formData.append(
            "replace_indexes",
            JSON.stringify([editingImageIndex])
          );
        } else {
          // ✅ ADD MODE (MULTIPLE FILES ALLOWED)
          files.forEach((f) => {
            formData.append("files", f);
          });
        }
      }

      try {
        await axios.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        await fetchProduct();

        setEditMode(false);
        setSelectedFurniture(null);
        setFile(null);
        setFiles([]);
        setImageURL('');
        setEditingImageIndex(null);
        setError('');

        alert("Furniture updated successfully!");

      } catch (error: any) {
        console.error(error?.response?.data || error);
        setError(error?.response?.data?.detail || "Update failed");
      }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (editingImageIndex !== null && selectedFiles.length > 1) {
      setError("You can only select one image when replacing.");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    for (const f of selectedFiles) {
      if (!validTypes.includes(f.type)) {
        setError('Invalid file type');
        return;
      }
      if (f.size > maxSize) {
        setError('File too large (max 5MB)');
        return;
      }
    }

    setFiles(selectedFiles);

    // preview first image
    const reader = new FileReader();
    reader.onloadend = () => setImageURL(reader.result as string);
    reader.readAsDataURL(selectedFiles[0]);
  };

  const handleImageClick = (index: number | null = null, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!selectedFurniture) return;

    if (selectedFurniture.images && selectedFurniture.images.length > 0) {
      // multiple images
      setEditingImageIndex(index ?? 0);
    } else {
      // single image
      setEditingImageIndex(0);
    }

    setFile(null);
    setImageURL('');

    fileInputRef.current?.click();
  };

  const handleAddNewImage = (e: React.MouseEvent) => {
    e.stopPropagation();

    // ✅ IMPORTANT: set NULL (not index)
    setEditingImageIndex(null);

    setFile(null);
    setImageURL('');

    fileInputRef.current?.click();
  };
  
  const handleDelete = async (furnitureId: string) => {
      const isConfirmed = window.confirm("Are you sure you want to delete this furniture?");
      if (!isConfirmed) {
          return;
      }

      const headersList = {
          "Content-Type": "application/json"
      };

      const bodyContent = JSON.stringify({});

      try {
          const response = await fetch(`https://furnspace.onrender.com/api/v1/furniture/delete/${furnitureId}`, {
              method: "POST",
              body: bodyContent,
              headers: headersList
          });

          const data = await response.json();

          if (response.ok) {
              // Update the furniture list
              setFurnitureList((prevList) => prevList.filter((item) => item._id !== furnitureId));
              
              // If the deleted item was selected, close the preview
              if (selectedFurniture && selectedFurniture._id === furnitureId) {
                  closePreview();
              }
              
              alert("Furniture deleted successfully!");
              
              // Refresh the furniture list to ensure UI is in sync
              setTimeout(() => {
                  fetchProduct();
              }, 300);
          } else {
              alert(data.message || "Failed to delete furniture.");
          }
      } catch (error) {
          alert("An error occurred. Please try again later.");
      }
    };

  const handleAddDiscount = (furnitureId: string) => {
    navigate(`/retailer/add-discount/${furnitureId}`);
  };

  const handleReviewsButtonClick = () => {
    setIsReviewsModalOpen(true);
  };

  const closeReviewsModal = () => {
    setIsReviewsModalOpen(false);
  };

  // const groupedFurniture = furnitureList.reduce((acc, furniture) => {
  //   if (!acc[furniture.title]) {
  //     acc[furniture.title] = { forSale: [], forRent: [] };
  //   }
  //   if (furniture.is_for_sale) {
  //     acc[furniture.title].forSale.push(furniture);
  //   }
  //   if (furniture.is_for_rent) {
  //     acc[furniture.title].forRent.push(furniture);
  //   }
  //   return acc;
  // }, {} as Record<string, { forSale: Furniture[], forRent: Furniture[] }>);

 const getSortParams = () => {
  switch (sortOption) {
    case "price_asc":
      return { sort_by: "price", sort_order: "asc" };

    case "price_desc":
      return { sort_by: "price", sort_order: "desc" };

    case "rent_asc":
      return { sort_by: "rent_price", sort_order: "asc" };

    case "rent_desc":
      return { sort_by: "rent_price", sort_order: "desc" };

    case "title_asc":
      return { sort_by: "title", sort_order: "asc" };

    case "title_desc":
      return { sort_by: "title", sort_order: "desc" };

    case "category_asc":
      return { sort_by: "category", sort_order: "asc" };

    case "category_desc":
      return { sort_by: "category", sort_order: "desc" };

    case "date_asc":
      return { sort_by: "created_at", sort_order: "asc" };

    default:
      return { sort_by: "created_at", sort_order: "desc" };
  }
};

  // const renderFurnitureCard = (furniture: Furniture, type: 'sale' | 'rent') => {
  //   return (
  //     <div
  //       key={furniture._id}
  //       className={`relative overflow-hidden border-0 bg-white p-6 mb-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
  //     >
  //       <div className={`absolute top-0 right-0 p-2 rounded-bl-lg text-white text-xs font-bold ${
  //         type === 'sale' 
  //           ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
  //           : 'bg-gradient-to-r from-orange-600 to-orange-500'
  //       }`}>
  //         {type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
  //       </div>
        
  //       <div className={`absolute inset-x-0 top-0 h-1 ${
  //         type === 'sale' 
  //           ? 'bg-gradient-to-r from-blue-600 to-teal-500' 
  //           : 'bg-gradient-to-r from-orange-600 to-amber-500'
  //       }`}></div>
        
  //       <h3 className="text-2xl font-bold text-slate-800 mb-3 mt-2">{furniture.title}</h3>
        
  //       <div className="grid grid-cols-2 gap-3 mb-2">
  //         <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
  //           <span className="font-semibold text-slate-500 block text-xs">CATEGORY</span>
  //           {furniture.category}
  //         </p>
  //         <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
  //           <span className="font-semibold text-slate-500 block text-xs">CONDITION</span>
  //           {furniture.condition}
  //         </p>
  //         {type === 'sale' ? (
  //           <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
  //             <span className="font-semibold text-slate-500 block text-xs">PRICE</span>
  //             <span className="text-blue-600 font-bold">${furniture.price}</span>
  //           </p>
  //         ) : (
  //           <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
  //             <span className="font-semibold text-slate-500 block text-xs">RENT</span>
  //             <span className="text-orange-600 font-bold">${furniture.rent_price}/day</span>
  //           </p>
  //         )}
  //         <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
  //           <span className="font-semibold text-slate-500 block text-xs">LOCATION</span>
  //           {furniture.location}
  //         </p>
  //       </div>
        
  //       <div className="h-48 mb-4 overflow-hidden rounded-lg group relative">
  //         {furniture.images && furniture.images.length > 0 ? (
  //           <img
  //             src={getDisplayImage(furniture)}
  //             alt={furniture.title}
  //             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
  //           />
  //         ) : (
  //           furniture.image && (
  //             <img
  //               src={furniture.image}
  //               alt={furniture.title}
  //               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
  //             />
  //           )
  //         )}
  //         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
  //       </div>
        
  //       <div className="flex justify-between mt-4">
  //         <button
  //           className={`px-4 py-2 rounded-lg text-white font-medium shadow-md flex items-center justify-center transition-all duration-300 ${
  //             type === 'sale' 
  //               ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600' 
  //               : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600'
  //           }`}
  //           onClick={() => handlePreview(furniture)}
  //         >
  //           <FiEye className="h-5 w-5 mr-2" />
  //           Manage
  //         </button>
  //         <div className="flex space-x-2">
  //           <button
  //             className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
  //             onClick={() => handleDelete(furniture._id)}
  //           >
  //             <FiTrash2 className="h-5 w-5 mr-2" />
  //             Delete
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  const renderUnifiedFurnitureCard = (furniture: Furniture) => {
    return (
      <div
        key={furniture._id}
        className="relative overflow-hidden border-0 bg-white p-6 mb-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-500"></div>
        
        <div className="absolute top-0 right-0 flex">
          {furniture.is_for_sale && (
            <div className="p-2 rounded-bl-lg text-white text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-500 mr-1">
              FOR SALE
            </div>
          )}
          {furniture.is_for_rent && (
            <div className="p-2 rounded-bl-lg text-white text-xs font-bold bg-gradient-to-r from-orange-600 to-orange-500">
              FOR RENT
            </div>
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-slate-800 mb-3 mt-2">{furniture.title}</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-2">
          <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
            <span className="font-semibold text-slate-500 block text-xs">CATEGORY</span>
            {furniture.category}
          </p>
          <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
            <span className="font-semibold text-slate-500 block text-xs">CONDITION</span>
            {furniture.condition}
          </p>
          
          {furniture.is_for_sale && (
            <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
              <span className="font-semibold text-slate-500 block text-xs">SALE PRICE</span>
              <span className="text-blue-600 font-bold">${furniture.price}</span>
            </p>
          )}
          
          {furniture.is_for_rent && (
            <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
              <span className="font-semibold text-slate-500 block text-xs">RENT PRICE</span>
              <span className="text-orange-600 font-bold">${furniture.rent_price}/day</span>
            </p>
          )}
          
          <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
            <span className="font-semibold text-slate-500 block text-xs">LOCATION</span>
            {furniture.location}
          </p>
        </div>
        
        <div className="h-48 mb-4 overflow-hidden rounded-lg group relative">
          {furniture.images && furniture.images.length > 0 ? (
            <img
              src={getDisplayImage(furniture)}
              alt={furniture.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            furniture.image && (
              <img
                src={furniture.image}
                alt={furniture.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
        </div>
        
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 rounded-lg text-white font-medium shadow-md flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600"
            onClick={() => handlePreview(furniture)}
          >
            <FiEye className="h-5 w-5 mr-2" />
            Manage
          </button>
          <div className="flex space-x-2">
            <button
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
              onClick={() => handleAddDiscount(furniture._id)}
            >
              <FiDollarSign className="h-5 w-5 mr-2" />
              Discount
            </button>
            <button
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
              onClick={() => handleDelete(furniture._id)}
            >
              <FiTrash2 className="h-5 w-5 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true, // Enable navigation arrows
  };

  const renderImageSection = () => {
    return (
      <div className="md:w-1/2 pr-4 mb-4 md:mb-0">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-blue-600">Click on an image to change it</p>
          <button
            type="button"
            onClick={handleAddNewImage}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-sm rounded-lg flex items-center"
          >
            <FiPlus className="h-4 w-4 mr-1" />
            Add Image
          </button>
        </div>
        
        {selectedFurniture?.images && selectedFurniture.images.length > 0 ? (
          <Slider {...sliderSettings}>
            {selectedFurniture.images.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={selectedFurniture.title}
                  className="w-full h-64 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={(e) => handleImageClick(index, e)}
                  title="Click to change this image"
                />
                <div className="absolute bottom-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                  Image {index + 1}
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          selectedFurniture?.image ? (
            <div className="relative">
              <img
                src={selectedFurniture.image}
                alt={selectedFurniture.title}
                className="w-full h-64 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => handleImageClick(null, e)}
                title="Click to change this image"
              />
              <div className="absolute bottom-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                Single Image
              </div>
            </div>
          ) : (
            <div 
              className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={(e) => handleImageClick(null, e)}
            >
              <div className="text-center text-gray-500">
                <FiImage className="mx-auto h-12 w-12" />
                <p className="mt-2">Click to add an image</p>
              </div>
            </div>
          )
        )}
        
        <input
          type="file"
          multiple={editingImageIndex === null} // ✅ KEY FIX
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {imageURL && (
          <div className="mt-4 border-2 border-teal-500 p-1 rounded">
            <img
              src={imageURL}
              alt="Uploaded Image"
              className="w-full h-64 object-cover rounded"
            />
            <div className="text-center text-sm text-teal-600 mt-2">New image will be saved when you click Save</div>
          </div>
        )}
      </div>
    );
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className="text-yellow-500">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  };

  function handleTabChange(tab: 'buy' | 'rent' | 'all') {
    setActiveTab(tab);
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="fixed top-0 left-0 h-full">
        <UserSidebar />
      </div>

      <div className="flex-1 ml-72 flex flex-col">
        <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700">
          <UserHeader />
        </div>

        <main className="flex-1 p-6">
          <section className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-4">
              <div className="flex items-center w-full lg:w-auto">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                  <FiList className="mr-2 text-indigo-600 dark:text-indigo-400" />
                  Furniture Management
                </h2>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative w-full sm:w-72">
                  <FiFilter className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search furniture..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="date_desc">Newest</option>
                  <option value="date_asc">Oldest</option>
                  <option value="title_asc">Title A-Z</option>
                  <option value="title_desc">Title Z-A</option>
                  <option value="category_asc">Category A-Z</option>
                  <option value="category_desc">Category Z-A</option>
                  <option value="price_asc">Price Low → High</option>
                  <option value="price_desc">Price High → Low</option>
                  <option value="rent_asc">Rent Low → High</option>
                  <option value="rent_desc">Rent High → Low</option>
                </select>
              </div>
            </div>
            
            {error && <p className="text-rose-500 text-center mb-4">{error}</p>}
            
            <div className="mb-8">
              <div className="inline-flex p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
                <button
                  className={`px-6 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                  onClick={() => handleTabChange('all')}
                >
                  <div className="flex items-center">
                    <FiGrid className="mr-1.5" />
                    All Items
                  </div>
                </button>
                <button
                  className={`px-6 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === 'buy'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => handleTabChange('buy')}
                >
                  <div className="flex items-center">
                    <FiShoppingBag className="mr-1.5" />
                    For Sale
                  </div>
                </button>
                <button
                  className={`px-6 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === 'rent'
                      ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                  onClick={() => handleTabChange('rent')}
                >
                  <div className="flex items-center">
                    <FiPackage className="mr-1.5" />
                    For Rent
                  </div>
                </button>
              </div>
            </div>

            {furnitureList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {furnitureList.map((furniture) => (
                    renderUnifiedFurnitureCard(furniture)
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No furniture found.</p>
            )}

          </section>
          <div className="flex justify-center items-center gap-4 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>

            </div>
          </main>
        <AdminFooter />
      </div>
      
      {selectedFurniture && (
       <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
       <div className="bg-white p-8 rounded-lg shadow-2xl max-w-4xl w-full h-auto animate-fade-in-up">
         {editMode ? (
           <>
             <h2 className="text-3xl font-bold mb-6 text-center text-slate-800 border-b pb-4">Edit Furniture</h2>
             <form className="overflow-y-auto max-h-96">
               <div className="flex flex-col md:flex-row">
                 {renderImageSection()}
                 <div className="md:w-1/2 pl-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {Object.keys(selectedFurniture).map((key) => {
                       if (key === '_id' || key === 'created_by' || key === 'created_at' || key === 'image' || key === 'images') return null;
                       return (
                         <div key={key} className={key === 'description' ? "col-span-2" : ""}>
                           <label className="block text-slate-700 font-medium mb-2">
                             {key[0].toUpperCase() + key.slice(1).replace(/_/g, ' ')}:
                           </label>
                           {key === 'description' ? (
                             <textarea
                               value={(selectedFurniture as any)[key] || ''}
                               onChange={(e) =>
                                 setSelectedFurniture({
                                   ...selectedFurniture,
                                   [key]: e.target.value,
                                 })
                               }
                               className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 min-h-[100px]"
                             />
                           ) : (
                             <input
                               type={key === 'price' || key === 'rent_price' ? 'number' : 'text'}
                               value={(selectedFurniture as any)[key] || ''}
                               placeholder={`Enter ${key[0].toUpperCase() + key.slice(1).replace(/_/g, ' ')}`}
                               onChange={(e) =>
                                 setSelectedFurniture({
                                   ...selectedFurniture,
                                   [key]: key === 'price' || key === 'rent_price' ? parseFloat(e.target.value) : e.target.value,
                                 })
                               }
                               className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                             />
                           )}
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </div>
             </form>
             <div className="flex justify-end mt-6 space-x-4 border-t pt-4">
               <button
                 className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 flex items-center"
                 onClick={closePreview}
               >
                 <FiX className="h-5 w-5 mr-2" />
                 Cancel
               </button>
               <button
                 className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 flex items-center"
                 onClick={handleSave}
               >
                 <FiSave className="h-5 w-5 mr-2" />
                 Save
               </button>
             </div>
           </>
         ) : (
           <>
             <div className="flex justify-between items-center border-b pb-4 mb-6">
               <h2 className="text-3xl font-bold text-slate-800">{selectedFurniture.title}</h2>
               <button
                 onClick={closePreview}
                 className="text-slate-500 hover:text-slate-700 transition-colors duration-300"
               >
                 <FiX className="h-6 w-6" />
               </button>
             </div>
             <div className="flex flex-col md:flex-row">
               <div className="md:w-1/2 pr-4 mb-4 md:mb-0">
                 {selectedFurniture.images && selectedFurniture.images.length > 0 ? (
                   <div className="bg-slate-100 p-2 rounded-lg">
                     <Slider {...sliderSettings}>
                       {selectedFurniture.images.map((img, index) => (
                         <div key={index}>
                           <img
                             src={img}
                             alt={selectedFurniture.title}
                             className="w-full h-80 object-cover rounded"
                           />
                         </div>
                       ))}
                     </Slider>
                   </div>
                 ) : (
                   selectedFurniture.image && (
                     <div className="bg-slate-100 p-2 rounded-lg">
                       <img
                         src={selectedFurniture.image}
                         alt={selectedFurniture.title}
                         className="w-full h-80 object-cover rounded"
                       />
                     </div>
                   )
                 )}
               </div>
               <div className="md:w-1/2 pl-4 space-y-4">
                 <div className="bg-slate-50 p-4 rounded-lg">
                   <div className="flex justify-between">
                     <div>
                       <h3 className="text-lg font-semibold text-slate-900">Details</h3>
                     </div>
                     <div>
                       {selectedFurniture.is_for_sale && (
                         <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs font-medium mr-2">
                           FOR SALE
                         </span>
                       )}
                       {selectedFurniture.is_for_rent && (
                         <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                           FOR RENT
                         </span>
                       )}
                     </div>
                   </div>
                   
                   <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <p className="text-slate-600 text-sm">
                         <span className="font-semibold block text-xs text-slate-500">CATEGORY</span>
                         {selectedFurniture.category}
                       </p>
                     </div>
                     <div>
                       <p className="text-slate-600 text-sm">
                         <span className="font-semibold block text-xs text-slate-500">CONDITION</span>
                         {selectedFurniture.condition}
                       </p>
                     </div>
                     <div>
                       <p className="text-slate-600 text-sm">
                         <span className="font-semibold block text-xs text-slate-500">PRICE</span>
                         ${selectedFurniture.price}
                       </p>
                     </div>
                     {selectedFurniture.is_for_rent && (
                       <div>
                         <p className="text-slate-600 text-sm">
                           <span className="font-semibold block text-xs text-slate-500">RENT PRICE</span>
                           ${selectedFurniture.rent_price}/day
                         </p>
                       </div>
                     )}
                     <div>
                       <p className="text-slate-600 text-sm">
                         <span className="font-semibold block text-xs text-slate-500">DIMENSIONS</span>
                         {selectedFurniture.dimensions}
                       </p>
                     </div>
                     <div>
                       <p className="text-slate-600 text-sm">
                         <span className="font-semibold block text-xs text-slate-500">LOCATION</span>
                         {selectedFurniture.location}
                       </p>
                     </div>
                     <div>
                       <p className="text-slate-600 text-sm">
                         <span className="font-semibold block text-xs text-slate-500">AVAILABILITY</span>
                         <span className={`${
                           selectedFurniture.availability_status === 'available' 
                             ? 'text-green-600' 
                             : selectedFurniture.availability_status === 'sold' 
                             ? 'text-red-600' 
                             : 'text-amber-600'
                         } font-medium`}>
                           {selectedFurniture.availability_status.toUpperCase()}
                         </span>
                       </p>
                     </div>
                   </div>
                 </div>
                 
                 <div className="bg-slate-50 p-4 rounded-lg">
                   <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
                   <p className="text-slate-600 text-sm">
                     {selectedFurniture.description}
                   </p>
                 </div>
               </div>
             </div>
             
             <div className="flex justify-end mt-6 space-x-4 border-t pt-4">
               <button
                 className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 flex items-center"
                 onClick={closePreview}
               >
                 <FiX className="h-5 w-5 mr-2" />
                 Close
               </button>
               <button
                 className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 flex items-center"
                 onClick={handleReviewsButtonClick}
               >
                 <FiMessageSquare className="h-5 w-5 mr-2" />
                 Reviews {reviews.length > 0 && `(${reviews.length})`}
               </button>
               <button
                 className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 flex items-center"
                 onClick={() => handleAddDiscount(selectedFurniture._id)}
               >
                 <FiDollarSign className="h-5 w-5 mr-2" />
                 Add Discount
               </button>
               <button
                 className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 flex items-center"
                 onClick={() => setEditMode(true)}
               >
                 <FiEdit3 className="h-5 w-5 mr-2" />
                 Edit
               </button>
             </div>
           </>
         )}
       </div>
     </div>

      )}

      {isReviewsModalOpen && selectedFurniture && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-[60] p-4 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-3xl w-full h-auto animate-fade-in-up">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Customer Reviews</h2>
              <button
                onClick={closeReviewsModal}
                className="text-slate-500 hover:text-slate-700 transition-colors duration-300"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4 bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg text-slate-800">
                {selectedFurniture.title}
              </h3>
              <p className="text-slate-600 text-sm mt-1">
                See what customers are saying about your product.
              </p>
            </div>
            
            {loadingReviews ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-slate-50 p-5 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-slate-800 text-lg">
                            {review.user_name || `User ${review.userid.substring(0, 8)}...`}
                          </p>
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {review.furniture_category}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-xl">
                          {renderStarRating(review.rating)}
                          <span className="ml-2 text-sm text-slate-500">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 p-3 bg-white rounded-md border border-slate-200">
                      <p className="font-medium text-sm text-slate-500">Review for: {review.furniture_title}</p>
                      <p className="mt-2 text-slate-700">{review.review}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <FiMessageSquare className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-medium text-slate-800">No Reviews Yet</h3>
                <p className="mt-2 text-slate-600">
                  Your products haven't received any customer reviews yet.
                </p>
              </div>
            )}
            
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
                onClick={closeReviewsModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListFurniture;