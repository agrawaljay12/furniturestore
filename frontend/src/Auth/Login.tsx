import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaLock, 
  FaExclamationTriangle, 
  FaExclamationCircle, 
  FaCheckCircle,
  FaSignInAlt,
  FaArrowRight
} from 'react-icons/fa';
import { BsX } from 'react-icons/bs';
import useActivityLogger from '../pages/user/UserActivity';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const navigate = useNavigate();
  const logUserActivity = useActivityLogger();

  useEffect(() => {
    const storedAttempts = localStorage.getItem(`failedAttempts_${email}`);
    if (storedAttempts && email) {
      setFailedAttempts(parseInt(storedAttempts, 10));
    }
  }, [email]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const newErrors: { [key: string]: string } = {};
    if (!validateEmail(email)) newErrors.email = 'Invalid email format';
    if (!validatePassword(password)) {
      newErrors.password =
        'Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        const banResponse = await fetch('https://furnspace.onrender.com/api/v1/banned/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const banData = await banResponse.json();
        if (banResponse.ok && banData.data === true) {
          setErrors({ general: 'Your account has been banned. Please contact support.' });
          return;
        }

        const response = await fetch('https://furnspace.onrender.com/api/v1/auth/user/login', {
          method: 'POST',
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
          setFailedAttempts(0);
          localStorage.removeItem(`failedAttempts_${email}`);
          
          localStorage.setItem('token', data.data.user_id);
          localStorage.setItem('user_role', data.data.user_type);
          localStorage.setItem('email', data.data.email);
          alert(data.data.message || 'Login successful');

          if (data.data.user_type === 'user') {
            logUserActivity("User logged in");
          }

          switch (data.data.user_type) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'user':
              navigate('/buy');
              break;
            case 'moderator':
              navigate('/superadmin/dashboard');
              break;
            case 'retailer':
              navigate('/retailer/dashboard');
              break;
            case 'deliveryboy':
              navigate('/deliveryboy/dashboard');
              break;
            default:
              navigate('/login');
          }
        } else {
          const newFailedAttempts = failedAttempts + 1;
          setFailedAttempts(newFailedAttempts);
          localStorage.setItem(`failedAttempts_${email}`, newFailedAttempts.toString());
          
          if (newFailedAttempts >= 3 && data.data?.user_type === 'user') {
            logUserActivity(`Failed login attempt (${newFailedAttempts}) for user: ${email}`);
            
            try {
              await fetch('https://furnspace.onrender.com/api/v1/activity/log', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: email,
                  activity: `Multiple failed login attempts (${newFailedAttempts})`,
                  severity: 'warning',
                  user_type: 'user'
                }),
              });
            } catch (logError) {
              console.error("Could not log failed attempts to server:", logError);
            }
          }
          
          setErrors({ general: data.detail || 'An error occurred. Please try again.' });
        }
      } catch (error) {
        setErrors({ general: 'Network error. Please try again.' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-cyan-50 to-blue-100 pt-24 py-16 px-4 relative overflow-hidden">
      {/* Enhanced background with more vibrant animated elements */}
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
        {/* Small decorative elements */}
        <motion.div 
          className="absolute top-1/2 left-1/4 w-6 h-6 rounded-full bg-cyan-400/30 blur-sm"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.7, 0.3, 0.7]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-4 h-4 rounded-full bg-teal-400/30 blur-sm"
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.6, 0.2, 0.6]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 2.5,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <motion.div 
        className="bg-white/95 backdrop-blur-md p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-md border border-gray-100 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-center mb-2"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">Welcome Back</span>
          </motion.h2>
          <motion.div 
            className="h-1 w-0 bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          />
          <motion.p 
            className="text-gray-500 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Sign in to continue to your account
          </motion.p>
        </motion.div>
        
        {failedAttempts >= 3 && (
          <motion.div 
            className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-r-md"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <p className="font-medium flex items-center">
              <FaExclamationTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Multiple failed login attempts detected
            </p>
            <p className="text-sm mt-1 ml-7">Please make sure you are using the correct credentials.</p>
            <p className="text-sm ml-7">If you continue to have issues, please contact support.</p>
          </motion.div>
        )}
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-all duration-300 z-10">
              <div className="flex items-center justify-center w-5 h-5">
                <FaEnvelope className="h-5 w-5" />
              </div>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1.5 ml-1 flex items-center">
                <FaExclamationCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>
          
          <div className="relative group mb-1">
            <div className="flex items-center relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-all duration-300 z-10">
                <div className="flex items-center justify-center w-5 h-5">
                  <FaLock className="h-5 w-5" />
                </div>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 hover:border-teal-300 bg-white/90 backdrop-blur-sm shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600 transition-colors duration-200 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1.5 ml-1 flex items-center">
                <FaExclamationCircle className="h-4 w-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>
          
          {errors.general && (
            <motion.div 
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, x: [10, -10, 8, -8, 6, -6, 4, -4, 2, -2, 0] }}
              transition={{ duration: 0.5 }}
            >
              <BsX className="h-5 w-5 mr-2 text-red-500" />
              {errors.general}
            </motion.div>
          )}
          
          {successMessage && (
            <motion.div 
              className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <FaCheckCircle className="h-5 w-5 mr-2 text-green-500" />
              {successMessage}
            </motion.div>
          )}
          
          <motion.button 
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 rounded-lg mt-6 font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 overflow-hidden relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center justify-center">
              <FaSignInAlt className="mr-2" />
              Login
            </span>
            <motion.span 
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 z-0"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </motion.button>
          
          {/* <motion.div 
            className="mt-8 grid grid-cols-3 items-center text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <hr className="border-gray-300" />
            <p className="text-center text-sm">Or continue with</p>
            <hr className="border-gray-300" />
          </motion.div> */}
          
          <motion.div 
            className="flex space-x-4 mt-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {/* <motion.button
              type="button"
              className="flex items-center justify-center p-3 rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGoogle className="text-[#EA4335]" />
            </motion.button> */}
            {/* <motion.button
              type="button"
              className="flex items-center justify-center p-3 rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFacebookF className="text-[#1877F2]" />
            </motion.button> */}
            {/* <motion.button
              type="button"
              className="flex items-center justify-center p-3 rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGooglePlus className="text-black" />
            </motion.button> */}
          </motion.div>
          
          <div className="mt-8 text-center">
            <div className="mb-4 pb-2 border-b border-gray-200"></div>
            
            <div className="flex flex-col gap-3">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center group">
                  Sign up
                  <FaArrowRight className="ml-1 h-3 w-3 transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </p>
              
              <p className="text-gray-600">
                Forgot your password?{' '}
                <Link to="/forgot-password" className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center group">
                  Reset it here
                  <FaArrowRight className="ml-1 h-3 w-3 transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </p>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;