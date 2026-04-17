import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/admin/Sidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const UpdateUserPage = () => {
    const [userId, setUserId] = useState('');
    const [userData, setUserData] = useState({
        first_name: '',
        last_name: '',
        password: '',
        email: '',
        phone: '',
        phone2: '',
        address: '',
        pin_code: '',
        city: '',
        state: '',
        country: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState<string>('http://localhost:10007/files/default.png');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userId = localStorage.getItem('token');
        if (!userId) {
            setMessage('Please provide a user ID.');
            return;
        }
        // const userId = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('user_data', JSON.stringify(userData)); // Add user data as JSON string
        if (file) {
            formData.append('file', file); // Add the file
        }

        try {
            const response = await axios.put(`http://localhost:10007/api/v1/auth/user/${userId}/update`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedData = response.data.data;
            setMessage('User details updated successfully');
            setProfilePicUrl(updatedData.profile_pic || 'http://localhost:10007/files/default.png');
            setUserData({
                ...userData,
                ...updatedData,
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setMessage(`Failed to update user details: ${error.response.data.data.message}`);
            } else {
                setMessage('Failed to update user details');
            }
            console.error(error);
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
                        <h1 className="text-3xl font-bold mb-6 text-gray-800">Update User Profile</h1>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* User ID Field */}
                            <div className="mb-4">
                                <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
                                    User ID
                                </label>
                                <input
                                    type="text"
                                    id="user_id"
                                    name="user_id"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Input Fields */}
                            {[
                                { label: 'First Name', name: 'first_name', type: 'text', value: userData.first_name },
                                { label: 'Last Name', name: 'last_name', type: 'text', value: userData.last_name },
                                { label: 'Email', name: 'email', type: 'email', value: userData.email },
                                { label: 'Password', name: 'password', type: 'password', value: userData.password },
                                { label: 'Phone', name: 'phone', type: 'text', value: userData.phone },
                                { label: 'Phone 2', name: 'phone2', type: 'text', value: userData.phone2 },
                                { label: 'Address', name: 'address', type: 'text', value: userData.address },
                                { label: 'Pin Code', name: 'pin_code', type: 'text', value: userData.pin_code },
                                { label: 'City', name: 'city', type: 'text', value: userData.city },
                                { label: 'State', name: 'state', type: 'text', value: userData.state },
                                { label: 'Country', name: 'country', type: 'text', value: userData.country },
                            ].map((field) => (
                                <div key={field.name} className="mb-4">
                                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        id={field.name}
                                        name={field.name}
                                        value={field.value}
                                        onChange={handleInputChange}
                                        className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            ))}

                            {/* File Input */}
                            <div className="mb-4">
                                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                                    Profile Picture
                                </label>
                                <input
                                    type="file"
                                    id="file"
                                    onChange={handleFileChange}
                                    className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-6 py-2 bg-teal-600 text-white rounded-md shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                Update User
                            </button>
                        </form>
                        <p className="mt-4">{message}</p>
                        {profilePicUrl && (
                            <div className="mt-4 flex justify-center">
                                <div>
                                    <h2 className="text-xl font-bold mb-2 text-center">Profile Picture</h2>
                                    <img src={profilePicUrl} alt="Profile" className="max-w-xs mx-auto" />
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UpdateUserPage;