import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddedCard, setShowAddedCard] = useState(false);
  const [showAlreadyInCart, setShowAlreadyInCart] = useState(false);
  const [mainImage, setMainImage] = useState(0);
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [subServiceToAdd, setSubServiceToAdd] = useState("");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setTotalPrice(res.data.price);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (product) {
      const extra = selectedSubServices.reduce((sum, item) => sum + item.price, 0);
      setTotalPrice(product.price + extra);
    }
  }, [selectedSubServices, product]);

  const handleAddSubService = () => {
    if (!subServiceToAdd) return;
    if (selectedSubServices.find((sub) => sub.title === subServiceToAdd)) {
      alert("Sub-service already selected.");
      return;
    }
    const selected = Array.isArray(product.subServices)
      ? product.subServices.find((s) => s.title === subServiceToAdd)
      : null;
    if (selected) {
      setSelectedSubServices((prev) => [...prev, selected]);
      setSubServiceToAdd("");
    }
  };

  const handleRemoveSubService = (title) => {
    setSelectedSubServices((prev) => prev.filter((sub) => sub.title !== title));
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const alreadyInCart = cartItems.some((item) => item.id === product._id);
    if (alreadyInCart) {
      setShowAlreadyInCart(true);
      return;
    }

    addToCart({
      id: product._id,
      title: product.name,
      price: product.price,
      imageUrl: Array.isArray(product.images) && product.images[0] ? product.images[0] : "",
      subServices: selectedSubServices,
    });

    setShowAddedCard(true);
  };

  if (isLoading)
    return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!product)
    return <div className="h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Image Gallery */}
        <div>
          <img
            src={
              Array.isArray(product.images) && product.images[mainImage]
                ? `${BASE_URL}/uploads/${product.images[mainImage]}`
                : "https://via.placeholder.com/400x300?text=Service+Image"
            }
            alt={product.name}
            className="rounded-lg w-full h-64 sm:h-80 md:h-96 object-cover shadow"
          />
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {Array.isArray(product.images) &&
              product.images.map((img, i) => (
                <img
                  key={i}
                  src={`${BASE_URL}/uploads/${img}`}
                  alt="Thumbnail"
                  onClick={() => setMainImage(i)}
                  className={`cursor-pointer h-16 sm:h-20 w-full object-cover rounded border ${
                    mainImage === i ? "ring-2 ring-indigo-600 scale-105" : ""
                  } transition`}
                />
              ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-lg sm:text-xl text-green-600 font-semibold">₹{totalPrice}</p>
            <p className="text-gray-700 mt-4 text-sm sm:text-base">{product.description}</p>
          </div>

          {/* Subservice Selection */}
          {Array.isArray(product.subServices) && product.subServices.length > 0 && (
            <div className="bg-gray-50 p-3 sm:p-5 rounded-xl border mt-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">
                Customize Your Service
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={subServiceToAdd}
                  onChange={(e) => setSubServiceToAdd(e.target.value)}
                  className="flex-1 p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>Select a sub-service</option>
                  {product.subServices.map((sub, i) => (
                    <option key={i} value={sub.title}>
                      {sub.title} – ₹{sub.price}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddSubService}
                  disabled={!subServiceToAdd}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              {selectedSubServices.length > 0 && (
                <div className="mt-5 sm:mt-6 space-y-2 sm:space-y-3">
                  {selectedSubServices.map((sub, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-white px-3 sm:px-4 py-2 rounded-md border shadow-sm"
                    >
                      <span className="text-sm sm:text-base">
                        {sub.title} – <strong>₹{sub.price}</strong>
                      </span>
                      <button
                        onClick={() => handleRemoveSubService(sub.title)}
                        className="text-xs sm:text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full mt-5 sm:mt-6 py-2 sm:py-3 bg-indigo-600 text-white text-base sm:text-lg rounded-lg hover:bg-indigo-700 font-semibold shadow"
          >
            Add to Cart
          </button>

          {/* Reviews Section */}
          {product.review && (
            <div className="mt-10 sm:mt-12 md:mt-16 border-t border-gray-200 pt-6 sm:pt-8 md:pt-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Customer Reviews</h2>
              <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
                <p className="text-gray-700 italic text-sm sm:text-base">"{product.review}"</p>
              </div>
            </div>
          )}
          {/* Added Success Toast */}
          {showAddedCard && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-2">
              <div className="bg-white p-5 rounded-xl shadow-md border border-green-200 w-full max-w-xs sm:max-w-md mx-auto text-center relative">
                {/* Centered success icon */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-green-100 rounded-full p-2 flex items-center justify-center mx-auto">
                    <svg
                      className="h-7 w-7 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Item added to cart</h3>
                  <p className="text-sm text-gray-500">
                    Your item has been added successfully!
                  </p>
                  <button
                    onClick={() => setShowAddedCard(false)}
                    className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium shadow transition mt-2"
                  >
                    OK
                  </button>
                </div>
                {/* Optional: Close (X) button for desktop */}
                <button
                  onClick={() => setShowAddedCard(false)}
                  className="hidden sm:block absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {/* Already in Cart Modal */}
          {showAlreadyInCart && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-2">
              <div className="bg-white p-5 rounded-xl shadow-md border border-yellow-200 w-full max-w-xs mx-auto text-center">
                <div className="flex flex-col items-center space-y-4">
                  {/* Single centered warning icon */}
                  <div className="bg-yellow-100 rounded-full p-2">
                    <svg
                      className="h-7 w-7 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Already in Cart</h3>
                  <p className="text-sm text-gray-600">
                    This item is already added to your cart.
                  </p>
                  <button
                    onClick={() => setShowAlreadyInCart(false)}
                    className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium shadow transition"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}