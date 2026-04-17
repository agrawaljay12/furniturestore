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

interface Offer {
  _id: string;
  furniture_id: string;
  discount: number;
  start_date: string;
  end_date: string;
  furniture?: Furniture;
}

function del(): React.ReactElement {
  const [furnitureList, setFurnitureList] = useState<Furniture[]>([]);
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [imageURL, setImageURL] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'sale' | 'rent'>('sale');

  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        const headersList = {
          "Accept": "/",
          "User-Agent": "Thunder Client (https://www.thunderclient.com)",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        };

        const response = await fetch("https://furnspace.onrender.com/api/v1/offer/list", {
          method: "GET",
          headers: headersList
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result && result.data) {
          // Extract furniture details from offers
          const furnitureFromOffers = result.data
            .filter((offer: Offer) => offer.furniture) // Only include offers with furniture data
            .map((offer: Offer) => ({
              ...offer.furniture,
              discount: offer.discount,
              offer_id: offer._id,
              offer_start_date: offer.start_date,
              offer_end_date: offer.end_date
            }));
          
          setFurnitureList(furnitureFromOffers);
          console.log("Furniture with offers:", furnitureFromOffers);
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
  };

  const handleSaveChanges = async () => {
    if (!selectedFurniture) return;

    const user_id = localStorage.getItem('token');
    if (!user_id) {
      setError("User ID is not found in local storage.");
      return;
    }

    const url = `https://furnspace.onrender.com/api/v1/furniture/update-furniture`;

    const formDataToSend = new FormData();
    formDataToSend.append("data", JSON.stringify({
      ...selectedFurniture,
      user_id,
      furniture_id: selectedFurniture._id,
      editing_image_index: editingImageIndex,
    }));

    if (file) {
      formDataToSend.append("files", file, file.name);
    }

    try {
      const response = await axios.post(url, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.status === 200) {
        setFurnitureList((prevList) =>
          prevList.map((item) => {
            if (item._id === selectedFurniture._id) {
              const updatedItem = { ...item, ...selectedFurniture };
              if (editingImageIndex !== null && selectedFurniture.images) {
                const updatedImages = [...selectedFurniture.images];
                updatedImages[editingImageIndex] = imageURL;
                updatedItem.images = updatedImages;
              } else {
                updatedItem.image = imageURL;
              }
              return updatedItem;
            }
            return item;
          })
        );
        setSelectedFurniture(null);
        setEditMode(false);
        alert("Furniture details updated successfully!");
      } else {
        alert(response.data.message || "Failed to update furniture details.");
      }
    } catch (error: any) {
      console.error('There was an error updating the furniture data!', error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(error.response.data.detail || "Failed to save furniture details.");
      } else {
        setError("An error occurred while saving furniture details.");
      }
      alert('Failed to save furniture details.');
    }
  };

  // add this function to handle delete furniture
  const handleDelete = async (furnitureId: string) => {
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

  const handleImageClick = (index: number | null = null) => {
    setEditingImageIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0 && selectedFurniture) {
  //     const file = e.target.files[0];
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onloadend = () => {
  //       const newImage = reader.result as string;
  //       if (editingImageIndex !== null && selectedFurniture.images) {
  //         const updatedImages = [...selectedFurniture.images];
  //         updatedImages[editingImageIndex] = newImage;
  //         setSelectedFurniture({
  //           ...selectedFurniture,
  //           images: updatedImages,
  //         });
  //       } else {
  //         setSelectedFurniture({
  //           ...selectedFurniture,
  //           image: newImage,
  //         });
  //       }
  //     };
  //   }
  // };


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

  // Handle tab switching
  const handleTabChange = (tab: 'sale' | 'rent') => {
    setActiveTab(tab);
  };

  // Function to render furniture card - update with improved offer display
  const renderFurnitureCard = (furniture: Furniture & { discount?: number, offer_id?: string, offer_start_date?: string, offer_end_date?: string }, type: 'sale' | 'rent') => {
    const originalPrice = type === 'sale' ? furniture.price : furniture.rent_price;
    const discountedPrice = furniture.discount ? 
      originalPrice! - (originalPrice! * (furniture.discount / 100)) : 
      originalPrice;
    
    // Calculate days left for offer if end date exists
    const daysLeft = furniture.offer_end_date ? 
      Math.max(0, Math.ceil((new Date(furniture.offer_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 
      null;

    return (
      <div
        key={furniture._id}
        className={`relative overflow-hidden border-0 bg-white p-6 mb-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
      >
        {/* Status badge with gradient background */}
        <div className={`absolute top-0 right-0 p-2 rounded-bl-lg text-white text-xs font-bold z-10 ${
          type === 'sale' 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
            : 'bg-gradient-to-r from-orange-600 to-orange-500'
        }`}>
          {type === 'sale' ? 'FOR SALE' : 'FOR RENT'}
        </div>
        
        {/* Discount badge */}
        {furniture.discount && (
          <div className="absolute top-10 right-0 bg-gradient-to-r from-red-600 to-rose-500 text-white px-2 py-1 rounded-l-lg z-10 font-bold">
            {furniture.discount}% OFF
            {daysLeft !== null && daysLeft <= 7 && (
              <span className="ml-1 text-yellow-200 text-xs"> ({daysLeft} days left)</span>
            )}
          </div>
        )}
        
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
              {furniture.discount ? (
                <div>
                  <span className="line-through text-slate-500">${originalPrice}</span>
                  <span className="text-rose-600 font-bold ml-2">${discountedPrice?.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-blue-600 font-bold">${originalPrice}</span>
              )}
            </p>
          ) : (
            <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
              <span className="font-semibold text-slate-500 block text-xs">RENT</span>
              {furniture.discount ? (
                <div>
                  <span className="line-through text-slate-500">${originalPrice}/mo</span>
                  <span className="text-rose-600 font-bold ml-2">${discountedPrice?.toFixed(2)}/mo</span>
                </div>
              ) : (
                <span className="text-orange-600 font-bold">${originalPrice}/month</span>
              )}
            </p>
          )}
          <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg">
            <span className="font-semibold text-slate-500 block text-xs">LOCATION</span>
            {furniture.location}
          </p>
          {furniture.offer_end_date && (
            <p className="text-slate-700 text-sm bg-slate-50 p-2 rounded-lg col-span-2">
              <span className="font-semibold text-slate-500 block text-xs">OFFER ENDS</span>
              <span className={daysLeft && daysLeft <= 3 ? "text-rose-600 font-bold" : ""}>
                {new Date(furniture.offer_end_date).toLocaleDateString()}
              </span>
            </p>
          )}
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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true, // Enable navigation arrows
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
              <span className="text-teal-600 font-medium">Deals & Offers</span>
            </div>
          </div>

          <section className="py-8 px-4">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-teal-500">
              <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="bg-teal-100 text-teal-700 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Deals & Offers Management
              </h2>
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                  <p>{error}</p>
                </div>
              )}
              
              {/* Enhanced Tab Navigation with improved design */}
              <div className="flex justify-center mb-8">
                <div className="flex w-full max-w-md rounded-lg overflow-hidden shadow-md border border-gray-200">
                  <button
                    className={`px-6 py-4 text-lg font-medium transition-all duration-300 flex-1 flex items-center justify-center ${
                      activeTab === 'sale'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-inner'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleTabChange('sale')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Sale Offers</span>
                    <span className="ml-2 bg-white text-blue-600 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                      {Object.values(groupedFurniture).reduce((count, group) => count + group.forSale.length, 0)}
                    </span>
                  </button>
                  <button
                    className={`px-6 py-4 text-lg font-medium transition-all duration-300 flex-1 flex items-center justify-center ${
                      activeTab === 'rent'
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-inner'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleTabChange('rent')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Rent Offers</span>
                    <span className="ml-2 bg-white text-amber-600 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                      {Object.values(groupedFurniture).reduce((count, group) => count + group.forRent.length, 0)}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modify the furniture display section */}
            {Object.keys(groupedFurniture).length > 0 ? (
              <div className="space-y-12">
                {Object.keys(groupedFurniture).map((category) => {
                  // Skip empty categories based on active tab
                  if (activeTab === 'sale' && groupedFurniture[category].forSale.length === 0) return null;
                  if (activeTab === 'rent' && groupedFurniture[category].forRent.length === 0) return null;
                  
                  return (
                    <div key={category} className="bg-white p-6 rounded-lg shadow-md">
                      <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-300">
                        <h3 className="text-2xl font-bold text-gray-800">{category}</h3>
                        <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm font-medium text-gray-600">
                          {activeTab === 'sale' ? 
                            `${groupedFurniture[category].forSale.length} items on sale` : 
                            `${groupedFurniture[category].forRent.length} items for rent`}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTab === 'sale' && 
                          groupedFurniture[category].forSale.map((furniture) => renderFurnitureCard(furniture, 'sale'))}
                        
                        {activeTab === 'rent' && 
                          groupedFurniture[category].forRent.map((furniture) => renderFurnitureCard(furniture, 'rent'))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-amber-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4M8 16l-4-4 4-4M16 16l4-4-4-4" />
                  </svg>
                </div>
                <p className="text-gray-600 text-xl">No furniture offers found.</p>
                <p className="text-gray-500 mt-2">Create new offers to see them here.</p>
              </div>
            )}
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
                      <div className="md:w-1/2 pr-4 mb-4 md:mb-0">
                        {selectedFurniture.images && selectedFurniture.images.length > 0 ? (
                          <Slider {...sliderSettings}>
                            {selectedFurniture.images.map((img, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={img}
                                  alt={selectedFurniture.title}
                                  className="w-full h-64 object-cover rounded cursor-pointer"
                                  onClick={() => handleImageClick(index)}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                  <span className="text-white bg-teal-600 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </Slider>
                        ) : (
                          selectedFurniture.image && (
                            <div className="relative">
                              <img
                                src={selectedFurniture.image}
                                alt={selectedFurniture.title}
                                className="w-full h-64 object-cover rounded cursor-pointer"
                                onClick={() => handleImageClick()}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <span className="text-white bg-teal-600 p-2 rounded-full">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </span>
                              </div>
                            </div>
                          )
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
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

export default del;