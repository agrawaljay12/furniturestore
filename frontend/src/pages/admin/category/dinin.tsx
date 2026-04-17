import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import Sidebar from '../../../components/admin/Sidebar';
import AdminHeader from '../../../components/admin/AdminHeader';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';

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
}

function din(): React.ReactElement {
  const [furnitureList, setFurnitureList] = useState<Furniture[]>([]);
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [imageURL, setImageURL] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'sale' | 'rent'>('sale');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchFurniture = async () => {
      const token = localStorage.getItem("token"); // Assuming the auth token is stored in localStorage.

      if (!token) {
        setError("Token is missing. Please log in again.");
        return;
      }

      try {
        let headersList = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        };

        let bodyContent = JSON.stringify({
          page: 1,
          page_size: 100,
          sort_by: "price",
          sort_order: "asc",
          search: "",
          title: "dining" // Fetch only tables
        });

        let response = await fetch("https://furnspace.onrender.com/api/v1/furniture/list_all", {
          method: "POST",
          body: bodyContent,
          headers: headersList
        });

        let data = await response.json();

        if (data && data.data) {
          setFurnitureList(data.data);
        } else {
          setError("Failed to fetch furniture data.");
        }
      } catch (err) {
        console.error("Error fetching furniture data:", err);
        setError("Failed to fetch furniture data. Please check your connection or API.");
      }
    };

    fetchFurniture();
  }, []);

  // Handle file changes for image upload
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePreview = (furniture: Furniture) => {
    setSelectedFurniture(furniture);
    setEditMode(false); // Ensure it starts in preview mode
  };

  const closePreview = () => {
    setSelectedFurniture(null);
    setEditMode(false);
    setFile(null);
    setImageURL('');
    setEditingImageIndex(null);
  };

  // Updated to match ListFurniturePage implementation
  const handleSaveChanges = async () => {
    if (!selectedFurniture) return;

    const user_id = localStorage.getItem('token');
    if (!user_id) {
      setError("User ID is not found in local storage.");
      return;
    }

    // Always use FormData for consistency
    const url = `https://furnspace.onrender.com/api/v1/furniture/update-furniture`;
    const formDataToSend = new FormData();
    
    // Prepare the data object with all furniture details and image context
    const dataToSend = {
      ...selectedFurniture,
      user_id,
      furniture_id: selectedFurniture._id,
      editing_image_index: editingImageIndex,
      // Include explicit flags for image handling logic
      has_new_image: !!file,
      current_image_type: selectedFurniture.images && selectedFurniture.images.length > 0 ? 'multiple' : 'single'
    };
    
    console.log("Sending data to server:", dataToSend);
    formDataToSend.append("data", JSON.stringify(dataToSend));

    // Add file if one was selected
    if (file) {
      formDataToSend.append("files", file);
      console.log("Uploading file:", file.name);
    }

    try {
      // Show loading state
      setError("Updating furniture...");
      
      const response = await axios.post(url, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.status === 200) {
        // Update the furniture list with a fresh fetch
        const fetchFurniture = async () => {
          const token = localStorage.getItem("token");
          if (!token) {
            setError("Token is missing. Please log in again.");
            return;
          }

          try {
            let headersList = {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            };

            let bodyContent = JSON.stringify({
              page: 1,
              page_size: 100,
              sort_by: "price",
              sort_order: "asc",
              search: "",
              title: "dining" // Fetch only dining items
            });

            let response = await fetch("https://furnspace.onrender.com/api/v1/furniture/list_all", {
              method: "POST",
              body: bodyContent,
              headers: headersList
            });

            let data = await response.json();

            if (data && data.data) {
              setFurnitureList(data.data);
            }
          } catch (err) {
            console.error("Error refreshing furniture data:", err);
          }
        };

        fetchFurniture();
        
        setSelectedFurniture(null);
        setEditMode(false);
        setFile(null);
        setImageURL('');
        setEditingImageIndex(null);
        setError('');
        alert("Furniture details updated successfully!");
      } else {
        alert(response.data.message || "Failed to update furniture details.");
      }
    } catch (error: any) {
      console.error('There was an error updating the furniture data!', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      setError("Failed to update furniture: " + (error.response?.data?.detail || error.message || "Unknown error"));
      alert('Failed to update furniture. Please check the console for details.');
    }
  };

  // Updated image click handler
  const handleImageClick = (index: number | null = null, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (selectedFurniture?.images && selectedFurniture.images.length > 0) {
      // When dealing with multiple images, track which one we're editing
      setEditingImageIndex(index === null ? selectedFurniture.images.length : index);
      console.log(`Editing image at index ${index} in collection of ${selectedFurniture.images.length} images`);
    } else {
      // For single image scenario or adding first image to empty collection
      setEditingImageIndex(-2); // -2 is our special code for single image replacement
      console.log('Editing single image or adding first image');
    }
    
    // Reset previous upload data
    setFile(null);
    setImageURL('');
    
    // Open file dialog
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Add function to handle adding a new image
  const handleAddNewImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // For adding to existing collection or creating new collection from single image
    if (selectedFurniture?.images && selectedFurniture.images.length > 0) {
      setEditingImageIndex(selectedFurniture.images.length); // Add at end of collection
    } else if (selectedFurniture?.image) {
      // Convert from single image to collection
      setEditingImageIndex(-1); // -1 is our special code for adding to collection
    } else {
      // No images yet, add first image
      setEditingImageIndex(-2);
    }
    
    // Reset previous upload data
    setFile(null);
    setImageURL('');
    
    // Open file dialog
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Improved delete function
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
            setFurnitureList((prevList) => prevList.filter((item) => item._id !== furnitureId));
            alert("Furniture deleted successfully!");
        } else {
            alert(data.message || "Failed to delete furniture.");
        }
    } catch (error) {
        alert("An error occurred. Please try again later.");
    }
};

  // Group furniture by category and then by sale/rent status
  const groupedFurniture = furnitureList.reduce((acc, furniture) => {
    if (!acc[furniture.category]) {
      acc[furniture.category] = { forSale: [], forRent: [] };
    }
    if (furniture.is_for_sale) {
      acc[furniture.category].forSale.push(furniture);
    }
    if (furniture.is_for_rent) {
      acc[furniture.category].forRent.push(furniture);
    }
    return acc;
  }, {} as Record<string, { forSale: Furniture[], forRent: Furniture[] }>);

  // Get unique categories for dropdown
  const categories = Object.keys(groupedFurniture);

  // Handle tab switching
  const handleTabChange = (tab: 'sale' | 'rent') => {
    setActiveTab(tab);
  };

  // Handle category selection
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true, // Enable navigation arrows
  };

  // Function to render furniture card
  const renderFurnitureCard = (furniture: Furniture, type: 'sale' | 'rent') => {
    return (
      <div
        key={furniture._id}
        className={`relative overflow-hidden border-0 bg-white p-6 mb-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
      >
        {/* Status badge with gradient background */}
        <div className={`absolute top-0 right-0 p-2 rounded-bl-lg text-white text-xs font-bold ${
          type === 'sale' 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
            : 'bg-gradient-to-r from-orange-600 to-orange-500'
        }`}>
          {type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
        </div>
        
        {/* Card border with gradient */}
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
              <span className="text-orange-600 font-bold">${furniture.rent_price}/month</span>
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

  // Add the renderImageSection function
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-full overflow-y-auto fixed left-0 top-0 z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center text-sm text-slate-500">
              <span className="hover:text-teal-600 cursor-pointer transition-colors duration-200">Dashboard</span>
              <span className="mx-2">/</span>
              <span className="hover:text-teal-600 cursor-pointer transition-colors duration-200">Categories</span>
              <span className="mx-2">/</span>
              <span className="text-teal-600 font-medium">Dining</span>
            </div>
          </div>

          <section className="py-8 px-4">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-teal-500">
              <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="bg-teal-100 text-teal-700 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </span>
                Dining Furniture Management
              </h2>
              {error && <p className="text-red-500 text-center">{error}</p>}
              
              {/* Filters section */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                {/* Enhanced Tab Navigation */}
                <div className="flex w-full md:w-auto mb-4 md:mb-0 rounded-lg overflow-hidden shadow-md">
                  <button
                    className={`px-6 py-3 text-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                      activeTab === 'sale'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleTabChange('sale')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>For Sale</span>
                  </button>
                  <button
                    className={`px-6 py-3 text-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                      activeTab === 'rent'
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleTabChange('rent')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>For Rent</span>
                  </button>
                </div>
                
                {/* Category dropdown */}
                <div className="w-full md:w-64">
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {Object.keys(groupedFurniture).length > 0 ? (
                <div className="space-y-12">
                  {(selectedCategory === 'all' ? Object.keys(groupedFurniture) : [selectedCategory]).map((category) => {
                    // Skip if the category doesn't exist in the grouped furniture
                    if (!groupedFurniture[category]) return null;
                    
                    return (
                      <div key={category} className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-300">{category}</h3>
                        
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
            </div>
          </section>
        </main>

        {/* Preview / Edit Modal */}
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
                      onClick={handleSaveChanges}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
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
                                ${selectedFurniture.rent_price}/month
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
    </div>
  );
}

export default din;