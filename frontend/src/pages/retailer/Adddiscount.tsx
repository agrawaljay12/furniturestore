import { useState, useEffect } from 'react';
import UserHeader from '../../components/UserHeader';
import UserSidebar from '../../components/UserSidebar';
import AdminFooter from "../../components/admin/AdminFooter";
import { useNavigate, useParams } from 'react-router-dom';
import { FiTag } from 'react-icons/fi';

const AddDiscountPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [discountData, setDiscountData] = useState<{
    furnitureId: string;
    discount: string;
    startDate: string;
    endDate: string;
  }>({
    furnitureId: '',
    discount: '',
    startDate: '',
    endDate: '',
  });

  // Use the furniture ID from URL params when component mounts
  useEffect(() => {
    if (id) {
      setDiscountData(prevData => ({
        ...prevData,
        furnitureId: id
      }));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    setDiscountData((prevData) => ({
      ...prevData,
      [target.name]: target.value,
    }));
  };

  const handleAddDiscount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:10007/api/v1/offer/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          furniture_id: discountData.furnitureId,
          discount: parseInt(discountData.discount),
          start_date: discountData.startDate || new Date().toISOString(),
          end_date: discountData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Discount added successfully! ${result.data.discount}% off applied to furniture ID: ${result.data.furniture_id}`);
        setDiscountData({
          furnitureId: '',
          discount: '',
          startDate: '',
          endDate: '',
        });
        navigate('/retailer/list-furniture');
      } else {
        const result = await response.text();
        alert(`Error: ${result}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while adding discount.');
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
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <FiTag className="mr-2 text-teal-600 dark:text-teal-400" />
                  Add New Discount
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create promotional offers for furniture items</p>
              </div>
              
              <form onSubmit={handleAddDiscount} className="p-6 space-y-6">
                {/* Furniture ID */}
                <div className="mb-4">
                  <label htmlFor="furnitureId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Furniture ID
                  </label>
                  <input
                    type="text"
                    id="furnitureId"
                    name="furnitureId"
                    value={discountData.furnitureId}
                    onChange={handleChange}
                    required
                    className="mt-1 p-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                    placeholder="Enter the furniture ID"
                    readOnly={!!id} // Make it read-only if an ID was provided in the URL
                  />
                  {id && (
                    <p className="mt-1 text-sm text-teal-600 dark:text-teal-400">ID automatically loaded from the selected furniture</p>
                  )}
                  {!id && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ID of the furniture to apply discount</p>
                  )}
                </div>

                {/* Discount Percentage */}
                <div className="mb-4">
                  <label htmlFor="discount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Percentage
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <input
                      type="number"
                      id="discount"
                      name="discount"
                      value={discountData.discount}
                      onChange={handleChange}
                      required
                      min="0"
                      max="100"
                      className="p-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-700 dark:text-white pr-12 transition-colors"
                      placeholder="e.g. 10 for 10% discount"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter a value between 0 and 100</p>
                </div>

                {/* Date Range Fields - With Improved Styling */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={discountData.startDate}
                      onChange={handleChange}
                      className="mt-1 p-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">If not set, starts immediately</p>
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={discountData.endDate}
                      onChange={handleChange}
                      className="mt-1 p-3 w-full border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">If not set, ends 7 days from today</p>
                  </div>
                </div> */}

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Add Discount
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

export default AddDiscountPage;
