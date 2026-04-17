import React, { useState } from 'react';
import PaymentIntegration from '../../../Auth/PaymnetIntegration';
import MainFooter from '../../../components/user/MainFooter';
import MainHeader from '../../../components/user/MainHeader';

function BookingPage() {
    const [bookingData, setBookingData] = useState({
        furniture_id: "",
        booking_status: "pending",
        duration: 0,
        total_price: 0,
        payment_status: "",
        payment_method: "",
        delivery_address: "",
        is_buying: false
    });

    const [isPaymentReady, setIsPaymentReady] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBookingData({
            ...bookingData,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPaymentReady(true);
    };

    const onApprove = async (actions: any) => {
        const transaction = await actions.order.capture();
        const bookingDetails = {
            ...bookingData,
            payment_status: "complete",
            payment_method: "PayPal",
            transaction
        };

        const response = await fetch("https://furnspace.onrender.com/api/v1/booking/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookingDetails)
        });

        const result = await response.json();
        console.log(result);
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50">
                <MainHeader logoText="Furniture Store" onSearch={() => {}} />
            </div>
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
                    <h2 className="text-3xl font-extrabold mb-6 text-center">Create Booking</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="furniture_id"
                            value={bookingData.furniture_id}
                            onChange={handleChange}
                            placeholder="Enter furniture ID"
                            className="w-full p-2 border border-gray-400 rounded"
                            required
                        />
                        <select
                            name="booking_status"
                            value={bookingData.booking_status}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-400 rounded"
                            required
                        >
                            <option value="pending">Pending</option>
                            <option value="booked">Booked</option>
                        </select>
                        <input
                            type="number"
                            name="duration"
                            value={bookingData.duration}
                            onChange={handleChange}
                            placeholder="Enter duration (days)"
                            className="w-full p-2 border border-gray-400 rounded"
                            required
                        />
                        <input
                            type="number"
                            name="total_price"
                            value={bookingData.total_price}
                            onChange={handleChange}
                            placeholder="Enter total price"
                            className="w-full p-2 border border-gray-400 rounded"
                            required
                        />
                        <input
                            type="text"
                            name="delivery_address"
                            value={bookingData.delivery_address}
                            onChange={handleChange}
                            placeholder="Enter delivery address"
                            className="w-full p-2 border border-gray-400 rounded"
                            required
                        />
                        <label className="flex items-center col-span-1 md:col-span-2">
                            <input
                                type="checkbox"
                                name="is_buying"
                                checked={bookingData.is_buying}
                                onChange={(e) => setBookingData({ ...bookingData, is_buying: e.target.checked })}
                                className="mr-2"
                            />
                            Is Buying
                        </label>
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-600 col-span-1 md:col-span-2">
                            Create Booking
                        </button>
                    </form>
                    {isPaymentReady && (
                        <PaymentIntegration amountInr={bookingData.total_price} onApprove={onApprove} />
                    )}
                </div>
            </div>
            <MainFooter />
        </>
    );
}

export default BookingPage;