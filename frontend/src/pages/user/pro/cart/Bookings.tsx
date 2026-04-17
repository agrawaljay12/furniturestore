import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../../../components/user/MainHeader";
import MainFooter from "../../../../components/user/MainFooter";

interface BookingSummary {
  _id: string;
  booking_date: string;
  total_price: number;
  booking_status: string;
  payment_status: string;
  is_buying: boolean;
  duration?: number;
  furniture_details: Array<{
    _id: string;
    title: string;
    images: string[];
  }>;
}

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBookings = async () => {
      const userId = localStorage.getItem("token");
      if (!userId) {
        setError("User not logged in");
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:10007/api/v1/booking/user/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setBookings(data.data || []);
      } catch (err) {
        setError(`Error fetching bookings: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const handleViewBooking = (bookingId: string) => {
    navigate(`/booking/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 shadow-lg">
        <MainHeader logoText="Furniture Store" onSearch={() => {}} />
      </div>

      <div className="min-h-screen bg-gray-50 px-8 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8 text-center">Your Bookings</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {bookings.length === 0 && !error ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-medium text-gray-600 mb-4">No Bookings Found</h2>
              <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
              <button 
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                Browse Furniture
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map(booking => (
                <div 
                  key={booking._id} 
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gray-200">
                    {booking.furniture_details && booking.furniture_details.length > 0 && 
                     booking.furniture_details.some(item => item.images && item.images.length > 0) ? (
                      <img 
                        src={booking.furniture_details.find(item => item.images && item.images.length > 0)?.images[0] || 
                             booking.furniture_details[0].images?.[0] || 
                             "https://via.placeholder.com/300x200?text=No+Image"} 
                        alt={booking.furniture_details[0].title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/300x200?text=Image+Error";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No image available
                      </div>
                    )}
                    <div className="absolute top-0 right-0 m-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        booking.booking_status === "confirmed" ? "bg-green-100 text-green-800" : 
                        booking.booking_status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-red-100 text-red-800"
                      }`}>
                        {booking.booking_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-gray-500">Booking ID: {booking._id}</p>
                    <p className="text-sm text-gray-500">Date: {formatDate(booking.booking_date)}</p>
                    <p className="font-semibold mt-2">
                      {booking.is_buying ? "Purchase" : "Rental"} - ${booking.total_price.toFixed(2)}
                    </p>
                    
                    <div className="mt-3">
                      <p className="text-sm font-medium">Items:</p>
                      <ul className="text-sm text-gray-600">
                        {booking.furniture_details.map((item, index) => (
                          <li key={index} className="truncate">• {item.title}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => handleViewBooking(booking._id)}
                      className="mt-4 w-full py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MainFooter />
    </>
  );
};

export default BookingsPage;
