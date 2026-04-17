import { useState, useEffect } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import Sidebar from '../../components/admin/Sidebar';

const UpdateFurniturePage = () => {
  const [furnitureData, setFurnitureData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    isForRent: false,
    rentPrice: '',
    isForSale: false,
    condition: '',
    availabilityStatus: '',
    dimensions: '',
    location: '',
    image: '',
    createdBy: 'user123', // Replace with dynamic user ID
  });

  const [furnitureId, ] = useState<string>(''); // To store the ID of the furniture to update

  // Fetch furniture data to be updated when the page loads
  useEffect(() => {
    const fetchFurnitureData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:10007/api/v1/furniture/${furnitureId}`);
        const data = await response.json();
        setFurnitureData(data);
      } catch (error) {
        console.error('Error fetching furniture data:', error);
      }
    };

    if (furnitureId) {
      fetchFurnitureData();
    }
  }, [furnitureId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setFurnitureData((prevData) => ({
        ...prevData,
        [target.name]: target.checked,
      }));
    } else {
      setFurnitureData((prevData) => ({
        ...prevData,
        [target.name]: target.value,
      }));
    }
  };

  const handleUpdateFurniture = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const headersList = {
      'Content-Type': 'application/json',
    };

    const bodyContent = JSON.stringify({
      title: furnitureData.title,
      description: furnitureData.description,
      category: furnitureData.category,
      price: parseFloat(furnitureData.price),
      is_for_rent: furnitureData.isForRent,
      rent_price: parseFloat(furnitureData.rentPrice),
      is_for_sale: furnitureData.isForSale,
      condition: furnitureData.condition,
      availability_status: furnitureData.availabilityStatus,
      dimensions: furnitureData.dimensions,
      location: furnitureData.location,
      image: furnitureData.image,
      created_by: furnitureData.createdBy,
    });

    try {
      const response = await fetch(`http://127.0.0.1:10007/api/v1/furniture/update/${furnitureId}`, {
        method: 'PUT',
        headers: headersList,
        body: bodyContent,
      });

      const result = await response.text();

      if (response.ok) {
        alert('Furniture updated successfully!');
        // Optionally, reset or navigate after a successful update
      } else {
        alert(`Error: ${result}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while updating furniture.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white h-full overflow-y-auto">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Update Furniture</h1>

            <form onSubmit={handleUpdateFurniture} className="space-y-6">
              {/* Input Fields */}
              {[ 
                { label: 'Title', name: 'title', type: 'text', value: furnitureData.title },
                { label: 'Description', name: 'description', type: 'textarea', value: furnitureData.description },
                { label: 'Category', name: 'category', type: 'text', value: furnitureData.category },
                { label: 'Price', name: 'price', type: 'number', value: furnitureData.price },
                { label: 'Rent Price', name: 'rentPrice', type: 'number', value: furnitureData.rentPrice },
                { label: 'Condition', name: 'condition', type: 'text', value: furnitureData.condition },
                { label: 'Availability', name: 'availabilityStatus', type: 'text', value: furnitureData.availabilityStatus },
                { label: 'Dimensions', name: 'dimensions', type: 'text', value: furnitureData.dimensions },
                { label: 'Location', name: 'location', type: 'text', value: furnitureData.location },
                { label: 'Image URL', name: 'image', type: 'text', value: furnitureData.image },
              ].map((field) => (
                <div key={field.name} className="mb-4">
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={field.value}
                      onChange={handleChange}
                      className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      required
                    />
                  ) : (
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      value={field.value}
                      onChange={handleChange}
                      className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required={field.name !== 'rentPrice'}
                      disabled={field.name === 'rentPrice' && !furnitureData.isForRent}
                    />
                  )}
                </div>
              ))}

              {/* Checkboxes */}
              {[ 
                { label: 'Is For Rent', name: 'isForRent', checked: furnitureData.isForRent },
                { label: 'Is For Sale', name: 'isForSale', checked: furnitureData.isForSale },
              ].map((checkbox) => (
                <div className="flex items-center mb-4" key={checkbox.name}>
                  <input
                    type="checkbox"
                    id={checkbox.name}
                    name={checkbox.name}
                    checked={checkbox.checked}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor={checkbox.name} className="text-sm font-medium text-gray-700">
                    {checkbox.label}
                  </label>
                </div>
              ))}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-2 bg-teal-600 text-white rounded-md shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Update Furniture
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UpdateFurniturePage;
