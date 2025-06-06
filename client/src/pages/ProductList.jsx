import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/products`)
      .then((res) => {
        setProducts(Array.isArray(res.data) ? res.data : []); // Defensive: always array
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load services. Please try again later.");
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
          Our Services
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Professional home services tailored to your needs
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md overflow-hidden animate-pulse"
            >
              <div className="bg-gray-200 h-40 sm:h-48 w-full"></div>
              <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 sm:h-10 bg-gray-200 rounded w-full mt-3 sm:mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No services available
          </h3>
          <p className="mt-1 text-sm text-gray-500">Please check back later</p>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md overflow-hidden hover:shadow-lg sm:hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img
                  src={
                    Array.isArray(product.images) && product.images[0]
                      ? `${BASE_URL}/uploads/${product.images[0]}`
                      : "https://via.placeholder.com/400x300?text=Service+Image"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=Service+Image";
                  }}
                />
                {product.rating && (
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold flex items-center shadow-sm">
                    ⭐ {Number(product.rating).toFixed(1)}
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-1">
                    {product.name}
                  </h2>
                  <p className="text-base sm:text-lg font-bold text-green-600 whitespace-nowrap">
                    ₹{product.price}
                  </p>
                </div>

                <p className="mt-2 text-sm sm:text-base text-gray-600 line-clamp-2">
                  {product.description}
                </p>
                {/* You had product.SubSe here, likely a typo; removed */}

                <Link
                  to={`/product/${product._id}`}
                  className="mt-4 sm:mt-6 inline-block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}