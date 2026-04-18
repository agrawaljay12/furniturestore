import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCity, 
  FaCamera, 
  FaUserCircle, 
  FaEye, 
  FaEyeSlash, 
  FaArrowRight,
  FaAddressCard,
  FaMapPin,
  FaGlobe
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    phone2: '',
    address: '',
    pin_code: '',
    state: '',
    city: '',
    country: '',
    type: 'user',
    profile_picture: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  const validatePhone = (phone: string) => /^\d{10}$/.test(phone);
  const validatePinCode = (pin_code: string) => /^\d{6}$/.test(pin_code);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setFileError('');
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setFileError('Only JPG, JPEG, and PNG files are allowed');
        e.target.value = '';
        return;
      }
      setFileName(file.name);
      setFormData({ ...formData, profile_picture: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const submitSignup = async () => {
     
    const bodyContent = new FormData();

    bodyContent.append("first_name", formData.first_name);
    bodyContent.append("last_name", formData.last_name);
    bodyContent.append("email", formData.email);
    bodyContent.append("password", formData.password);
    bodyContent.append("phone", formData.phone);
    bodyContent.append("phone2", formData.phone2 || "");
    bodyContent.append("address", formData.address);
    bodyContent.append("pin_code", formData.pin_code);
    bodyContent.append("state", formData.state);
    bodyContent.append("city", formData.city);
    bodyContent.append("country", formData.country);
    bodyContent.append("type", formData.type);

    if (formData.profile_picture) {
      bodyContent.append("file", formData.profile_picture);
    }


    try {
      const response = await fetch("https://furnspace.onrender.com/api/v1/auth/user/create", {
        method: "POST",
        body: bodyContent,
      });
      const data = await response.json();
      if (response.ok) {
        console.log('FormData:', formData);
        console.log('Response Data:', data);
        setSuccessMessage("Signup successful! Redirecting to login...");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        console.error('Error Response:', response.status, data);
        setErrors({ general: data.detail || "Signup failed. Please try again." });
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setErrors({ general: "Network error. Please try again." });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const newErrors: { [key: string]: string } = {};
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!validatePhone(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (formData.phone2 && !validatePhone(formData.phone2)) newErrors.phone2 = 'Phone number must be 10 digits';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!validatePinCode(formData.pin_code)) newErrors.pin_code = 'Pincode must be 6 digits';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.country) newErrors.country = 'Country is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      submitSignup();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-cyan-50 to-blue-100 pt-12 py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-teal-300/30 to-cyan-300/30 blur-xl"
          initial={{ x: -100, y: -100 }}
          animate={{ 
            x: [-100, 50, -100],
            y: [-100, 100, -100],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute left-1/3 top-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-blue-300/20 to-purple-200/20 blur-xl"
          initial={{ x: 0, y: 0 }}
          animate={{ 
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute right-20 bottom-20 w-96 h-96 rounded-full bg-gradient-to-r from-blue-300/20 to-teal-200/20 blur-xl"
          initial={{ x: 100, y: 100 }}
          animate={{ 
            x: [100, -50, 100],
            y: [100, -50, 100],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 25,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-4xl border border-gray-100 relative z-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-center mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">Create Account</span>
          </h2>
          <div className="h-1 w-80 bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-3">Complete your details to get started</p>
        </div>
        
        <div className="flex justify-center mb-8">
          <div 
            className="relative cursor-pointer group"
            onClick={triggerFileInput}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-500 flex items-center justify-center bg-gray-100 shadow-lg group-hover:shadow-xl transition-all duration-300">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <FaUserCircle className="w-full h-full text-gray-400" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <FaCamera className="text-white text-2xl animate-pulse" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-center mt-2 text-gray-600">Click to upload profile picture</p>
            {fileName && (
              <p className="text-xs text-center mt-1 text-teal-600 font-medium truncate max-w-[200px] mx-auto">
                {fileName}
              </p>
            )}
            {fileError && (
              <p className="text-xs text-center mt-1 text-red-500">
                {fileError}
              </p>
            )}
          </div>
        </div>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full text-teal-600 group-focus-within:text-teal-700 transition-all duration-300 z-10">

                <FaUser className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
                required
              />
              {errors.first_name && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.first_name}</p>}
            </div>
            <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full text-teal-600 group-focus-within:text-teal-700 transition-all duration-300 z-10">

                <FaUser className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
                required
              />
              {errors.last_name && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.last_name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full text-teal-600 group-focus-within:text-teal-700 transition-all duration-300 z-10">
                <FaEnvelope className="h-4 w-4" />
              </div>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.email}</p>}
            </div>
            <div className="relative group">
              <div className="flex items-center relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full text-teal-600 group-focus-within:text-teal-700 transition-all duration-300 z-10">
                  <FaLock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
                  required
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-600 hover:text-teal-700 transition-colors duration-200 focus:outline-none bg-white/80 p-1 rounded-full"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.password}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="relative group">
              <div className="flex items-center relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full text-teal-600 group-focus-within:text-teal-700 transition-all duration-300 z-10">
                  <FaLock className="h-4 w-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
                  required
                />
                <button 
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-600 hover:text-teal-700 transition-colors duration-200 focus:outline-none bg-white/80 p-1 rounded-full"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.confirmPassword}</p>}
            </div>
            <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full text-teal-600 group-focus-within:text-teal-700 transition-all duration-300 z-10">
                <FaPhone className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
                required
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full text-teal-600 group-focus-within:text-teal-700 transition-all duration-300 z-10">
                <FaPhone className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Secondary Phone"
                name="phone2"
                value={formData.phone2}
                onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
              />
              {errors.phone2 && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.phone2}</p>}
            </div>
            <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full text-teal-600 group-focus-within:text-teal-700 transition-all duration-300 z-10">
                <FaAddressCard className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Address"
                name="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
                required
              />
              {errors.address && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.address}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full text-teal-600 group-focus-within:text-teal-700 transition-all duration-300 z-10">
                <FaMapPin className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Pincode"
                name="pin_code"
                value={formData.pin_code}
                onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })}
                className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
                required
              />
              {errors.pin_code && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.pin_code}</p>}
            </div>
            <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full text-teal-600 group-focus-within:text-teal-700 transition-all duration-300 z-10">

                <FaMapMarkerAlt className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="State"
                name="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
                required
              />
              {errors.state && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.state}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full text-teal-600 group-focus-within:text-teal-700 transition-all duration-300 z-10">

                <FaCity className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="City"
                name="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
                required
              />
              {errors.city && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.city}</p>}
            </div>
            <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full text-teal-600 group-focus-within:text-teal-700 transition-all duration-300 z-10">

                <FaGlobe className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Country"
                name="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
                required
              />
              {errors.country && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.country}</p>}
            </div>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {errors.general}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 rounded-lg mt-6 font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 overflow-hidden relative hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <span className="relative z-10 flex items-center justify-center">
              Sign Up <FaArrowRight className="ml-2 h-4 w-4" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 z-0 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <div className="mt-8 text-center">
            <div className="mb-4 pb-2 border-b border-gray-200"></div>
            
            <div className="flex justify-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center group">
                  Login
                  <FaArrowRight className="ml-1 h-3 w-3 transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;