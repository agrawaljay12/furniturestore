import { useState } from 'react';
import UserHeader from '../../components/UserHeader';
import UserSidebar from '../../components/UserSidebar';
import AdminFooter from "../../components/admin/AdminFooter";
import {useNavigate} from 'react-router-dom';
import { FiPlusSquare, FiBox, FiDollarSign, FiCheckSquare, FiMapPin, FiImage, FiTag } from 'react-icons/fi';

const categorySubcategories: { [key: string]: string[] } = {
  'living room': ['Sofa', 'Coffee Table', 'TV Stand'],
  'bedroom': ['Bed', 'Wardrobe', 'Nightstand'],
  'tables': ['Dining Table', 'Coffee Table', 'Side Table'],
  'chairs': ['Dining Chair', 'Office Chair', 'Armchair'],
  'dining': ['Dining Table', 'Dining Chair', 'Buffet'],
  'mattress': ['Single Mattress', 'Double Mattress', 'Queen Mattress'],
  'storage': ['Bookshelf', 'Cabinet', 'Drawer'],
};

// Add a list of popular furniture brands
const furnitureBrands: string[] = [
  'IKEA',
  'Ashley Furniture',
  'La-Z-Boy',
  'Restoration Hardware',
  'Crate & Barrel',
  'West Elm',
  'Pottery Barn',
  'Ethan Allen',
  'Herman Miller',
  'Steelcase',
  'Thomasville',
  'Havertys',
  'Williams-Sonoma',
  'Sauder',
  'Flexsteel'
];

const AddFurniturePage = () => {
  const navigate = useNavigate();
  const [furnitureData, setFurnitureData] = useState<{
    title: string;
    description: string;
    category: string;
    brand: string;
    price: string;
    isForRent: boolean;
    rentPrice: string;
    isForSale: boolean;
    condition: string;
    availabilityStatus: string;
    dimensions: string;
    location: string;
    files: File[];
    createdBy: string;
  }>({
    title: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    isForRent: false,
    rentPrice: '',
    isForSale: false,
    condition: '',
    availabilityStatus: '',
    dimensions: '',
    location: '',
    files: [],
    createdBy: 'user123',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;

    if (target.type === 'file') {
      const files = Array.from((target as HTMLInputElement).files || []);
      setFurnitureData((prevData) => ({
        ...prevData,
        files,
      }));
    } else if (target.type === 'checkbox') {
      const { name, checked } = target as HTMLInputElement;
      
      // Special handling for sale/rent checkboxes
      if (name === 'isForRent' || name === 'isForSale') {
        setFurnitureData((prevData) => ({
          ...prevData,
          [name]: checked,
        }));
      } else {
        setFurnitureData((prevData) => ({
          ...prevData,
          [name]: checked,
        }));
      }
    } else {
      setFurnitureData((prevData) => ({
        ...prevData,
        [target.name]: target.value,
      }));
    }
  };

  const handleAddFurniture = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userId = localStorage.getItem('token') || 'user123';

    const formData = new FormData();
    const jsonData = {
      title: furnitureData.title,
      description: furnitureData.description,
      category: furnitureData.category,
      brand: furnitureData.brand,
      price: furnitureData.price || "", // Allow empty price value
      is_for_rent: furnitureData.isForRent,
      rent_price: furnitureData.rentPrice || '',
      is_for_sale: furnitureData.isForSale,
      condition: furnitureData.condition,
      availability_status: furnitureData.availabilityStatus,
      dimensions: furnitureData.dimensions,
      location: furnitureData.location,
      created_by: userId,
    };
    formData.append('data', JSON.stringify(jsonData));

    furnitureData.files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('https://furnspace.onrender.com/api/v1/furniture/add', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Furniture added successfully!');
        setFurnitureData({
          title: '',
          description: '',
          category: '',
          brand: '',
          price: '',
          isForRent: false,
          rentPrice: '',
          isForSale: false,
          condition: '',
          availabilityStatus: '',
          dimensions: '',
          location: '',
          files: [],
          createdBy: 'user123',
        });
        navigate('/retailer/list-furniture');
      } else {
        const result = await response.text();
        alert(`Error: ${result}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while adding furniture.');
    }
  };

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
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <FiPlusSquare className="mr-2 text-purple-600 dark:text-purple-400" />
                  Add New Furniture
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create new furniture listings for your store</p>
              </div>
              
              <form onSubmit={handleAddFurniture} className="p-6 space-y-6">
                {/* Section with Title and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title (Category)
                    </label>
                    <select
                      id="title"
                      name="title"
                      value={furnitureData.title}
                      onChange={handleChange}
                      required
                      className="mt-1 p-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                    >
                      <option value="">Select Title</option>
                      {Object.keys(categorySubcategories).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subcategory
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={furnitureData.category}
                      onChange={handleChange}
                      required
                      className="mt-1 p-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                    >
                      <option value="">Select Subcategory</option>
                      {categorySubcategories[furnitureData.title]?.map((subcategory) => (
                        <option key={subcategory} value={subcategory}>
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="pb-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <FiBox className="mr-1 text-purple-600 dark:text-purple-400" />
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={furnitureData.description}
                    onChange={handleChange}
                    required
                    className="mt-1 p-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                    rows={4}
                  />
                </div>

                {/* Brand Field */}
                <div className="pb-2">
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <FiTag className="mr-1 text-purple-600 dark:text-purple-400" />
                    Brand
                  </label>
                  <select
                    id="brand"
                    name="brand"
                    value={furnitureData.brand}
                    onChange={handleChange}
                    className="mt-1 p-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                  >
                    <option value="">Select Brand</option>
                    {furnitureBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price and Rent Price Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <FiDollarSign className="mr-1 text-emerald-600 dark:text-emerald-400" />
                      Sale Price
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400">$</span>
                      </div>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={furnitureData.price}
                        onChange={handleChange}
                        className="p-3 pl-7 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Available only for sale items</p>
                  </div>

                  <div>
                    <label htmlFor="rentPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <FiDollarSign className="mr-1 text-blue-600 dark:text-blue-400" />
                      Rent Price
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400">$</span>
                      </div>
                      <input
                        type="number"
                        id="rentPrice"
                        name="rentPrice"
                        min="0"
                        value={furnitureData.rentPrice}
                        onChange={handleChange}
                        className={`p-3 pl-7 w-full border rounded-lg shadow-sm transition-colors ${
                          !furnitureData.isForRent 
                            ? 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500 border-gray-200 dark:border-slate-700' 
                            : 'border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white'
                        }`}
                        disabled={!furnitureData.isForRent}
                        required={furnitureData.isForRent}
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Available only for rent items</p>
                  </div>
                </div>

                {/* Condition, Availability, Dimensions, Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                  <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Condition
                    </label>
                    <input
                      type="text"
                      id="condition"
                      name="condition"
                      value={furnitureData.condition}
                      onChange={handleChange}
                      required
                      className="mt-1 p-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                      placeholder="e.g. New, Used, Like New"
                    />
                  </div>

                  <div>
                    <label htmlFor="availabilityStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Availability
                    </label>
                    <input
                      type="text"
                      id="availabilityStatus"
                      name="availabilityStatus"
                      value={furnitureData.availabilityStatus}
                      onChange={handleChange}
                      required
                      className="mt-1 p-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                      placeholder="e.g. In Stock, Available"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                  <div>
                    <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      id="dimensions"
                      name="dimensions"
                      value={furnitureData.dimensions}
                      onChange={handleChange}
                      className="mt-1 p-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                      placeholder="e.g. 60cm x 80cm x 120cm"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <FiMapPin className="mr-1 text-rose-600 dark:text-rose-400" />
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={furnitureData.location}
                      onChange={handleChange}
                      required
                      className="mt-1 p-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                      placeholder="e.g. New York, NY"
                    />
                  </div>
                </div>

                {/* Checkbox Inputs Styled */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                  <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="isForRent"
                        name="isForRent"
                        checked={furnitureData.isForRent}
                        onChange={handleChange}
                        className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <FiCheckSquare className="text-blue-500 mr-1" />
                        Available For Rent
                      </span>
                    </label>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="isForSale"
                        name="isForSale"
                        checked={furnitureData.isForSale}
                        onChange={handleChange}
                        className="form-checkbox h-5 w-5 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <FiCheckSquare className="text-emerald-500 mr-1" />
                        Available For Sale
                      </span>
                    </label>
                  </div>
                </div>

                {/* Images Input Styled */}
                <div className="pb-2">
                  <label htmlFor="files" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <FiImage className="mr-1 text-indigo-600 dark:text-indigo-400" />
                    Upload Images
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-4m-12-4h.01M12 20h8m-8 4h8"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="files"
                          className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                        >
                          <span className="px-2">Upload files</span>
                          <input
                            type="file"
                            id="files"
                            name="files"
                            multiple
                            onChange={handleChange}
                            required
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02]">
                    Add Furniture
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AddFurniturePage;