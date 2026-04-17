import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Header from "../../components/guest/Header";
import Footer from "../../components/guest/Footer";

const About: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
    AOS.refresh();
  }, []);

  return (
    <>
      <Header logotext="Furniture Store" onSearch={() => {}} />
      
      {/* Hero Section with Better Background */}
      <div className="relative bg-cover bg-center py-20" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1567016432779-094069958ea5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
             marginTop: '4rem'
           }}>
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" data-aos="fade-down">About Furniture Haven</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            Crafting beautiful spaces since 2005
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Introduction Section */}
          <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-16" data-aos="fade-up">
            <div className="md:flex">
              <div className="md:w-1/2 bg-cover bg-center" 
                   style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80")', 
                          minHeight: '300px' }}>
              </div>
              <div className="md:w-1/2 p-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Welcome to Furniture Haven</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Where quality meets elegance. We specialize in providing stylish and durable furniture designed to
                  elevate your home and office spaces. Our commitment to excellence and customer satisfaction has made us
                  a trusted name in furniture retail.
                </p>
                <div className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  Explore Our Collections
                </div>
              </div>
            </div>
          </div>

          {/* Our Story Section with improved styling */}
          <div className="mb-16" data-aos="fade-up">
            <h3 className="text-2xl font-semibold text-gray-800 text-center mb-8 relative">
              <span className="relative z-10">Our Story</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-24 bg-blue-500 rounded"></span>
            </h3>
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-blue-500">
              <p className="text-gray-700 leading-relaxed text-lg">
                Founded in 2005 by master craftsman Robert Davis, Furniture Haven began as a small workshop in Portland, Oregon. 
                What started as a passion project soon grew into a beloved furniture brand known for its exceptional quality and designs. 
                With over 18 years of experience, we've expanded to 15 showrooms across the country while maintaining our commitment to 
                craftsmanship, sustainable practices, and customer satisfaction.
              </p>
            </div>
          </div>

          {/* Mission and Values in Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            <div className="bg-white rounded-lg shadow-lg p-8 transform hover:-translate-y-2 transition-transform duration-300" data-aos="fade-right">
              <div className="inline-block p-4 rounded-full bg-blue-100 text-blue-600 mb-4">
                <i className="fas fa-bullseye text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                Our goal is to bring <span className="font-bold">comfort, style, and sustainability</span> to
                every home. We carefully craft our furniture using the finest
                materials to ensure longevity and aesthetic appeal.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 transform hover:-translate-y-2 transition-transform duration-300" data-aos="fade-left">
              <div className="inline-block p-4 rounded-full bg-green-100 text-green-600 mb-4">
                <i className="fas fa-leaf text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Choose Us?</h3>
              <ul className="text-gray-600 space-y-3">
                {[
                  { icon: "fas fa-leaf", text: "Sustainable & Eco-Friendly Materials", color: "text-green-500" },
                  { icon: "fas fa-couch", text: "High-Quality Craftsmanship", color: "text-blue-500" },
                  { icon: "fas fa-shipping-fast", text: "Fast & Reliable Delivery", color: "text-purple-500" },
                  { icon: "fas fa-dollar-sign", text: "Affordable Pricing", color: "text-yellow-500" },
                  { icon: "fas fa-heart", text: "Excellent Customer Support", color: "text-red-500" }
                ].map((item, index) => (
                  <li key={index} className="flex items-center hover:translate-x-1 transition-transform">
                    <i className={`${item.icon} ${item.color} mr-3`}></i> 
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Product Range Section with hover effects */}
          <div className="mb-16" data-aos="fade-up">
            <h3 className="text-2xl font-semibold text-gray-800 text-center mb-8 relative">
              <span className="relative z-10">Our Product Range</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-24 bg-blue-500 rounded"></span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {[
                { title: "Living Room", items: "Sofas, Coffee Tables, TV Units", icon: "fas fa-couch", color: "from-blue-400 to-blue-600" },
                { title: "Bedroom", items: "Beds, Wardrobes, Nightstands", icon: "fas fa-bed", color: "from-purple-400 to-purple-600" },
                { title: "Dining", items: "Tables, Chairs, Sideboards", icon: "fas fa-utensils", color: "from-green-400 to-green-600" },
                { title: "Office", items: "Desks, Chairs, Bookshelves", icon: "fas fa-briefcase", color: "from-yellow-400 to-yellow-600" },
                { title: "Outdoor", items: "Garden Sets, Loungers, Benches", icon: "fas fa-tree", color: "from-teal-400 to-teal-600" },
                { title: "Decor", items: "Lamps, Rugs, Mirrors, Accessories", icon: "fas fa-paint-brush", color: "from-red-400 to-red-600" }
              ].map((category, index) => (
                <div 
                  key={index}
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                  className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow"
                >
                  <div className={`bg-gradient-to-r ${category.color} p-6 text-white group-hover:scale-105 transition-transform`}>
                    <i className={`${category.icon} text-3xl`}></i>
                  </div>
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-800 text-lg">{category.title}</h4>
                    <p className="text-gray-600 mt-2">{category.items}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Our Team Section with improved styling */}
            {/* Meet Our Team Section - Enhanced */}
      <section className="py-16 px-6 sm:px-10 lg:px-20 bg-white">
  <div className="container mx-auto">
    <div className="text-center max-w-3xl mx-auto mb-12">
      <h2
        className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6"
        data-aos="fade-up"
      >
        Meet Our <span className="text-blue-600">Team</span>
      </h2>
      <p 
        className="text-lg text-gray-600"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        The talented individuals who bring our furniture vision to life
      </p>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
              {[
                {
                  name: "Hiren Chaudhari",
                  role: "Founder & CEO",
                  image: "https://i.pinimg.com/736x/c7/58/7e/c7587eec8e58a3eb06f5931d51f6e436.jpg",
                  description:
                    "With over 10 years of experience, Hiren leads the team with innovation and vision. He oversees all aspects of the business to ensure we deliver exceptional value to customers.",
                  social: {
                    linkedin: "#",
                    twitter: "#",
                    email: "hirenchaudharixx3@gmail.com",
                    github: "https://github.com/hirenchaudhari12"
                  }
                },
                {
                  name: "Chaudhari Savan",
                  role: "Design Specialist",
                  image: "https://i.pinimg.com/736x/c0/c9/f0/c0c9f03cfc1aaa0d6e1c24b8e8734384.jpg",
                  description:
                    "Savan creates furniture solutions that blend style with functionality. His designs have won multiple industry awards and are customer favorites.",
                  social: {
                    linkedin: "#",
                    twitter: "#",
                    email: "chaudharisavan1795@gmail.com",
                    github: "https://github.com/savan20"
                  }
                },
                {
                  name: "Agarwal Jay",
                  role: "Customer Support Lead",
                  image: "https://i.pinimg.com/736x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg",
                  description:
                    "jay ensures every customer has an exceptional experience. He leads our support team with a focus on customer satisfaction and service excellence.",
                  social: {
                    linkedin: "#",
                    twitter: "#",
                    email: "agrawaljay247@gmail.com",
                    github: "https://github.com/agrawaljay12"
                  }
                },
              ].map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 pt-10 px-6 pb-6 text-center relative"
                  data-aos="fade-up"
                  data-aos-delay={`${index * 150}`}
                >
                  {/* Profile Image - Centered and Rounded */}
                  <div className="relative mx-auto mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto ring-4 ring-blue-100 shadow-lg">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    
                    {/* Decorative circle background */}
                    <div className="absolute -z-10 w-36 h-36 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                  
                  {/* Member Details */}
                  <h3 className="text-xl font-bold text-blue-600 mb-1">{member.name}</h3>
                  <p className="text-sm font-medium text-gray-600 mb-4">
                    {member.role}
                  </p>
                  
                  {/* Social Links - Always visible */}
                  <div className="flex justify-center space-x-3 mb-4">
                    <a 
                      href={member.social.linkedin} 
                      className="bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                    <a 
                      href={member.social.twitter} 
                      className="bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
                      aria-label="Twitter"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a 
                      href={member.social.github} 
                      className="bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
                      aria-label="GitHub"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a 
                      href={`mailto:${member.social.email}`} 
                      className="bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
                      aria-label="Email"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </a>
                  </div>
                  
                  {/* Description with divider */}
                  <div className="w-16 h-1 bg-blue-100 mx-auto mb-4 rounded-full"></div>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </div>
              ))}
            </div>
  </div>
</section>
          
          {/* Social and Locations */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" data-aos="fade-up">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
              <h3 className="text-2xl font-semibold text-center mb-4">Join Our Community</h3>
              <p className="text-center max-w-2xl mx-auto">
                Stay connected with us on social media for the latest updates, new
                collections, and special discounts!
              </p>
            </div>
            
            <div className="p-8">
              <div className="flex flex-wrap justify-center gap-6 mb-10" data-aos="fade-up">
                {[
                  { icon: "fab fa-facebook-f", name: "Facebook", color: "bg-blue-500" },
                  { icon: "fab fa-instagram", name: "Instagram", color: "bg-pink-500" },
                  { icon: "fab fa-twitter", name: "Twitter", color: "bg-blue-400" }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href="#" 
                    className={`${social.color} text-white px-6 py-3 rounded-full flex items-center hover:opacity-90 transition-opacity`}
                    data-aos="zoom-in"
                    data-aos-delay={index * 100}
                  >
                    <i className={`${social.icon} mr-2`}></i> {social.name}
                  </a>
                ))}
              </div>
              
              {/* Store Locations */}
              <div data-aos="fade-up">
                <h3 className="text-xl font-semibold text-gray-800 text-center mb-6 relative">
                  <span className="relative z-10">Visit Our Showrooms</span>
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-16 bg-blue-500 rounded"></span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                  {[
                    { city: "Portland", address: "1234 Main St, Portland, OR 97205", phone: "(503) 555-1234", icon: "fas fa-map-marker-alt" },
                    { city: "Seattle", address: "567 Pine Ave, Seattle, WA 98101", phone: "(206) 555-5678", icon: "fas fa-map-marker-alt" },
                    { city: "San Francisco", address: "890 Market St, San Francisco, CA 94103", phone: "(415) 555-9012", icon: "fas fa-map-marker-alt" }
                  ].map((location, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-50 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      data-aos="flip-up"
                      data-aos-delay={index * 100}
                    >
                      <div className="flex items-start">
                        <div className="bg-blue-500 text-white p-3 rounded-full mr-4">
                          <i className={location.icon}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{location.city}</h4>
                          <p className="text-gray-600 text-sm mt-1">{location.address}</p>
                          <p className="text-gray-600 text-sm">{location.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
