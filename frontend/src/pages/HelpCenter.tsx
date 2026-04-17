// src/pages/HelpCenter.tsx

import React from 'react';
import Footer from '../components/guest/Footer';
import MainHeader from '../components/user/MainHeader';

const HelpCenter: React.FC = () => {
  return (
    
    <>
    <MainHeader
          logoText="Furniture Rental"
          onSearch={(query) => console.log("Search query:", query)}
          // onCartClick={() => console.log("Cart clicked")} // Replace with actual cart functionality
          // onProfileClick={() => console.log("Profile clicked")} // Replace with actual profile functionality
          // onLoginClick={() => console.log("Login clicked")} // Dummy handler for login
          // onSignupClick={() => console.log("Signup clicked")} // Dummy handler for signup
      />
    <div className="min-h-screen bg-gray-50 p-8 pt-20">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Help Center</h1>
      
      <div className="max-w-3xl mx-auto text-gray-700">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Our Help Center</h2>
        <p className="mb-4">
          We're here to assist you! Below you will find resources and information to help you with any questions or issues you may have regarding our services.
        </p>

        <h2 className="text-2xl font-semibold mb-4">FAQs</h2>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">1. What is the process to rent furniture?</h3>
          <p>
            To rent furniture, simply browse our catalog, select the items you wish to rent, add them to your cart, and proceed to checkout. You will need to create an account if you haven't already.
          </p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">2. How can I change or cancel my order?</h3>
          <p>
            You can change or cancel your order by logging into your account and navigating to your order history. Follow the instructions provided for making modifications.
          </p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">3. What payment methods do you accept?</h3>
          <p>
            We accept various payment methods, including credit/debit cards and PayPal. Please check the payment options available during checkout.
          </p>
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">4. How is my personal information protected?</h3>
          <p>
            We take your privacy seriously. We use industry-standard encryption and security measures to protect your personal information. Please refer to our <a href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800 transition duration-200">Privacy Policy</a> for more details.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Contact Customer Support</h2>
        <p className="mb-4">
          If you need further assistance, feel free to contact our customer support team. We’re available:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li><strong>Email:</strong> <a href="mailto:support@yourwebsite.com" className="text-blue-600 underline hover:text-blue-800 transition duration-200">support@yourwebsite.com</a></li>
          <li><strong>Phone:</strong> <a href="tel:18001234567" className="text-blue-600 underline hover:text-blue-800 transition duration-200">1-800-123-4567</a></li>
          <li><strong>Live Chat:</strong> Available on our website from 9 AM to 9 PM (EST)</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Support Resources</h2>
        <p className="mb-4">
          Explore our support resources to find guides, tutorials, and troubleshooting tips.
        </p>
        <ul className="list-disc list-inside mb-4">
          <li><a href="/user-guides" className="text-blue-600 underline hover:text-blue-800 transition duration-200">User Guides</a></li>
          <li><a href="/troubleshooting" className="text-blue-600 underline hover:text-blue-800 transition duration-200">Troubleshooting Tips</a></li>
          <li><a href="/terms-and-conditions" className="text-blue-600 underline hover:text-blue-800 transition duration-200">Terms and Conditions</a></li>
          <li><a href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800 transition duration-200">Privacy Policy</a></li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Feedback and Suggestions</h2>
        <p className="mb-4">
          We value your feedback! If you have any suggestions on how we can improve our services, please reach out to us through our <a href="/contact" className="text-blue-600 underline hover:text-blue-800 transition duration-200">Contact Form</a>.
        </p>
      </div>
    </div>

    <Footer/>
    </>
  );
};

export default HelpCenter;
