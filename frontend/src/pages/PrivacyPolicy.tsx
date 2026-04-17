import Header from "../components/guest/Header";
import Footer from "../components/guest/Footer";
import ChatWidget from "../components/ChatAi/ChatWidget";


const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Header
        logotext="Furniture Rental"
        onSearch={(query) => console.log("Search query:", query)}
      />
      <div className="min-h-screen bg-gray-50 p-8 pt-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Privacy Policy</h1>
        
        <div className="max-w-3xl mx-auto text-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            At [Your Company Name], we are committed to protecting your privacy and ensuring the security of your personal information. This privacy policy outlines our practices regarding the collection, use, and disclosure of your information when you visit our website or use our services.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">
            We may collect various types of personal information from you, including but not limited to:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Payment information</li>
            <li>Mailing address</li>
            <li>IP address and usage data</li>
          </ul>
          <p className="mb-4">
            This information is collected when you register for an account, make a rental, or interact with our website.
          </p>

          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            We use your information for the following purposes:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>To provide, maintain, and improve our services</li>
            <li>To process your transactions and manage your orders</li>
            <li>To communicate with you regarding your account or transactions</li>
            <li>To send promotional materials and offers (you can opt out at any time)</li>
            <li>To comply with legal obligations and protect our rights</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Disclosure of Your Information</h2>
          <p className="mb-4">
            We may share your information in the following situations:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>With service providers who assist us in providing our services</li>
            <li>With third-party vendors for payment processing and transaction fulfillment</li>
            <li>To comply with applicable laws and regulations</li>
            <li>To protect the rights and safety of our company and users</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Security of Your Information</h2>
          <p className="mb-4">
            We implement a variety of security measures to safeguard your personal information. These measures include encryption, firewalls, and secure server hosting to prevent unauthorized access, use, or disclosure of your data.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>The right to access and receive a copy of your personal information</li>
            <li>The right to correct any inaccuracies in your data</li>
            <li>The right to request the deletion of your personal information</li>
            <li>The right to object to or restrict the processing of your data</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, please contact us using the information provided below.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update our privacy policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any significant changes by posting the new privacy policy on this page. Your continued use of our services after such changes will constitute your acknowledgment of the modifications and your consent to abide by and be bound by the modified policy.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions or concerns about this privacy policy, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> [Your Email Address]<br />
            <strong>Phone:</strong> [Your Phone Number]<br />
            <strong>Address:</strong> [Your Company Address]
          </p>
        </div>
      </div>
      {/* ChatWidget */}
      <ChatWidget currentSystemMessage="Welcome to our furniture store! I can help you find the perfect furniture for your home or assist you with any questions you may have." />
      <Footer />
    </>
  );
};

export default PrivacyPolicy;