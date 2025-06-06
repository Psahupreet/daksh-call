import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
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

      {/* Mobile menu */} 
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Navigation Links */}
            <Link
              to="/products"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/partner-register"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Partner
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>

            {/* Mobile Location */}
            {isAuthenticated && (
              <div 
                onClick={() => {
                  handleManualLocationChange();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md cursor-pointer"
              >
                <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </div>
            )}

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-2">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white rounded-l-md"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="bg-yellow-500 text-gray-900 px-3 py-2 rounded-r-md"
                >
                  Go
                </button>
              </div>
            </form>

            {/* Mobile Auth */}
            <div className="pt-2">
              {!isAuthenticated ? (
                <div className="flex space-x-2 px-2">
                  <Link
                    to="/login"
                    className="w-1/2 px-4 py-2 text-center bg-yellow-500 text-gray-900 font-medium rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  
                  <Link
                    to="/signup"
                    className="w-1/2 px-4 py-2 text-center border border-gray-300 text-gray-300 font-medium rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="px-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-gray-300">Hi, {user?.name}</span>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-sm text-gray-300 hover:text-white font-medium"
                    >
                      Logout
                    </button>
                    <Link
                      to="/my-orders"
                      className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>

                  </div>
                </div>
              )}
            </div>

            {/* Mobile Cart */}
            <Link
              to="/cart"
              className="flex items-center px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart
              {cartItems.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>  
      )}
    </nav>
  );
}