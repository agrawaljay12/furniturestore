import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaAward, FaUsers, FaHandshake, FaHeart } from "react-icons/fa";
// import MainHeader from "../../components/user/MainHeader";
// import MainFooter from "../../components/user/MainFooter";



const AboutUs: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: false,
      mirror: true,
    });
  }, []);

  // Function to handle search queries from header
  // const handleSearch = (query: string) => {
  //   console.log('Search query:', query);
  //   // Implement search functionality here
  // };

  return (
    <>
      {/* <MainHeader logoText="Furniture Store" onSearch={handleSearch} /> */}
      
      <main className="bg-white min-h-screen pt-24">
        {/* Hero Section */}
        {/* Hero Section - Enhanced with better animations and styling */}
        <section className="relative py-28 sm:py-36 overflow-hidden">
          {/* Animated background layers */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white opacity-80"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-20 motion-safe:animate-subtle-zoom"></div>
            {/* Decorative elements */}
            <div className="absolute top-24 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-24 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span 
                className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium tracking-wider mb-6 transform transition-all duration-500 hover:scale-105 hover:shadow-md"
                data-aos="fade-down"
                data-aos-delay="100"
              >
                ABOUT OUR COMPANY
              </span>
              
              <h1 
                className="text-4xl sm:text-6xl font-extrabold mb-6 text-gray-800 relative inline-block"
                data-aos="fade-down"
                data-aos-delay="200"
              >
                About Our <span className="text-blue-600 relative">
                  Company
                  <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </span>
                
                {/* Animated decorative elements */}
                <span className="absolute -top-6 -right-8 text-7xl text-yellow-400 opacity-20 pointer-events-none">∙</span>
                <span className="absolute -bottom-4 -left-8 text-7xl text-blue-400 opacity-20 pointer-events-none">∙</span>
              </h1>
              
              <p 
                className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                We're on a mission to <span className="text-blue-600 font-medium">transform spaces</span> with beautiful, functional furniture that meets your unique needs
              </p>
              
              {/* Animated arrow */}
              <div 
                className="mt-12 animate-bounce"
                data-aos="fade-up"
                data-aos-delay="800"
              >
                <svg className="w-10 h-10 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section - Enhanced with better animations and styling */}
        <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-20 bg-white relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full opacity-50 -translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full opacity-50 translate-x-1/4 translate-y-1/4"></div>
          
          <div className="container mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              <div
                className="w-full lg:w-1/2 relative group"
                data-aos="fade-right"
                data-aos-duration="1200"
              >
                {/* Main image with enhanced effects */}
                <div className="overflow-hidden rounded-xl shadow-xl transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                  <img
                    src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2070&auto=format&fit=crop"
                    alt="Our Workshop"
                    className="w-full h-auto object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
                  />
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-24 h-24 border-t-4 border-l-4 border-blue-400 rounded-tl-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 border-b-4 border-r-4 border-yellow-400 rounded-br-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
              </div>
              
              <div
                className="w-full lg:w-1/2"
                data-aos="fade-left"
                data-aos-duration="1200"
              >
                <div className="relative">
                  {/* Section label */}
                  <span className="text-sm font-semibold text-blue-600 tracking-wider mb-4 block" data-aos="fade-down" data-aos-delay="200">OUR JOURNEY</span>
                  
                  {/* Section title with animated underline */}
                  <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 mb-8 relative inline-block group" data-aos="fade-up" data-aos-delay="300">
                    Our <span className="text-blue-600">Story</span>
                    <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-yellow-400 transform origin-left transition-transform duration-500 group-hover:w-full"></span>
                  </h2>
                </div>
                
                <p className="text-lg leading-relaxed text-gray-700 mb-8" data-aos="fade-up" data-aos-delay="400">
                  At <span className="font-semibold text-blue-600">Furniture Store</span>,
                  we believe that furniture should be as dynamic and versatile as
                  the people who use it. Founded in 2015, our journey began with a simple idea: 
                  to make high-quality furniture accessible to everyone through both purchase and rental options.
                </p>
                
                <p className="text-lg leading-relaxed text-gray-700 mb-12" data-aos="fade-up" data-aos-delay="500">
                  What started as a small workshop with three passionate designers has grown into 
                  a thriving business serving thousands of customers across the country. Our commitment 
                  to quality craftsmanship, sustainable materials, and customer satisfaction has remained 
                  unwavering throughout our growth.
                </p>
                
                {/* Experience indicator with improved styling and animation */}
                <div 
                  className="bg-gray-50 rounded-xl p-6 shadow-sm flex items-center space-x-6 transform transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
                  data-aos="zoom-in"
                  data-aos-delay="600"
                >
                  <div className="flex flex-col items-center justify-center bg-blue-50 rounded-full w-24 h-24 relative overflow-hidden">
                    <span className="text-5xl font-bold text-blue-600 animate-pulse">8+</span>
                    <span className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-yellow-200 to-transparent opacity-40"></span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-1">Years of Excellence</h4>
                    <p className="text-gray-600">Delivering quality furniture and exceptional service since 2015</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 
                className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6"
                data-aos="fade-up"
              >
                Our <span className="text-blue-600">Values</span>
              </h2>
              <p 
                className="text-lg text-gray-600"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                These core principles guide everything we do, from designing new pieces to providing exceptional service
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <FaAward className="text-blue-600" size={36} />,
                  title: "Quality",
                  description: "We never compromise on materials or craftsmanship. Every piece is built to last."
                },
                {
                  icon: <FaUsers className="text-blue-600" size={36} />,
                  title: "Accessibility",
                  description: "Through purchase and rental options, we make great furniture available to everyone."
                },
                {
                  icon: <FaHandshake className="text-blue-600" size={36} />,
                  title: "Integrity",
                  description: "Honesty and transparency are at the heart of our business relationships."
                },
                {
                  icon: <FaHeart className="text-blue-600" size={36} />,
                  title: "Sustainability",
                  description: "We're committed to environmentally responsible manufacturing practices."
                }
              ].map((value, index) => (
                <div 
                  key={index}
                  className="bg-white p-8 rounded-lg shadow-md text-center"
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                >
                  <div className="mb-4 flex justify-center">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
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
        
        {/* Join Us CTA */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 
              className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6"
              data-aos="fade-up"
            >
              Ready to Transform Your Space?
            </h2>
            <p 
              className="text-lg text-gray-600 mb-8"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Browse our collection and find the perfect furniture pieces for your home, office, or special event.
            </p>
            <div 
              className="flex flex-wrap justify-center gap-4"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <button 
                onClick={() => window.location.href = "/shop"}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105 shadow-md"
              >
                Explore Our Collection
              </button>
              <button 
                onClick={() => window.location.href = "/contact"}
                className="bg-yellow-400 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition transform hover:scale-105 shadow-md"
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>
        
        {/* Customer Satisfaction Section */}
        {/* <section className="py-16 bg-white-600 text-white">
          ...existing code...
        </section> */}
      </main>
      
      {/* <MainFooter /> */}
    </>
  );
};

export default AboutUs;
