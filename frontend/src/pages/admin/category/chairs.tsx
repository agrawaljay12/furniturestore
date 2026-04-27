import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import Sidebar from '../../../components/admin/Sidebar';
import AdminHeader from '../../../components/admin/AdminHeader';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';
import { FiFilter } from 'react-icons/fi';

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

function chairs(): React.ReactElement {
  const [furnitureList, setFurnitureList] = useState<Furniture[]>([]);
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [imageURL, setImageURL] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
   
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'all'>('all');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState(1);

  // State for handling messages
  const [error, setError] = useState<string>('');
  const [, setLoadingMsg] = useState<string>(''); 

 
  const fetchProduct = async () => {
    try {
      setLoadingMsg("Loading furniture...");

      const response = await axios.post(
        "https://furnspace.onrender.com/api/v1/furniture/list_all",
        {
          page: page,
          limit: limit,
          sort_by: sortBy,
          order: order,
          search: search,
          listing_type: activeTab,
          title: "chairs" 
        }
      );

      if (response.data?.data) {
        setFurnitureList(response.data.data);
        setTotalPages(response.data.pagination?.total_pages || 1);
      } else {
        setFurnitureList([]);
      }

    } catch (error) {
      console.error(error);
      setError("Failed to fetch furniture");
    } finally {
      setLoadingMsg('');
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProduct();
    }, 500);

    return () => clearTimeout(delay);
  }, [search, sortBy, order, page, activeTab]);

  
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

    const formData = new FormData();

    const payload: any = {
      furniture_id: selectedFurniture._id,
      ...selectedFurniture,
    };

    // DO NOT send replace_indexes inside payload
    formData.append("data", JSON.stringify(payload));

    // SEND FILES + INDEXES PROPERLY
    if (file && editingImageIndex !== null) {
      formData.append("files", file);
      formData.append("replace_indexes", JSON.stringify([editingImageIndex]));
    }

    try {
      const res = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.status === 200) {
        await fetchProduct();

        setSelectedFurniture(null);
        setEditMode(false);
        setFile(null);
        setImageURL('');
        setEditingImageIndex(null);

        alert("furniture update successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

// Handle image click to trigger file input
const handleImageClick = (index: number | null = null, e?: React.MouseEvent) => {
  e?.stopPropagation();

  console.log("IMAGE CLICKED:", index); // 🔍 DEBUG

  if (!selectedFurniture) return;

  if (selectedFurniture.images && selectedFurniture.images.length > 0) {
    setEditingImageIndex(index ?? 0);
  } else {
    setEditingImageIndex(0);
  }

  setFile(null);
  setImageURL('');

  // 🔥 IMPORTANT: delay fixes slider blocking
  setTimeout(() => {
    fileInputRef.current?.click();
  }, 0);
};

// Handle file changes for image upload
const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  const selectedFiles = Array.from(event.target.files || []);

  if (!selectedFiles.length) return;

  setFile(selectedFiles[0]);

  const reader = new FileReader();
  reader.onloadend = () => setImageURL(reader.result as string);
  reader.readAsDataURL(selectedFiles[0]);

  // ✅ VERY IMPORTANT
  event.target.value = '';
};

// Handle furniture deletion
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



// Handle tab switching
const handleTabChange = (tab: 'buy' | 'rent'| 'all') => {
  setActiveTab(tab);
  setPage(1);
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
              Bed Furniture Management
            </h2>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-md" role="alert">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="w-full flex flex-col md:flex-row items-center gap-4">

                {/* 🔍 SEARCH BAR */}
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Search furniture..."
                    value={search}
                    onChange={(e) => {
                      setPage(1);
                      setSearch(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 
                    bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-white 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />

                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FiFilter size={16} />
                  </div>
                </div>

                

                {/* 🔽 SORT DROPDOWN */}
                <div className="w-full md:w-72">

                  <div className="text-sm text-gray-500">
                    Sorted by: 
                    <span className="font-semibold text-indigo-600 ml-1">
                      {sortBy.replace("_", " ")} ({order})
                    </span>
                  </div>  

                  <select
                    value={`${sortBy}_${order}`}
                    onChange={(e) => {
                      const value = e.target.value;
                      const lastUnderscoreIndex = value.lastIndexOf("_");

                      const field = value.substring(0, lastUnderscoreIndex);
                      const dir = value.substring(lastUnderscoreIndex + 1);

                      setPage(1);
                      setSortBy(field);
                      setOrder(dir as "asc" | "desc"); // ✅ FIXED (capital O)
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 
                    bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-white 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
                  >
                    {/* ✅ CORRECTED SORTING */}
                    <option value="created_at_desc">Newest First</option>
                    <option value="created_at_asc">Oldest First</option>

                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>

                    <option value="rent_price_asc">Rent: Low → High</option>
                    <option value="rent_price_desc">Rent: High → Low</option>

                    <option value="title_asc">Title: A → Z</option>
                    <option value="title_desc">Title: Z → A</option>

                    <option value="category_asc">Category: A → Z</option>
                    <option value="category_desc">Category: Z → A</option>
                  </select>
                </div>

              </div>
            

            {/* Filters section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
              {/* Enhanced Tab Navigation */}
              <div className="flex justify-center mb-6">
                <div className="flex rounded-xl overflow-hidden shadow-md border">
                  
                  <button
                    className={`px-6 py-2 text-sm font-semibold transition ${
                      activeTab === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleTabChange('all')}
                  >
                    All
                  </button>

                  <button
                    className={`px-6 py-2 text-sm font-semibold transition ${
                      activeTab === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleTabChange('buy')}
                  >
                    For Sale
                  </button>

                  <button
                    className={`px-6 py-2 text-sm font-semibold transition ${
                      activeTab === 'rent'
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleTabChange('rent')}
                  >
                    For Rent
                  </button>

                </div>
              </div>
            </div>
          </div>

          {furnitureList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {furnitureList
                .filter((item) => {
                  if (activeTab === "buy") return item.is_for_sale;
                  if (activeTab === "rent") return item.is_for_rent;
                  return true; // for "all"
                })
                .map((furniture) =>
                  renderFurnitureCard(
                    furniture,
                    furniture.is_for_sale ? "sale" : "rent"
                  )
                )}
            </div>
          ) : (
            <p className="text-center text-gray-500">No furniture found.</p>
          )}
        </section>

        {/* pagination */}
        <div className="flex justify-center mt-8 space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className={`px-4 py-2 rounded ${
                page === 1
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              >
              Prev
            </button>

          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Next
          </button>
        </div>
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
                          <div key={index}>
                            <div
                              className="relative cursor-pointer"
                              onClick={() => handleImageClick(index)}
                            >
                              <img
                                src={
                                  editingImageIndex === index && imageURL
                                    ? imageURL
                                    : img
                                }
                                alt={selectedFurniture.title}
                                className="w-full h-64 object-cover rounded"
                                draggable={false} // ✅ VERY IMPORTANT (fix for slick)
                              />

                              {/* Overlay */}
                              <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 flex items-center justify-center pointer-events-none transition">
                                <span className="text-white text-sm">Click to replace</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </Slider>
                    ) : (
                      selectedFurniture.image && (
                        <div className="relative">
                          <img
                            src={imageURL || selectedFurniture.image}
                            alt={selectedFurniture.title}
                            className="w-full h-64 object-cover rounded cursor-pointer"
                            onClick={() => handleImageClick(0)} // ✅ treat as index 0
                          />

                          {editingImageIndex !== null && (
                            <p className="text-center text-sm text-orange-600 mt-2">
                              Replacing image #{editingImageIndex + 1}
                            </p>
                          )}

                          <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 flex items-center justify-center transition pointer-events-none">
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
                      accept="image/*"
                      multiple
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

export default chairs;