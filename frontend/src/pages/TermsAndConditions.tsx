import Header from "../components/guest/Header";
import Footer from "../components/guest/Footer";
import ChatWidget from "../components/ChatAi/ChatWidget";


const TermsAndConditions: React.FC = () => {
  return (
    <>
      <Header
        logotext="Furniture Rental"
        onSearch={(query) => console.log("Search query:", query)}
      />
      <div className="min-h-screen bg-gray-50 p-8 pt-20"> 
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Terms and Conditions</h1>
        
        <div className="max-w-3xl mx-auto text-gray-700">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to our website! These Terms and Conditions govern your use of our services and website. By accessing or using our services, you agree to comply with these terms. If you do not agree with any part of these terms, you must not use our services.
          </p>

          <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
          <p className="mb-4">
            In these Terms and Conditions, the following definitions apply:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li><strong>“Service”</strong> refers to the services provided by our website.</li>
            <li><strong>“User”</strong> refers to any individual who accesses our website or uses our services.</li>
            <li><strong>“Content”</strong> refers to any text, graphics, images, or other materials that are part of our services.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">3. User Obligations</h2>
          <p className="mb-4">
            As a user of our services, you agree to:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Provide accurate, current, and complete information.</li>
            <li>Maintain the security and confidentiality of your account.</li>
            <li>Be responsible for all activities that occur under your account.</li>
            <li>Notify us immediately of any unauthorized use of your account.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
          <p className="mb-4">
            All content included in our services, including text, graphics, logos, and software, is the property of our company or our licensors and is protected by intellectual property laws. You may not use, reproduce, or distribute any content without our express written consent.
          </p>

          <h2 className="text-2xl font-semibold mb-4">5. Termination</h2>
          <p className="mb-4">
            We reserve the right to suspend or terminate your access to our services at any time, without notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users of our services, us, or third parties, or for any other reason.
          </p>

          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p className="mb-4">
            To the fullest extent permitted by law, our company shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our services.
          </p>

          <h2 className="text-2xl font-semibold mb-4">7. Indemnification</h2>
          <p className="mb-4">
            You agree to indemnify, defend, and hold harmless our company, its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses arising out of or related to your use of our services or violation of these Terms and Conditions.
          </p>

          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p className="mb-4">
            We may update these Terms and Conditions from time to time. We will notify you of any changes by posting the new Terms and Conditions on this page. You are advised to review these Terms periodically for any changes.
          </p>

          <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms and Conditions, please contact us at [Your Contact Information].
          </p>
        </div>
      </div>
      {/* ChatWidget */}
      <ChatWidget currentSystemMessage="Welcome to our furniture store! I can help you find the perfect furniture for your home or assist you with any questions you may have." />
      <Footer />
    </>
  );
};

export default TermsAndConditions;