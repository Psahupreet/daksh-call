import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FiTrash2,
  FiX,
  FiCheck,
  FiClock,
  FiMapPin,
  FiHome,
  FiCalendar,
} from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Utility to format date as YYYY-MM-DD
function formatDateYMD(date) {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}
// Utility to format time as h:mm AM/PM
function formatTimeHM(date) {
  if (!date) return "";
  // For react-datepicker, date is a Date object
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Generate time slots (every 30 min, 8 AM to 8 PM)
const generateTimeSlots = (selectedDate) => {
  const slots = [];
  const today = new Date();
  const base = new Date(selectedDate);
  const isToday = base.toDateString() === today.toDateString();

  let startHour = 8;
  let endHour = 19; // Last slot starts at 7:30 PM

  // For today, skip past slots (now + 30min buffer)
  let now = new Date();
  if (isToday) {
    now.setMinutes(now.getMinutes() + 30);
    startHour = Math.max(startHour, now.getHours());
  }

  for (let hour = startHour; hour <= endHour; hour++) {
    [0, 30].forEach((minute) => {
      const slot = new Date(base);
      slot.setHours(hour, minute, 0, 0);

      // For today, only show slots after now
      if (!isToday || slot > now) {
        slots.push(slot);
      }
    });
  }

  return slots;
};

export default function Cart() {
  const { cartItems, removeFromCart, clearCart, updateCartItem } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Address fields
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [addressType, setAddressType] = useState("Home");

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);

  // Date & time
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [errors, setErrors] = useState({});

  // Sub-services
  const [productSubServices, setProductSubServices] = useState({});
  const [selectedSub, setSelectedSub] = useState({});

  const navigate = useNavigate();

  // Fetch all available sub-services for products in the cart
  useEffect(() => {
    async function fetchSubServices() {
      const result = {};
      for (const item of cartItems) {
        try {
          const res = await axios.get(`${BASE_URL}/api/products/${item.id}`);
          result[item.id] = Array.isArray(res.data?.subServices) ? res.data.subServices : [];
        } catch {
          result[item.id] = [];
        }
      }
      setProductSubServices(result);
    }
    if (cartItems.length > 0) fetchSubServices();
  }, [cartItems]);

  // Calculate total (base + sub-services)
  const subtotal = cartItems.reduce((acc, item) => {
    const subTotal = (Array.isArray(item.subServices) ? item.subServices : []).reduce(
      (subAcc, sub) => subAcc + Number(sub.price),
      0
    );
    return acc + Number(item.price) + subTotal;
  }, 0);

  // Add a sub-service from dropdown in cart
  const handleAddSubService = (item) => {
    const allSubs = Array.isArray(productSubServices[item.id]) ? productSubServices[item.id] : [];
    const subToAdd = allSubs.find(sub => String(sub.title) === String(selectedSub[item.id]));
    if (!subToAdd) return;
    if ((Array.isArray(item.subServices) ? item.subServices : []).some(s => String(s.title) === String(subToAdd.title))) return;
    const updatedItem = {
      ...item,
      subServices: [...(Array.isArray(item.subServices) ? item.subServices : []), subToAdd]
    };
    updateCartItem(updatedItem);
    setSelectedSub(prev => ({ ...prev, [item.id]: "" }));
  };

  // Remove a sub-service from the cart
  const handleRemoveSubService = (itemId, subServiceTitle) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;
    const updatedSubServices = (Array.isArray(item.subServices) ? item.subServices : []).filter(sub => String(sub.title) !== String(subServiceTitle));
    updateCartItem({
      ...item,
      subServices: updatedSubServices
    });
  };

  // Fetch saved addresses on modal open
  useEffect(() => {
    if (showConfirmation) {
      fetchSavedAddresses();
    }
    // eslint-disable-next-line
  }, [showConfirmation]);

  const fetchSavedAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setSavedAddresses([]);
    }
  };

  // When selecting a saved address, auto-fill fields OR clear if new address
  useEffect(() => {
    if (selectedAddressIndex >= 0 && savedAddresses[selectedAddressIndex]) {
      const addr = savedAddresses[selectedAddressIndex];
      setHouseNumber(addr.houseNumber || "");
      setStreet(addr.street || "");
      setLandmark(addr.landmark || "");
      setAddressType(addr.addressType || "Home");
    }
    if (selectedAddressIndex === -1) {
      setHouseNumber("");
      setStreet("");
      setLandmark("");
      setAddressType("Home");
    }
  }, [selectedAddressIndex, savedAddresses]);

  // User location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchAddressFromCoords(latitude, longitude);
      },
      (error) => {
        alert("Unable to retrieve your location. Permission denied or unavailable.");
      }
    );
  };

  const fetchAddressFromCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      const address = data.address || {};
      setHouseNumber(address.house_number || "");
      setStreet(
        [
          address.road,
          address.neighbourhood,
          address.suburb,
          address.village,
          address.town,
          address.city,
        ]
          .filter(Boolean)
          .join(", ")
      );
      setLandmark(address.state_district || address.state || "");
      setAddressType("Home");
    } catch (e) {
      alert("Failed to get address from your location.");
    }
  };

  const handleEnterNewAddress = () => {
    setSelectedAddressIndex(-1);
    setHouseNumber("");
    setStreet("");
    setLandmark("");
    setAddressType("Home");
  };

  // Validate the checkout form
  const validateForm = () => {
    const newErrors = {};
    if (!houseNumber.trim())
      newErrors.houseNumber = "Flat/House No. is required";
    if (!street.trim()) newErrors.street = "Street/Colony is required";
    if (!selectedDate) newErrors.date = "Please select a date";
    if (!selectedTime) newErrors.time = "Please select a time";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Place order: also save address for future use!
  const placeOrder = async () => {
    if (!validateForm()) return;
    setIsPlacingOrder(true);
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated. Please log in.");
      navigate("/login");
      return;
    }
    // ---- CRITICAL PART: FORMAT TIME SLOT AS STRINGS ----
    const dateStr = formatDateYMD(selectedDate);
    const timeStr = formatTimeHM(selectedTime);
    const fullAddress = `${houseNumber}, ${street}${landmark ? `, Landmark: ${landmark}` : ""} (${addressType})`;
    const timeSlot = `${dateStr} at ${timeStr}`;
    try {
      // Place order
      await axios.post(
        `${BASE_URL}/api/orders/place`,
        {
          items: cartItems,
          totalAmount: subtotal,
          address: {
            fullAddress,
            timeSlot,
            houseNumber,
            street,
            landmark,
            addressType,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Save address for future use
      await axios.post(
        `${BASE_URL}/api/users/addresses`,
        { houseNumber, street, landmark, addressType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Order placed successfully!");
      clearCart();
      setShowConfirmation(false);
      navigate("/my-orders");
    } catch (err) {
      // Show error detail for debugging
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong while placing your order.";
      alert(msg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 p-6 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
            <FiX className="text-gray-500 text-3xl sm:text-4xl" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any services yet.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-base sm:text-lg"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  // Date picker: today to 3 months ahead
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  const timeSlots = generateTimeSlots(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cartItems.map((item, idx) => {
              const subServices = Array.isArray(item.subServices) ? item.subServices : [];
              const allSubs = Array.isArray(productSubServices[item.id]) ? productSubServices[item.id] : [];
              const subTotal = subServices.reduce(
                (acc, sub) => acc + Number(sub.price),
                0
              );
              const mainPrice = Number(item.price);
              const itemTotal = mainPrice + subTotal;
              const availableSubs = allSubs.filter(sub =>
                !subServices.some(s => String(s.title) === String(sub.title))
              );
              return (
                <div
                  key={item.id || idx}
                  className="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <img
                      src={item.imageUrl
                        ? `${BASE_URL}/uploads/${item.imageUrl}`
                        : (Array.isArray(item.images) && item.images[0]
                          ? `${BASE_URL}/uploads/${item.images[0]}`
                          : "/default-service.png")
                      }
                      alt={item.title}
                      className="w-full sm:w-24 h-24 object-cover rounded-lg mb-4 sm:mb-0"
                    />
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                          {item.title || item.name}
                        </h2>
                        <p className="text-green-600 font-bold text-base sm:text-lg">₹{itemTotal}</p>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">Base Price: ₹{mainPrice}</p>
                      {/* Sub-services after base price */}
                      {subServices.length > 0 && (
                        <div className="mt-2">
                          <div className="font-medium text-gray-700 mb-1 text-sm">Sub-Services:</div>
                          <ul className="space-y-1">
                            {subServices.map(sub => (
                              <li
                                key={sub.title}
                                className="flex justify-between items-center pl-2 pr-2 py-0.5 text-xs sm:text-sm text-gray-600 bg-gray-50 rounded"
                              >
                                <span>{sub.title}</span>
                                <span className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">+₹{sub.price}</span>
                                  <button
                                    onClick={() => handleRemoveSubService(item.id, sub.title)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                    title="Remove this sub-service"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Add sub-service dropdown */}
                      {allSubs.length > 0 && (
                        <div className="my-2 sm:my-3">
                          <label className="font-medium mb-1 block text-gray-700 text-sm">
                            Customize Your Service
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={selectedSub[item.id] || ""}
                              className="border border-gray-300 rounded px-2 py-1 w-full sm:w-auto"
                              onChange={e =>
                                setSelectedSub(prev => ({ ...prev, [item.id]: e.target.value }))
                              }
                            >
                              <option value="">Select a sub-service</option>
                              {availableSubs.map(sub => (
                                <option key={sub.title} value={sub.title}>
                                  {sub.title} (+₹{sub.price})
                                </option>
                              ))}
                            </select>
                            <button
                              disabled={!selectedSub[item.id]}
                              onClick={() => handleAddSubService(item)}
                              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 self-end sm:self-center transition-colors duration-200 mt-2 sm:mt-0"
                    >
                      <FiTrash2 size={16} />
                      <span className="text-xs sm:text-sm">Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 pb-2 border-b border-gray-200">
                Order Summary
              </h3>
              {(() => {
                const taxRate = 0.18; // 18% GST
                const taxAmount = subtotal * taxRate;
                const total = subtotal + taxAmount;
                return (
                  <>
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Subtotal</span>
                        <span className="text-sm">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Tax (18%)</span>
                        <span className="text-sm">₹{taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 sm:pt-3 border-t border-gray-200">
                        <span className="text-gray-600 font-medium text-sm">Total</span>
                        <span className="font-bold text-green-700 text-base sm:text-lg">
                          ₹{total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            alert("Please login to proceed with checkout.");
                            navigate("/login");
                            return;
                          }
                          setShowConfirmation(true);
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-md hover:shadow-lg text-base sm:text-lg"
                      >
                        <FiCheck size={18} />
                        Proceed to Checkout
                      </button>
                      <button
                        onClick={clearCart}
                        className="w-full text-red-500 hover:text-red-700 px-4 py-2.5 rounded-lg border border-red-200 hover:border-red-300 flex items-center justify-center gap-1.5 transition-colors duration-200 text-sm sm:text-base"
                      >
                        <FiTrash2 size={16} />
                        Clear Cart
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      {/* Order Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-2 sm:p-4">
          <div className="bg-white rounded-xl p-3 sm:p-6 shadow-xl w-full max-w-md max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">Confirm Your Order</h2>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            {/* Address Suggestions */}
            {savedAddresses.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <label className="block font-medium mb-2 flex items-center gap-1 text-gray-700 text-sm">
                  <FiMapPin size={16} />
                  Select Saved Address
                </label>
                <div className="space-y-2">
                  {savedAddresses.map((addr, idx) => (
                    <button
                      key={idx}
                      className={
                        "w-full border rounded-lg px-3 py-2 text-left " +
                        (selectedAddressIndex === idx
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:bg-gray-50")
                      }
                      onClick={() => setSelectedAddressIndex(idx)}
                    >
                      <span className="font-medium">
                        {addr.houseNumber}, {addr.street}
                        {addr.landmark && `, Landmark: ${addr.landmark}`},{" "}
                        {addr.addressType}
                      </span>
                    </button>
                  ))}
                  <button
                    className={
                      "w-full border rounded-lg px-3 py-2 text-left " +
                      (selectedAddressIndex === -1
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:bg-gray-50")
                    }
                    onClick={handleEnterNewAddress}
                  >
                    <span className="font-medium">+ Enter New Address</span>
                  </button>
                </div>
              </div>
            )}
            {/* Address Input */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <label className="block font-medium flex items-center gap-1 text-sm">
                    <FiHome size={16} />
                    Flat / House No.<span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded flex items-center gap-2 text-xs sm:text-sm"
                    onClick={handleUseMyLocation}
                  >
                    📍 Use My Location
                  </button>
                </div>
                <input
                  type="text"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  className={`w-full border rounded-lg p-2 text-sm ${
                    errors.houseNumber
                      ? "border-red-400"
                      : "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                  disabled={selectedAddressIndex >= 0}
                />
                {errors.houseNumber && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.houseNumber}</p>
                )}
              </div>
              <div>
                <label className="block font-medium mb-1 flex items-center gap-1 text-sm">
                  <FiMapPin size={16} />
                  Street / Colony<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className={`w-full border rounded-lg p-2 text-sm ${
                    errors.street
                      ? "border-red-400"
                      : "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  }`}
                  disabled={selectedAddressIndex >= 0}
                />
                {errors.street && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.street}</p>
                )}
              </div>
              <div>
                <label className="block font-medium mb-1 flex items-center gap-1 text-sm">
                  <FiMapPin size={16} />
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={selectedAddressIndex >= 0}
                />
              </div>
              <div>
                <label className="block font-medium mb-1 flex items-center gap-1 text-sm">
                  <FiHome size={16} />
                  Address Type
                </label>
                <select
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={selectedAddressIndex >= 0}
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            {/* Date Picker */}
            <div className="mt-3 sm:mt-6">
              <label className="block font-medium mb-1 flex items-center gap-1 text-sm">
                <FiCalendar size={16} />
                Select Date<span className="text-red-500">*</span>
              </label>
              <ReactDatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                }}
                minDate={minDate}
                maxDate={maxDate}
                dateFormat="yyyy-MM-dd"
                className={`w-full border rounded-lg p-2 mt-1 text-sm ${
                  errors.date
                    ? "border-red-400"
                    : "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                }`}
                placeholderText="Choose a date"
                showPopperArrow={false}
              />
              {errors.date && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.date}</p>
              )}
            </div>
            {/* Time Slot Selection */}
            <div className="mt-3 sm:mt-4">
              <label className="block font-medium mb-1 flex items-center gap-1 text-sm">
                <FiClock size={16} />
                Select Time Slot<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
                {timeSlots.length === 0 ? (
                  <span className="col-span-2 text-gray-400 text-xs sm:text-sm italic">
                    No slots available, try another date.
                  </span>
                ) : (
                  timeSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`px-2 py-2 sm:px-3 sm:py-2 rounded-lg border text-xs sm:text-sm flex flex-col items-start transition
                        ${
                          selectedTime &&
                          slot.getTime() === selectedTime.getTime()
                            ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                            : "border-gray-200 hover:bg-indigo-50"
                        }`}
                      onClick={() => setSelectedTime(slot)}
                    >
                      <span>{formatTimeHM(slot)}</span>
                      <span className="text-xs text-gray-500">
                        approx. 1 hour
                      </span>
                    </button>
                  ))
                )}
              </div>
              {errors.time && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.time}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                onClick={() => setShowConfirmation(false)}
                disabled={isPlacingOrder}
              >
                <FiX size={16} />
                Cancel
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                onClick={placeOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Placing...
                  </>
                ) : (
                  <>
                    <FiCheck size={16} />
                    Confirm Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}