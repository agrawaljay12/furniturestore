import React, { useEffect, useState } from "react";
import Header from "../../components/guest/Header";
import AboutUs from "../user/AboutUs";
import Footer from "../../components/guest/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import ChatWidget from "../../components/ChatAi/ChatWidget";

interface FurnitureItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const HomePage: React.FC = () => {
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([]);

  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: "ease-in-out",
      once: false,
      mirror: true,
      anchorPlacement: 'top-bottom',
    });

    const fetchFurnitureItems = async () => {
      try {
        const response = await axios.get("https://furnspace.onrender.com/api/v1/furniture/list_all");
        setFurnitureItems(response.data);
      } catch (error) {
        console.error("Error fetching furniture items:", error);
      }
    };

    fetchFurnitureItems();
  }, []);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans text-gray-800 overflow-x-hidden">
      {/* Header */}
      <Header logotext={"Furniture Store"} onSearch={(query) => console.log(query)} />

      {/* Main Content */}
      <main>
        {/* Hero Section - Keeping original background image */}
        <section
          className="relative bg-cover bg-center bg-no-repeat text-white py-32 sm:py-48 lg:py-64 px-4 sm:px-6 text-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          <div className="relative z-10 max-w-5xl mx-auto">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight"
              data-aos="fade-down"
              data-aos-delay="200"
            >
              Welcome to Your Complete <span className="text-yellow-400 inline-block" data-aos="zoom-in" data-aos-delay="600">Furniture Solution</span>
            </h1>
            <p
              className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              Discover, rent, or purchase premium furniture for your home, office, and special events.
              Quality craftsmanship and timeless designs to transform any space.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <button
                onClick={() => (window.location.href = "/login")}
                className="bg-yellow-400 text-gray-800 py-3 sm:py-4 px-8 sm:px-10 rounded-full font-semibold shadow-lg hover:bg-yellow-500 transition duration-300 transform hover:scale-105 hover:shadow-xl"
                data-aos="fade-right"
                data-aos-delay="600"
              >
                Sign In
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("about-us-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-white text-blue-600 py-3 sm:py-4 px-8 sm:px-10 rounded-full font-semibold shadow-lg hover:bg-blue-100 transition duration-300 transform hover:scale-105 hover:shadow-xl"
                data-aos="fade-left"
                data-aos-delay="600"
              >
                About Us
              </button>
            </div>
          </div>
        </section>

       {/* Website Introduction Section */}
<section className="py-24 sm:py-32 px-6 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
  {/* Decorative elements */}
  <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2" data-aos="fade" data-aos-delay="100"></div>
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-30 translate-x-1/3 translate-y-1/3" data-aos="fade" data-aos-delay="200"></div>
  
  <div className="container mx-auto relative z-10">
    <div className="flex flex-col items-center mb-16">
      <div className="w-24 h-2 bg-blue-600 rounded-full mb-8" data-aos="zoom-in"></div>
      <h2
        className="text-3xl sm:text-5xl font-bold text-center text-gray-800 mb-4"
        data-aos="fade-up"
      >
        Your One-Stop <span className="text-blue-600 relative">
          Furniture Destination
          <span className="absolute -bottom-2 left-0 w-full h-1 bg-yellow-400 transform"></span>
        </span>
      </h2>
      <p className="text-lg text-gray-600 text-center max-w-2xl" data-aos="fade-up" data-aos-delay="300">
        Everything you need to transform your space into a beautiful home
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
      <div className="group" data-aos="fade-right" data-aos-duration="1000">
        <p className="text-lg mb-6 text-gray-700 leading-relaxed">
          Our furniture store offers a comprehensive solution for all your furniture needs. Whether you're looking to furnish a new home, redecorate your space, or find pieces for a special event, we've got you covered.
        </p>
        <p className="text-xl font-medium mb-5 text-blue-800">
          We pride ourselves on offering:
        </p>
        <ul className="mb-10 space-y-4">
          {[
            "A vast selection of high-quality furniture pieces",
            "Flexible rental options for temporary needs",
            "Competitive pricing and financing plans",
            "Expert design consultation to help you make the right choice"
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-3 group" data-aos="fade-up" data-aos-delay={150 + (index * 100)}>
              <span className="bg-blue-100 text-blue-600 p-1 rounded-full mt-1 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-lg text-gray-700 group-hover:text-blue-800 transition-colors duration-300">{item}</span>
            </li>
          ))}
        </ul>
        <button 
          className="bg-blue-600 text-white px-10 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center gap-2 group"
          onClick={() => (window.location.href = "/signup")}
          data-aos="fade-up" 
          data-aos-delay="600"
        >
          <span>Create an Account</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-6 relative" data-aos="fade-left" data-aos-duration="1000">
        {[
          {
            url: "https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?q=80&w=1974&auto=format&fit=crop",
            alt: "Living Room Furniture",
            position: "top-left"
          },
          {
            url: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1992&auto=format&fit=crop",
            alt: "Dining Set",
            position: "top-right"
          },
          {
            url: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=2070&auto=format&fit=crop",
            alt: "Bedroom Furniture",
            position: "bottom-left"
          },
          {
            url: "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=2009&auto=format&fit=crop",
            alt: "Office Furniture",
            position: "bottom-right"
          }
        ].map((image, index) => (
          <div 
            key={index} 
            className={`rounded-xl overflow-hidden shadow-lg group relative ${
              image.position === "top-left" ? "animate-float-slow" :
              image.position === "top-right" ? "animate-float-slower" :
              image.position === "bottom-left" ? "animate-float-slowest" :
              "animate-float-slower"
            }`}
            data-aos="zoom-in" 
            data-aos-delay={150 + (index * 100)}
          >
            <img 
              src={image.url} 
              alt={image.alt} 
              className="w-full h-64 object-cover transform transition-all duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-blue-900 bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
              <p className="text-white font-medium text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                {image.alt}
              </p>
            </div>
          </div>
        ))}
        
        {/* Decorative animation element */}
        <div className="absolute -top-8 -left-8 w-16 h-16 border-t-4 border-l-4 border-blue-400 rounded-tl-lg opacity-70"></div>
        <div className="absolute -bottom-8 -right-8 w-16 h-16 border-b-4 border-r-4 border-blue-400 rounded-br-lg opacity-70"></div>
      </div>
    </div>
  </div>
</section>

{/* How it Works Section */}
<section className="py-24 sm:py-32 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
  <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-50 rounded-full blur-2xl opacity-60"></div>
  
  <div className="container mx-auto px-6 relative z-10">
    <div className="flex flex-col items-center mb-20">
      <span className="text-blue-600 text-lg font-medium tracking-wider mb-4" data-aos="fade-up">SIMPLE PROCESS</span>
      <h2 
        className="text-3xl sm:text-5xl font-extrabold text-center text-gray-900 mb-6"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        How Our <span className="text-blue-600 relative inline-block">
          Platform Works
          <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 3C50 1 150 5 200 3" stroke="#FCD34D" strokeWidth="6" strokeLinecap="round"/>
          </svg>
        </span>
      </h2>
      <p className="text-gray-600 text-lg text-center max-w-2xl" data-aos="fade-up" data-aos-delay="200">
        Getting started with our furniture service is easy and straightforward
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
      {/* Process connection line */}
      <div className="hidden md:block absolute top-24 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
      
      {[
        {
          step: "1",
          title: "Browse & Select",
          description: "Create an account and explore our extensive catalog of furniture items for every room and purpose.",
          icon: "🔍",
          color: "from-blue-400 to-blue-600"
        },
        {
          step: "2",
          title: "Purchase or Rent",
          description: "Choose to buy outright or select from our flexible rental plans based on your needs.",
          icon: "💳",
          color: "from-indigo-400 to-indigo-600"
        },
        {
          step: "3",
          title: "Delivery & Setup",
          description: "We'll deliver your furniture and provide professional assembly at your location.",
          icon: "🚚",
          color: "from-purple-400 to-purple-600"
        }
      ].map((step, index) => (
        <div 
          key={index}
          className="relative text-center"
          data-aos="fade-up"
          data-aos-delay={index * 200}
        >
          {/* Step indicator */}
          <div className="relative z-10 mb-12">
            <div className={`bg-gradient-to-br ${step.color} text-white w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto shadow-lg transform transition-all duration-500 hover:scale-110 hover:rotate-3 hover:shadow-xl`}>
              {step.step}
            </div>
            <div className="absolute -inset-2 bg-white rounded-full opacity-20 animate-pulse"></div>
          </div>
          
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute -right-20 -bottom-20 w-40 h-40 rounded-full bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Icon */}
            <div className="relative text-6xl mb-6 mx-auto transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
              {step.icon}
            </div>
            
            {/* Content */}
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{step.title}</h3>
            <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{step.description}</p>
            
            {/* Learn more link */}
            <div className="mt-6 pt-4 border-t border-gray-100 group-hover:border-blue-100 transition-colors duration-300">
              <a href="#" className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                <span>Learn more</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

        {/* Featured Products with Login Requirement */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 
              className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8"
              data-aos="fade-up"
            >
              <span className="text-blue-600">Featured</span> Furniture
            </h2>
            <p 
              className="text-center text-gray-600 mb-12 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Here's a preview of our exclusive furniture collection. Sign in to view details, prices, and to make purchases.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(furnitureItems.length > 0 ? furnitureItems.slice(0, 4) : [
                {
                  id: "preview1",
                  name: "Modern Sofa",
                  description: "Elegant three-seater with premium fabric",
                  price: 899.99,
                  imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop"
                },
                {
                  id: "preview2",
                  name: "Office Desk",
                  description: "Spacious workspace with storage",
                  price: 349.99,
                  imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=2036&auto=format&fit=crop"
                },
                {
                  id: "preview3",
                  name: "Dining Set",
                  description: "Six-seater table with matching chairs",
                  price: 1299.99,
                  imageUrl: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=1935&auto=format&fit=crop"
                },
                {
                  id: "preview4",
                  name: "Bedroom Suite",
                  description: "Complete bedroom furniture set",
                  price: 2499.99,
                  imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2070&auto=format&fit=crop"
                }
              ]).map((item, index) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="relative h-56 overflow-hidden group">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <div className="text-white text-center px-4">
                        <p className="font-medium">Sign in to view details</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-gray-400">Price:</span>
                        <span className="ml-2 font-semibold">Login to view</span>
                      </div>
                      <button 
                        onClick={() => window.location.href = "/login"}
                        className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full hover:bg-blue-700 transition duration-300"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button 
                onClick={() => window.location.href = "/login"}
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                data-aos="zoom-in"
              >
                Sign In to See All Products
              </button>
            </div>
          </div>
        </section>

        {/* About Us - Kept as requested */}
        <section id="about-us-section" className="bg-white">
          <AboutUs />
        </section>
        {/* ChatWidget */}
        <ChatWidget currentSystemMessage="Welcome to our furniture store! I can help you find the perfect furniture for your home or assist you with any questions you may have." />

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default HomePage;
