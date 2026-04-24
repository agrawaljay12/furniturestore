import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';
import { FiList, FiGrid,  FiPackage, FiShoppingBag,  FiFilter } from 'react-icons/fi';

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
  status?: string; // Add status field to interface
}

function ListFurniture(): React.ReactElement {
  const [furnitureList, setFurnitureList] = useState<Furniture[]>([]);
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const page = 1; // Initialize the page variable
  // const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [imageURL, setImageURL] = useState<string>('');
  // const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'sale' | 'rent' | 'all'>('sale');
  // const [isImagePreviewOpen, setIsImagePreviewOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [groupedFurnitureState, setGroupedFurnitureState] = useState<Record<string, { forSale: Furniture[], forRent: Furniture[] }>>({});
  const [selectedTitleFilter, setSelectedTitleFilter] = useState<string>('all');

  // const [replaceIndexes, setReplaceIndexes] = useState<number[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);

  // State for handling messages
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');   // ✅ NEW
  const [loadingMsg, setLoadingMsg] = useState<string>(''); // ✅ OPTIONAL

  const fetchProduct = async () => {
    setIsLoading(true);
    const headersList = { "Content-Type": "application/json" };
    const bodyContent = JSON.stringify({
      page,
      page_size: 100, // Fetching all furniture at once for pagination
      sort_by: "created_at",
      sort_order: "desc",
      search: "",
    });

    try {
      const response = await fetch(
        "https://furnspace.onrender.com/api/v1/furniture/list_all",
        {
          method: "POST",
          body: bodyContent,
          headers: headersList,
        }
      );

      const data = await response.json();

      if (data && data.data) {
        const filteredFurniture = data.data.filter(
          (furniture: Furniture) => 
            // Only include furniture for sale or rent AND with approved status
            (furniture.is_for_sale || furniture.is_for_rent) && 
            furniture.status === "approved"
        );
        setFurnitureList(filteredFurniture); // Only approved furniture for sale or rent
        return filteredFurniture; // Return data for optional use
      }
    } catch (error) {
      console.error("Error fetching furniture:", error);
      setError("Failed to fetch furniture data. Please check your connection or API.");
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    const groupedItems = furnitureList.reduce((acc, furniture) => {
      if (!acc[furniture.title]) {
        acc[furniture.title] = { forSale: [], forRent: [] };
      }
      if (furniture.is_for_sale) {
        acc[furniture.title].forSale.push(furniture);
      }
      if (furniture.is_for_rent) {
        acc[furniture.title].forRent.push(furniture);
      }
      return acc;
    }, {} as Record<string, { forSale: Furniture[], forRent: Furniture[] }>);
    
    setGroupedFurnitureState(groupedItems);
  }, [furnitureList]);

  const handlePreview = (furniture: Furniture) => {
    setSelectedFurniture(furniture);
    setEditMode(false); // Ensure it starts in preview mode
  };

  const closePreview = () => {
    setSelectedFurniture(null);
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
      formData.append("furniture_id", selectedFurniture._id);

      console.log("Data being sent:", dataToSend);
      console.log(selectedFurniture._id);

      // -------------------------
      // IMAGE REPLACEMENT
      // -------------------------
      if (files.length > 0) {

        if (editingImageIndex !== null) {
          // ✅ REPLACE MODE

            if (files.length !== 1) {
              alert("Only one file allowed when replacing an image");
              return;
            }

            // Send as ARRAY format (important)
            formData.append("files", files[0]);

            // Backend expects LIST → send properly
            formData.append("replace_indexes", JSON.stringify([editingImageIndex]));

          } else {
            // ✅ ADD MODE (multiple allowed)

            files.forEach((file) => {
              formData.append("files", file);
            });
          }
      }

      try {
        const res= await axios.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("Update response:", res.data);

        await fetchProduct();

        setEditMode(false);
        setSelectedFurniture(null);
        setFiles([]);
        setImageURL('');
        setEditingImageIndex(null);
        setSuccess("Furniture updated successfully!");
        setLoadingMsg('');
        alert("Furniture updated successfully!");

      } catch (error: any) {
        console.error(error?.response?.data || error);
        setError(error?.response?.data?.detail || "Update failed");
        setLoadingMsg('');
        setSuccess('');
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
    setImageURL('');

    fileInputRef.current?.click();
  };

  const handleAddNewImage = (e: React.MouseEvent) => {
    e.stopPropagation();

    // ✅ ADD MODE
    setEditingImageIndex(null);

    setFiles([]);
    setImageURL('');

    fileInputRef.current?.click();
  };
  const handleDelete = async (furnitureId: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this furniture?");
    if (!isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`https://furnspace.onrender.com/api/v1/furniture/delete/${furnitureId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (response.ok) {
            // First update the immediate UI
            setFurnitureList((prevList) => prevList.filter((item) => item._id !== furnitureId));
            
            if (selectedFurniture && selectedFurniture._id === furnitureId) {
                setSelectedFurniture(null);
                setEditMode(false);
            }
            
            // Show success alert
            alert("Furniture deleted successfully!");
            
            // Then refresh the entire data to ensure consistency
            await fetchProduct();
        } else {
            console.error("Failed to delete furniture:", data);
            alert(data.detail || data.message || "Failed to delete furniture. Please try again.");
        }
    } catch (error) {
        console.error("Error during furniture deletion:", error);
        alert("An error occurred while deleting the furniture. Please try again later.");
    }
  };

  const groupedFurniture = groupedFurnitureState;

  const renderFurnitureCard = (furniture: Furniture, type: 'sale' | 'rent') => {
    return (
      <div
        key={furniture._id}
        className={`relative overflow-hidden border-0 bg-white p-6 mb-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
      >
        <div className={`absolute top-0 right-0 p-2 rounded-bl-lg text-white text-xs font-bold ${
          type === 'sale' 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
            : 'bg-gradient-to-r from-orange-600 to-orange-500'
        }`}>
          {type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
        </div>
        
        <div className={`absolute inset-x-0 top-0 h-1 ${
          type === 'sale' 
            ? 'bg-gradient-to-r from-blue-600 to-teal-500' 
            : 'bg-gradient-to-r from-orange-600 to-amber-500'
        }`}></div>
        
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
          {type === 'sale' ? (
            <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
              <span className="font-semibold text-slate-500 block text-xs">PRICE</span>
              <span className="text-blue-600 font-bold">${furniture.price}</span>
            </p>
          ) : (
            <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
              <span className="font-semibold text-slate-500 block text-xs">RENT</span>
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
              src={furniture.images[0]}
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
            className={`px-4 py-2 rounded-lg text-white font-medium shadow-md flex items-center justify-center transition-all duration-300 ${
              type === 'sale' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600' 
                : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600'
            }`}
            onClick={() => handlePreview(furniture)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Manage
          </button>
          <button
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
            onClick={() => handleDelete(furniture._id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    );
  };

  const handleTabChange = (tab: 'sale' | 'rent' | 'all') => {
    setActiveTab(tab);
  };

  const handleTitleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTitleFilter(e.target.value);
  };

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
              src={furniture.images[0]}
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Manage
          </button>
          <button
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
            onClick={() => handleDelete(furniture._id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 2 0 0116.138 21H7.862a2 2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
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
    arrows: true,
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2">Click to add an image</p>
              </div>
            </div>
          )
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple   // ✅ IMPORTANT
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

  const uniqueTitles = Object.keys(groupedFurniture).sort();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="fixed top-0 left-0 h-full">
        <Sidebar />
      </div>

      <div className="flex-1 ml-72 flex flex-col">
        <AdminHeader />

        <main className="flex-1 p-6">
          <section className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                <FiList className="mr-2 text-indigo-600 dark:text-indigo-400" />
                Furniture Management
              </h2>
              {loadingMsg && <p className="text-blue-500 text-center">{loadingMsg}</p>}
              {error && <p className="text-rose-500 text-center">{error}</p>}
              {success && <p className="text-green-600 text-center">{success}</p>}
            </div>
            
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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
                      activeTab === 'sale'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                    onClick={() => handleTabChange('sale')}
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
                
                <div className="w-full md:w-auto">
                  <div className="relative inline-flex items-center bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                    <div className="absolute left-3 text-gray-400">
                      <FiFilter size={16} />
                    </div>
                    <select
                      value={selectedTitleFilter}
                      onChange={handleTitleFilterChange}
                      className="appearance-none pl-10 pr-10 py-2.5 rounded-lg bg-transparent text-gray-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="all">All Furniture Types</option>
                      {uniqueTitles.map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}

            {Object.keys(groupedFurniture).length > 0 ? (
              <div className="space-y-12">
                {Object.keys(groupedFurniture)
                  .filter(category => selectedTitleFilter === 'all' || category === selectedTitleFilter)
                  .map((category) => {
                  const categoryItems = [
                    ...groupedFurniture[category].forSale,
                    ...groupedFurniture[category].forRent
                  ];
                  const titleToShow = categoryItems.length > 0 ? categoryItems[0].title.split(' ')[0] : category;
                  
                  const combinedItems = new Map();
                  
                  groupedFurniture[category].forSale.forEach(item => {
                    combinedItems.set(item._id, item);
                  });
                  
                  groupedFurniture[category].forRent.forEach(item => {
                    if (!combinedItems.has(item._id)) {
                      combinedItems.set(item._id, item);
                    }
                  });
                  
                  const combinedItemsList = Array.from(combinedItems.values());
                  
                  return (
                    <div key={category} className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-300">{titleToShow}</h3>
                      
                      {activeTab === 'all' && combinedItemsList.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {combinedItemsList.map((furniture) => renderUnifiedFurnitureCard(furniture))}
                        </div>
                      )}
                      
                      {activeTab === 'all' && combinedItemsList.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No furniture available in this category.</p>
                      )}
                      
                      {activeTab === 'sale' && groupedFurniture[category].forSale.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {groupedFurniture[category].forSale.map((furniture) => renderFurnitureCard(furniture, 'sale'))}
                        </div>
                      )}
                      
                      {activeTab === 'sale' && groupedFurniture[category].forSale.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No furniture available for sale in this category.</p>
                      )}

                      {activeTab === 'rent' && groupedFurniture[category].forRent.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {groupedFurniture[category].forRent.map((furniture) => renderFurnitureCard(furniture, 'rent'))}
                        </div>
                      )}
                      
                      {activeTab === 'rent' && groupedFurniture[category].forRent.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No furniture available for rent in this category.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : ( 
              <p className="text-center text-gray-500">No furniture found.</p>
            )}
          </section>
        </main>
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
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
                 Cancel
               </button>
               <button
                 className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 flex items-center"
                 onClick={handleSave}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
                 Save
               </button>
             </div>
             {isLoading && (
               <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
               </div>
             )}
           </>
         ) : (
           <>
             <div className="flex justify-between items-center border-b pb-4 mb-6">
               <h2 className="text-3xl font-bold text-slate-800">{selectedFurniture.title}</h2>
               <button
                 onClick={closePreview}
                 className="text-slate-500 hover:text-slate-700 transition-colors duration-300"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
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
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
                 Close
               </button>
               <button
                 className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 flex items-center"
                 onClick={() => setEditMode(true)}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                 </svg>
                 Edit
               </button>
             </div>
           </>
         )}
       </div>
     </div>

      )}
    </div>
  );
}

export default ListFurniture;