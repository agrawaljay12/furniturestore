import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMapPin, FiPhone, FiMail, FiSend } from 'react-icons/fi';
import { GiSofa } from 'react-icons/gi';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
          {/* Brand Section */}
          <div>
            <div className="flex items-center justify-center md:justify-start mb-4">
              <GiSofa className="text-yellow-400 text-4xl mr-2" />
              <h2 className="text-3xl font-bold text-yellow-400">
                <span className="tracking-wide">Furniture</span>
                <span className="italic font-light">Store</span>
              </h2>
            </div>
            <p className="text-gray-300 text-sm">
              Discover timeless elegance and comfort with our exclusive furniture collections.
            </p>
            <div className="mt-4 flex justify-center md:justify-start space-x-4">
              {[ 
                { icon: FiFacebook, url: 'https://facebook.com' },
                { icon: FiTwitter, url: 'https://twitter.com' },
                { icon: FiInstagram, url: 'https://instagram.com' },
                { icon: FiLinkedin, url: 'https://linkedin.com' },
              ].map(({ icon: Icon, url }, index) => (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer" 
                   className="text-gray-300 hover:text-yellow-400 transform hover:scale-110 transition duration-300" aria-label={url.split('.')[1]}>
                  <Icon size={22} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-yellow-400 border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              {[ 
                { label: 'About Us', path: '/about-us1' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Terms of Service', path: '/term-condition' },
                // { label: 'Contact Us', path: '/contact' },
                // { label: 'Help Center', path: '#' },
              ].map(({ label, path }, index) => (
                <li key={index}>
                  <Link to={path} className="text-gray-300 hover:text-yellow-300 transition duration-200 text-sm flex items-center">
                    <span className="mr-1">›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-yellow-400 border-b border-gray-700 pb-2">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-center md:justify-start text-gray-300 text-sm">
                <FiMapPin className="mr-2 text-yellow-400" /> 123 Furniture Avenue, Design District
              </li>
              <li className="flex items-center justify-center md:justify-start text-gray-300 text-sm">
                <FiPhone className="mr-2 text-yellow-400" /> +1 (555) 123-4567
              </li>
              <li className="flex items-center justify-center md:justify-start text-gray-300 text-sm">
                <FiMail className="mr-2 text-yellow-400" /> info@furniturestore.com
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-yellow-400 border-b border-gray-700 pb-2">Stay Updated</h3>
            <p className="text-gray-300 text-sm mb-3">Subscribe to receive updates on new collections and special offers.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-700 text-sm px-4 py-2 rounded-l focus:outline-none focus:ring-1 focus:ring-yellow-400 flex-grow"
              />
              <button className="bg-yellow-400 text-gray-900 px-3 rounded-r hover:bg-yellow-300 transition duration-300">
                <FiSend />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Furniture Store. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Crafted for elegance and comfort.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;