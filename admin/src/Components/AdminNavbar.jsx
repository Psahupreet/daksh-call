import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/admin-login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-900 text-white px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-between items-center border-b border-gray-700 shadow-lg">
      {/* Logo and Hamburger */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Daksh Admin
        </h1>
        
        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-300 hover:text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <FaTimes className="h-6 w-6" />
          ) : (
            <FaBars className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Navigation Links - Desktop */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8">
        <Link 
          to="/dashboard" 
          className={`py-2 px-1 font-medium transition-colors ${isActive('/dashboard') ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-300 hover:text-white'}`}
        >
          Dashboard
        </Link>
        <Link 
          to="/products" 
          className={`py-2 px-1 font-medium transition-colors ${isActive('/products') ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-300 hover:text-white'}`}
        >
          Products
        </Link>
        <Link 
          to="/orders" 
          className={`py-2 px-1 font-medium transition-colors ${isActive('/orders') ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-300 hover:text-white'}`}
        >
          Orders
        </Link>
        <Link 
          to="/providers" 
          className={`py-2 px-1 font-medium transition-colors ${isActive('/providers') ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-300 hover:text-white'}`}
        >
          Providers
        </Link>
        <Link 
          to="/users" 
          className={`py-2 px-1 font-medium transition-colors ${isActive('/users') ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-300 hover:text-white'}`}
        >
          Users
        </Link>
        <button 
          onClick={handleLogout} 
          className="ml-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          <FaSignOutAlt className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="w-full md:hidden mt-3">
          <div className="flex flex-col space-y-3 px-2 pt-2 pb-4 bg-gray-800 rounded-lg">
            <Link 
              to="/dashboard" 
              className={`py-2 px-3 rounded font-medium transition-colors ${isActive('/dashboard') ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/products" 
              className={`py-2 px-3 rounded font-medium transition-colors ${isActive('/products') ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/orders" 
              className={`py-2 px-3 rounded font-medium transition-colors ${isActive('/orders') ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Orders
            </Link>
            <Link 
              to="/providers" 
              className={`py-2 px-3 rounded font-medium transition-colors ${isActive('/providers') ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Providers
            </Link>
            <Link 
              to="/users" 
              className={`py-2 px-3 rounded font-medium transition-colors ${isActive('/users') ? 'text-blue-400 bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Users
            </Link>
            <button 
              onClick={handleLogout} 
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FaSignOutAlt className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}