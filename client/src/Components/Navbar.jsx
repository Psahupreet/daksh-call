import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { FiUser } from "react-icons/fi";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Navbar() {
  const { cartItems } = useContext(CartContext);
  const { isAuthenticated, logout, user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useState(user?.location || "Detecting...");
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !user?.location) {
      setIsLocationLoading(true);
      navigator.geolocation?.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const address = data?.display_name?.split(",")[0] || "Your Location";
            setLocation(address);
            await axios.put(
              `${BASE_URL}/api/users/location`,
              { location: address },
              { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            setUser((prev) => ({ ...prev, location: address }));
          } catch (error) {
            setLocation("Location unavailable");
          } finally {
            setIsLocationLoading(false);
          }
        },
        () => {
          setLocation("Allow location access");
          setIsLocationLoading(false);
        }
      );
    } else if (user?.location) {
      setLocation(user.location);
    }
  }, [isAuthenticated, user?.location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${search.trim()}`);
  };

  const handleManualLocationChange = async () => {
    const newLocation = prompt("Enter your location:", location);
    if (newLocation && newLocation !== location) {
      try {
        setLocation(newLocation);
        await axios.put(
          `${BASE_URL}/api/users/location`,
          { location: newLocation },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setUser((prev) => ({ ...prev, location: newLocation }));
      } catch (error) {
        console.error("Failed to update location:", error);
        setLocation(location);
      }
    }
  };

  return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side - Logo & Navigation */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors">
              DAKSH
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link 
                to="/products" 
                className="text-gray-300 hover:text-white px-3 py-2 font-medium transition-colors"
              >
                Services
              </Link>
              <Link 
                to="/partner-register" 
                className="text-gray-300 hover:text-white px-3 py-2 font-medium transition-colors"
              >
                Partner
              </Link>
              <Link 
                to="/about" 
                className="text-gray-300 hover:text-white px-3 py-2 font-medium transition-colors"
              >
                About
              </Link>
            </div>
          </div>

          {/* Right side - Auth & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Location */}
            {isAuthenticated && (
              <div 
                onClick={handleManualLocationChange}
                className="flex items-center text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 mr-1 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {isLocationLoading ? "Detecting..." : location}
              </div>
            )}

            {/* Search */}
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search services..."
                className="px-3 py-1 border border-gray-700 bg-gray-800 text-white rounded-l-md focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-3 py-1 rounded-r-md transition-colors"
              >
                Search
              </button>
            </form>

            {/* Cart */}
            <Link to="/cart" className="p-2 relative">
              <svg className="w-6 h-6 text-gray-300 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Auth */}
            {!isAuthenticated ? (
              <div className="flex space-x-2">
                <Link 
                  to="/login" 
                  className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-md transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-3 py-1 border border-gray-300 text-gray-300 hover:bg-gray-800 font-medium rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">Hi, {user?.name}</span>
                <Link 
                  to="/my-orders"
                  className="text-sm text-yellow-400 hover:text-white transition-colors"
                >
                  My Orders
                </Link>
                <button 
                  onClick={logout}
                  className="px-3 py-1 text-sm text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Logout
                </button>
                <Link
                to="/profile"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white mr-4"
              >
                <FiUser size={20}/>
              </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          {/* User Profile Section */}
          {isAuthenticated && (
            <div className="flex items-center px-4 py-3 bg-gray-700 border-b border-gray-600">
              <div className="flex-shrink-0">
                <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <div 
                  onClick={handleManualLocationChange}
                  className="flex items-center text-xs text-gray-300 cursor-pointer hover:text-white transition-colors"
                >
                  <svg className="w-3 h-3 mr-1 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {isLocationLoading ? "Detecting..." : location}
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="px-4 py-3 border-b border-gray-700">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search services..."
                className="flex-1 px-4 py-2 bg-gray-900 text-white placeholder-gray-400 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-r-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="px-2 py-2 space-y-1">
            <Link
              to="/products"
              className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Services
            </Link>
            
            <Link
              to="/partner-register"
              className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Partner with Us
            </Link>
            
            <Link
              to="/about"
              className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About Us
            </Link>
            
            {isAuthenticated && (
              <Link
                to="/my-orders"
                className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                My Orders
              </Link>
            )}
          </div>

          {/* Cart & Auth Section */}
          <div className="px-4 py-3 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <Link
                to="/cart"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </div>
                <span className="ml-2">Cart</span>
              </Link>

              {!isAuthenticated ? (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 border border-gray-500 text-gray-300 hover:bg-gray-700 font-medium rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 font-medium rounded-lg transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}