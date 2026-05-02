import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainHeader from "../../../../components/user/MainHeader";
import MainFooter from "../../../../components/user/MainFooter";

interface FurnitureDetail {
  _id: string;
  title: string;
  category: string;
  description: string;
  images: string[];
  price: number;
  rent_price: string;
  is_for_rent: boolean;
  is_for_sale: boolean;
  condition: string;
  dimensions: string;
}

interface BookingDetail {
  _id: string;
  booking_id: string;
  user_id: string;
  user_name?: string;
  user_phone?: string;
  furniture_id: string[];
  booking_date: string;
  booking_status: string;
  duration?: number;
  total_price: number;
  payment_id: string;
  payment_status: string;
  payment_method: string;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  };
  payment_date: string;
  is_buying: boolean;
  furniture_details: FurnitureDetail[];
  payment_image?: string;
}

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const navigate = useNavigate();

  const getImageUrl = (imagePath: string | undefined, paymentId?: string): string => {
    if (!imagePath) {
      if (paymentId) {
        return `https://furnspace.onrender.com/api/v1/payments/${paymentId}/receipt`;
      }
      return "https://placehold.co/300x200/e0e0e0/808080?text=No+Image";
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const formattedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `https://furnspace.onrender.com${formattedPath}`;
  };

  const fetchBookingDetails = async () => {
    if (!id) {
      setError("Booking ID is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      const response = await fetch(`https://furnspace.onrender.com/api/v1/booking/get_with_furniture/${id}`);
      if (!response.ok) {
        setErrorCode(response.status);
        if (response.status === 500) {
          throw new Error("Server error. The booking service is currently unavailable.");
        } else if (response.status === 404) {
          throw new Error("Booking not found. It may have been deleted or never existed.");
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      }

      const data = await response.json();
      if (data.data && data.data.user_id && (!data.data.user_name || !data.data.user_phone)) {
        try {
          const headersList = {
            "Accept": "*/*",
            "User-Agent": "Thunder Client (https://www.thunderclient.com)"
          };
          
          const userResponse = await fetch(`https://furnspace.onrender.com/api/v1/auth/user/fetch/${data.data.user_id}`, {
            method: "GET",
            headers: headersList
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData && userData.data) {
              if (userData.data.first_name || userData.data.last_name) {
                const firstName = userData.data.first_name || '';
                const lastName = userData.data.last_name || '';
                data.data.user_name = `${firstName} ${lastName}`.trim();
              } else {
                data.data.user_name = userData.data.name || 
                                     userData.data.fullname || 
                                     userData.data.username ||
                                     userData.data.email?.split('@')[0];
              }
              
              data.data.user_phone = userData.data.phone || 
                                    userData.data.phoneNumber || 
                                    userData.data.contact || 
                                    userData.data.mobile;
            }
          }
        } catch (userError) {
          console.error("Error fetching user details:", userError);
        }
      }
      if (data.data && data.data.furniture_details) {
        data.data.furniture_details.forEach((furniture: any) => {
          if (furniture.image && (!furniture.images || !Array.isArray(furniture.images))) {
            furniture.images = [furniture.image];
          } else if (!furniture.images) {
            furniture.images = [];
          } else if (typeof furniture.images === 'string') {
            furniture.images = [furniture.images];
          }
          if (furniture.images && furniture.images.length > 0 && !furniture.image) {
            furniture.image = furniture.images[0];
          }
          if ((!furniture.images || furniture.images.length === 0) && furniture._id) {
            const directImageUrl = `https://furnspace.onrender.com/api/v1/furniture/${furniture._id}/image`;
            furniture.images = [directImageUrl];
            furniture.image = directImageUrl;
          }

          // Ensure rent_price is properly set
          if (furniture.rent_price === undefined && furniture.price) {
            furniture.rent_price = (furniture.price / 10).toFixed(2); // Default fallback if rent_price is missing
          }

          // Ensure price properties are properly formatted
          if (typeof furniture.price === 'string') {
            furniture.price = parseFloat(furniture.price);
          }

          // Handle potential issues with rent_price format
          if (furniture.rent_price === null || furniture.rent_price === undefined) {
            furniture.rent_price = "0.00";
          }
        });
      }
      if (data.data && data.data.payment_id) {
        try {
          // Check if it looks like a PayPal transaction ID (contains letters and is longer)
          const isExternalPaymentId = /[A-Za-z]/.test(data.data.payment_id) && data.data.payment_id.length > 15;
          
          if (isExternalPaymentId) {
            // Skip the first API call for external payment IDs that likely won't be in our database
            console.log(`External payment ID detected: ${data.data.payment_id}. Using receipt endpoint directly.`);
            data.data.payment_image = `https://furnspace.onrender.com/api/v1/payments/${data.data.payment_id}/receipt`;
          } else {
            const paymentResponse = await fetch(`https://furnspace.onrender.com/api/v1/payments/${data.data.payment_id}`);
            if (paymentResponse.ok) {
              const paymentData = await paymentResponse.json();
              if (paymentData && paymentData.data) {
                data.data.payment_image = paymentData.data.receipt_image || paymentData.data.image;
              }
            } else {
              console.log(`Payment API returned ${paymentResponse.status} for ID: ${data.data.payment_id}`);
              data.data.payment_image = `https://furnspace.onrender.com/api/v1/payments/${data.data.payment_id}/receipt`;
            }
          }
        } catch (paymentError) {
          console.error(`Error fetching payment details: ${paymentError}`);
          data.data.payment_image = `https://furnspace.onrender.com/api/v1/payments/${data.data.payment_id}/receipt`;
        }
      }
      setBooking(data.data);
    } catch (err) {
      setError(`Error fetching booking details: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return "$0.00";

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) return "$0.00";

    return `$${numValue.toFixed(2)}`;
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatDuration = (days: number | undefined) => {
    if (!days) return "N/A";
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`;
    if (days % 30 === 0) {
      const months = days / 30;
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    if (days % 7 === 0) {
      const weeks = days / 7;
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    return `${days} days`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error || "Booking not found"}</p>
        {errorCode === 500 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-amber-800 mb-2">
              The server is currently experiencing technical difficulties. This might be a temporary issue.
            </p>
            <p className="text-amber-700 text-sm">
              Error Code: 500 Internal Server Error
            </p>
          </div>
        )}
        <div className="flex space-x-4">
          {errorCode === 500 && (
            <button 
              onClick={fetchBookingDetails} 
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
            >
              Try Again
            </button>
          )}
          <button 
            onClick={() => navigate("/order-history")} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 shadow-lg">
        <MainHeader logoText="Furniture Store" onSearch={() => {}} />
      </div>

      <div className="min-h-screen bg-gray-50 px-8 pt-24 pb-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-semibold mb-8 text-gray-800 border-b pb-4">
            Booking Details
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-teal-600">Booking Information</h2>
              <div className="space-y-3">
                <p><span className="font-medium">Booking ID:</span> {booking._id}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    booking.booking_status === "confirmed" ? "bg-green-100 text-green-800" : 
                    booking.booking_status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                    "bg-red-100 text-red-800"
                  }`}>
                    {booking.booking_status.toUpperCase()}
                  </span>
                </p>
                <p><span className="font-medium">Type:</span> {booking.is_buying ? "Purchase" : "Rental"}</p>
                {!booking.is_buying && (
                  <p><span className="font-medium">Duration:</span> {formatDuration(booking.duration)}</p>
                )}
                <p><span className="font-medium">Date:</span> {formatDate(booking.booking_date)}</p>
                <p><span className="font-medium">Total Price:</span> {formatPrice(booking.total_price)}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-teal-600">Payment Information</h2>
              <div className="space-y-3">
                <p><span className="font-medium">Payment ID:</span> {booking.payment_id}</p>
                <p><span className="font-medium">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    booking.payment_status === "completed" ? "bg-green-100 text-green-800" : 
                    booking.payment_status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                    "bg-red-100 text-red-800"
                  }`}>
                    {booking.payment_status.toUpperCase()}
                  </span>
                </p>
                <p><span className="font-medium">Method:</span> {booking.payment_method}</p>
                <p><span className="font-medium">Date:</span> {formatDate(booking.payment_date)}</p>
                {booking.payment_image && (
                  <div className="mt-2">
                    <p className="font-medium mb-1">Payment Receipt:</p>
                    <div className="border rounded-lg overflow-hidden w-full max-w-xs">
                      <img 
                        src={getImageUrl(booking.payment_image, booking.payment_id)}
                        alt="Payment Receipt"
                        className="w-full h-auto"
                        onError={(e) => {
                          if (booking.payment_id) {
                            e.currentTarget.src = `https://furnspace.onrender.com/api/v1/payments/${booking.payment_id}/receipt`;
                          } else {
                            e.currentTarget.src = "https://placehold.co/300x200/e0e0e0/808080?text=No+Receipt";
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-teal-600">Shipping Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {booking.user_name ? (
                <p><span className="font-medium">Name:</span> {booking.user_name}</p>
              ) : (
                booking.user_id && <p><span className="font-medium">User ID:</span> {booking.user_id}</p>
              )}
              {booking.user_phone && <p><span className="font-medium">Phone:</span> {booking.user_phone}</p>}
              <p><span className="font-medium">Address:</span> {
                [
                  booking.delivery_address.street,
                  booking.delivery_address.city,
                  booking.delivery_address.state,
                  booking.delivery_address.country,
                  booking.delivery_address.zipcode
                ].filter(Boolean).join(", ")
              }</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-teal-600">
              {booking.is_buying ? "Purchased Items" : "Rented Items"}
            </h2>

            <div className="space-y-6">
              {booking.furniture_details.map((furniture, index) => (
                <div key={`${furniture._id}-${index}`} className="flex flex-col md:flex-row border rounded-lg overflow-hidden">
                  <div className="w-full md:w-1/3 h-48">
                    <img 
                      src={getImageUrl(furniture.images?.[0], booking.payment_id)}
                      alt={furniture.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (furniture.images && furniture.images.length > 1) {
                          e.currentTarget.src = getImageUrl(furniture.images[1]);
                        } else if (furniture._id) {
                          e.currentTarget.src = `https://furnspace.onrender.com/api/v1/furniture/${furniture._id}/image`;
                        } else {
                          e.currentTarget.src = "https://placehold.co/300x200/e0e0e0/808080?text=No+Image";
                        }
                      }}
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="text-lg font-semibold">{furniture.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">Category: {furniture.category}</p>
                    <p className="text-sm mb-2">{furniture.description}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Condition:</span> {furniture.condition}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Dimensions:</span> {furniture.dimensions}</p>
                    <p className="text-lg font-bold mt-2 text-teal-600">
                      {booking.is_buying ? 
                        formatPrice(furniture.price) : 
                        `${formatPrice(furniture.rent_price)}/day`
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate("/order-history")}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300"
            >
              Back to All Bookings
            </button>
          </div>
        </div>
      </div>

      <MainFooter />
    </>
  );
};

export default BookingDetailsPage;
