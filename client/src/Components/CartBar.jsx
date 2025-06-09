import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { FiX, FiShoppingCart, FiArrowUp } from "react-icons/fi";

/**
 * Floating cart bar shown at the bottom when items are in the cart.
 * Displays service name, item count, "View Cart", close, and scroll-to-top button.
 * When closed, it will reappear if the user adds an item to the cart again.
 * Hides itself on the /cart page.
 */
export default function CartBar({ serviceName = "Your Selected Service" }) {
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(true);

  // Hide CartBar on the /cart page
  const isCartPage = location.pathname === "/cart";

  // If the cart becomes empty, hide CartBar and reset "visible" to true (so it will show up if user adds again)
  useEffect(() => {
    if (!cartItems.length) {
      setVisible(true);
    }
  }, [cartItems.length]);

  // If user previously closed CartBar but now adds an item again, show the CartBar
  useEffect(() => {
    if (cartItems.length && !visible) {
      setVisible(true);
    }
    // eslint-disable-next-line
  }, [cartItems.length]);

  if (!cartItems.length || !visible || isCartPage) return null;

  // Use the title of first cart item, fallback to provided serviceName
  const firstItem = cartItems[0];
  const name = firstItem?.title || firstItem?.name || serviceName;
  const itemsCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  // Scroll to top handler
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hide the cart bar
  const handleClose = () => {
    setVisible(false);
  };

  return (
    <div className="fixed z-40 inset-x-0 bottom-0 sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-xs w-full sm:w-[420px] bg-white border-t sm:border sm:rounded-xl shadow-2xl sm:shadow-lg animate-fade-in-up">
      <div className="container mx-auto px-4 py-3 sm:px-3 sm:py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Item Preview */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative">
              <img
                src={
                  firstItem?.imageUrl
                    ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${firstItem.imageUrl}`
                    : (Array.isArray(firstItem?.images) && firstItem.images[0]
                      ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${firstItem.images[0]}`
                      : "/default-service.png")
                }
                alt={name}
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg sm:rounded-full object-cover border border-gray-100 shadow-sm"
              />
              <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemsCount}
              </div>
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">{name}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FiShoppingCart className="inline" size={12} />
                {itemsCount} {itemsCount === 1 ? "item" : "items"} in cart
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Scroll to top button */}
            <button
              onClick={handleScrollTop}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              aria-label="Scroll to top"
              title="Scroll to top"
            >
              <FiArrowUp size={16} />
            </button>
            {/* View Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="px-4 py-2 rounded-lg sm:rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              View Cart
            </button>
            {/* Close cart bar */}
            <button 
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleClose}
              aria-label="Close cart bar"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}