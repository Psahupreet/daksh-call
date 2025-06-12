import { useEffect, useState } from "react";
import axios from "axios";
import { useMediaQuery } from "react-responsive";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AVAILABLE_TIME_SLOTS = [
  "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM",
  "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
  "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
  "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"
];

const CANCEL_LIMIT = 3; // Only allow cancel for first 3 orders

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [now, setNow] = useState(Date.now());

  // MOBILE DETECTION
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Get userId from localStorage or auth (customize as needed for your app!)
  const userId = localStorage.getItem("userId");

  // Track per-user cancel count (first 3 orders ever)
  const getUserCancelCount = () => {
    return parseInt(localStorage.getItem(`cancelCount_${userId}`) || "0", 10);
  };
  const setUserCancelCount = (count) => {
    localStorage.setItem(`cancelCount_${userId}`, count);
  };

  // Re-render every 10s to update cancel button timeout
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const sorted = Array.isArray(response.data)
        ? [...response.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setOrders(sorted);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  // Cancel logic for only first 3 orders per user, and only for 4 min after order placed
  const canShowCancelBtn = (order, index) => {
    let cancelCount = getUserCancelCount();

    // After 3 cancel-enabled orders, never show Cancel again
    if (cancelCount >= CANCEL_LIMIT) return false;

    // Only first 3 orders
    if (index >= CANCEL_LIMIT) return false;

    // Only if not completed/cancelled
    if (order.status === "Cancelled" || order.status === "Completed") return false;

    // Only within 4 minutes (240000 ms) of placed
    const created = new Date(order.createdAt).getTime();
    const within4Min = now - created <= 240000;

    // If within allowed orders and within time, increment count if needed
    if (within4Min && cancelCount <= index) {
      setUserCancelCount(index + 1);
    }

    return within4Min;
  };

  const cancelOrder = async (id) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchOrders();
    } catch (err) {
      alert("Failed to cancel order");
    }
  };

  const handleOpenTimeSlotEditor = (order) => {
    setEditingOrderId(order._id);
    setSelectedTimeSlot(order.address?.timeSlot || "");
  };

  const handleTimeSlotChange = (e) => {
    setSelectedTimeSlot(e.target.value);
  };

  const handleSaveTimeSlot = async (order) => {
    if (!selectedTimeSlot || selectedTimeSlot === order.address?.timeSlot) {
      setEditingOrderId(null);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/api/orders/${order._id}/change-timeslot`,
        { timeSlot: selectedTimeSlot },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingOrderId(null);
      fetchOrders();
    } catch (err) {
      alert("Failed to update time slot.");
    }
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
  };

  // Style classes, themed for mobile or desktop (mobile: white bg, black text)
  const mobileCard = isMobile
    ? "bg-white border-gray-200 text-black shadow-lg px-2 py-4 rounded-2xl"
    : "bg-white border-gray-100";
  const mobileSection = isMobile
    ? "bg-gray-50 border-gray-200 text-black"
    : "bg-gray-50 border-gray-200";
  const mobileButton = isMobile
    ? "bg-blue-700 hover:bg-blue-800 text-white"
    : "bg-indigo-600 hover:bg-indigo-700 text-white";
  const mobileCancelBtn = isMobile
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-red-600 hover:bg-red-700 text-white";
  const mobileTimeSlotSelect = isMobile
    ? "bg-gray-100 border-gray-300 text-black"
    : "";
  const mobileInputBorder = isMobile
    ? "border-gray-300"
    : "border-gray-300";
  const mobileChip = isMobile
    ? "rounded-full bg-gray-200 border border-gray-300 text-xs px-3 py-1 text-black font-bold"
    : "rounded-full";
  const mobileHappy = isMobile
    ? "bg-green-50 border-green-200 text-green-700"
    : "bg-green-50 border-green-200 text-green-600";
  const mobileComplete = isMobile
    ? "bg-blue-50 border-blue-200 text-blue-700"
    : "bg-blue-50 border-blue-200 text-blue-600";
  const mobileCardShadow = isMobile ? "shadow-lg" : "shadow-sm";
  const mobileItemBg = isMobile ? "bg-white" : "bg-white";

  // Helper to calculate subservices total for an item
  const getSubservicesTotal = (subServices) =>
    Array.isArray(subServices)
      ? subServices.reduce((sum, sub) => sum + (Number(sub.price) || 0), 0)
      : 0;

  return (
    <div className={`max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-8 ${isMobile ? "bg-white min-h-screen text-black" : ""}`}>
      {/* Header */}
      <div className="flex items-center mb-4 sm:mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 ${isMobile ? "text-blue-700" : "text-indigo-600"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${isMobile ? "text-black" : "text-gray-800"}`}>My Orders</h1>
      </div>

      {loading ? (
        <div className="space-y-4 sm:space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`p-4 sm:p-6 rounded-xl ${mobileCardShadow} border ${mobileCard} animate-pulse`}>
              <div className="flex justify-between">
                <div className="h-5 sm:h-6 bg-gray-300 rounded w-1/3 sm:w-1/4"></div>
                <div className="h-5 sm:h-6 bg-gray-300 rounded w-1/4 sm:w-1/6"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-4 sm:mt-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
                <div className="h-48 sm:h-64 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className={`p-6 sm:p-8 lg:p-10 rounded-xl ${mobileCardShadow} text-center max-w-md mx-auto ${mobileCard}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-12 w-12 sm:h-16 sm:w-16 mx-auto ${isMobile ? "text-gray-400" : "text-gray-400"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v16a2 2 0 01-2 2z" />
          </svg>
          <h3 className={`mt-4 sm:mt-5 text-base sm:text-lg font-medium ${isMobile ? "text-black" : "text-gray-900"}`}>No orders yet</h3>
          <p className={`mt-1 sm:mt-2 text-sm ${isMobile ? "text-gray-500" : "text-gray-500"}`}>You haven't placed any orders yet.</p>
          <button
            onClick={() => (window.location.href = "/products")}
            className={`mt-4 sm:mt-6 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg ${mobileButton} transition-colors shadow-sm text-sm sm:text-base`}
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {orders.map((order, index) => (
            <div
              key={order._id}
              className={`p-4 sm:p-5 lg:p-6 rounded-xl ${mobileCardShadow} border ${mobileCard}`}
            >
               <div className={`flex flex-col gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b ${isMobile ? "border-[#232c3d]" : "border-gray-100"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-base sm:text-lg lg:text-xl font-semibold truncate ${isMobile ? "text-gray-800" : "text-gray-800"}`}>
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h2>
                    <p className={`text-xs sm:text-sm mt-1 ${isMobile ? "text-gray-400" : "text-gray-500"}`}>
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-3">
                    <p className={`text-base sm:text-lg font-semibold ${isMobile ? "text-blue-300" : "text-gray-800"}`}>₹{order.totalAmount}</p>
                    <span
                      className={`${mobileChip} ${
                        order.status === "Cancelled"
                          ? isMobile ? "bg-red-900 border-red-800 text-red-300" : "bg-red-100 text-red-800"
                          : order.status === "Completed"
                          ? isMobile ? "bg-green-900 border-green-800 text-green-300" : "bg-green-100 text-green-800"
                          : isMobile ? "bg-yellow-900 border-yellow-800 text-yellow-200" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
                               {/* Partner assignment message with contact details */}
              {order.partner && order.partner.name && (
                <div className={`mb-4 flex items-start gap-2 sm:gap-3 rounded-lg px-3 sm:px-4 py-2 sm:py-3 ${isMobile ? "bg-green-950 border-green-600" : "bg-green-50 border border-green-200"}`}>
                  <svg className={`h-5 w-5 sm:h-6 sm:w-6 ${isMobile ? "text-green-400" : "text-green-500"} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A7 7 0 0012 19a7 7 0 006.879-1.196M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <span className="block font-semibold text-sm sm:text-base">
                      Partner Assigned: {order.partner.name}
                    </span>
                    {order.partner.phone && (
                      <span className="block text-xs sm:text-sm mt-1">
                        📞 <b>Contact:</b> <a href={`tel:${order.partner.phone}`} className="underline text-blue-400">{order.partner.phone}</a>
                      </span>
                    )}
                    {order.partner.email && (
                      <span className="block text-xs sm:text-sm mt-1">
                        ✉️ <b>Email:</b> <a href={`mailto:${order.partner.email}`} className="underline text-blue-400">{order.partner.email}</a>
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Start/Complete Codes */}
              <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className={`p-3 rounded-lg border font-mono ${mobileHappy}`}>
                  <span className="block text-xs mb-1 font-medium">Happy Code (Share with Partner to begin):</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base sm:text-lg">{order.happyCode || "----"}</span>
                    <button className={`${isMobile ? "text-green-700" : "text-green-600"} p-1`} onClick={() => navigator.clipboard?.writeText(order.happyCode || "")}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border font-mono ${mobileComplete}`}>
                  <span className="block text-xs mb-1 font-medium">Complete Code (Share to mark finished):</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base sm:text-lg">{order.completeCode || "----"}</span>
                    <button className={`${isMobile ? "text-blue-700" : "text-blue-600"} p-1`} onClick={() => navigator.clipboard?.writeText(order.completeCode || "")}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Address */}
                <div className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border ${mobileSection}`}>
                  <h3 className="text-base sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 sm:h-6 sm:w-6 mr-2 ${isMobile ? "text-blue-700" : "text-indigo-600"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Delivery Address
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                      <span className={`text-xs sm:text-sm sm:w-28 ${isMobile ? "text-blue-700" : "text-gray-500"}`}>🏠 House No:</span>
                      <span className="text-sm font-medium">{order.address?.houseNumber}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                      <span className={`text-xs sm:text-sm sm:w-28 ${isMobile ? "text-blue-700" : "text-gray-500"}`}>🛣️ Street:</span>
                      <span className="text-sm font-medium break-words">{order.address?.street}</span>
                    </div>
                    {order.address?.landmark && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                        <span className={`text-xs sm:text-sm sm:w-28 ${isMobile ? "text-blue-700" : "text-gray-500"}`}>📍 Landmark:</span>
                        <span className="text-sm font-medium">{order.address.landmark}</span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                      <span className={`text-xs sm:text-sm sm:w-28 ${isMobile ? "text-blue-700" : "text-gray-500"}`}>🏷️ Type:</span>
                      <span className="text-sm font-medium">{order.address?.addressType}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                      <span className={`text-xs sm:text-sm sm:w-28 ${isMobile ? "text-blue-700" : "text-gray-500"}`}>⏰ Time Slot:</span>
                      <div className="text-sm font-medium">
                        {order.requestStatus === "NoPartner" ? (
                          editingOrderId === order._id ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                              <select
                                value={selectedTimeSlot}
                                onChange={handleTimeSlotChange}
                                className={`border rounded px-2 py-1 text-sm w-full sm:w-auto ${mobileTimeSlotSelect} ${mobileInputBorder}`}
                              >
                                <option value="">Select a time slot</option>
                                {AVAILABLE_TIME_SLOTS.map((slot) => (
                                  <option key={slot} value={slot}>{slot}</option>
                                ))}
                              </select>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                  className={`flex-1 sm:flex-none px-3 py-1 rounded ${isMobile ? "bg-green-700 text-white" : "bg-green-600 text-white"} hover:bg-green-800 text-xs`}
                                  onClick={() => handleSaveTimeSlot(order)}
                                >
                                  Save
                                </button>
                                <button
                                  className={`flex-1 sm:flex-none px-3 py-1 rounded bg-gray-400 text-gray-100 hover:bg-gray-500 text-xs`}
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span>{order.address?.timeSlot}</span>
                              <button
                                className={`self-start px-2 py-1 rounded ${isMobile ? "bg-yellow-700 text-white" : "bg-yellow-500 text-white"} hover:bg-yellow-800 text-xs`}
                                onClick={() => handleOpenTimeSlotEditor(order)}
                              >
                                Change
                              </button>
                            </div>
                          )
                        ) : (
                          order.address?.timeSlot
                        )}
                      </div>
                    </div>
                    {order.requestStatus === "NoPartner" && (
                      <div className={`mt-2 p-2 rounded text-xs border ${isMobile ? "bg-red-100 text-red-700 border-red-300" : "bg-red-50 text-red-600 border-red-200"}`}>
                        ⚠️ No partner was available in your selected time slot. Please choose a different time slot.
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className={`rounded-lg sm:rounded-xl ${mobileItemBg} p-3 sm:p-4 flex flex-col gap-3`}>
                  <h3 className={`text-base sm:text-lg font-medium mb-2 sm:mb-3 flex items-center ${isMobile ? "text-blue-700" : "text-gray-900"}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 ${isMobile ? "text-blue-700" : "text-indigo-600"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Order Items
                  </h3>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {(Array.isArray(order.items) ? order.items : []).map((item, idx) => {
                      const subTotal = getSubservicesTotal(item.subServices);
                      const totalPrice = (Number(item.price) || 0) + subTotal;

                      return (
                        <div
                          key={idx}
                          className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-5 border rounded-lg p-3 sm:p-4 ${isMobile ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"}`}
                        >
                          {/* IMAGE */}
                          <img
                            src={`${BASE_URL}/uploads/${item.imageUrl}`}
                            className="w-full h-32 sm:w-32 sm:h-32 object-cover rounded-lg border shadow"
                            alt={item.title}
                            onError={e => {
                              e.target.src = "https://via.placeholder.com/128x128?text=Service";
                            }}
                          />
                          {/* Service info */}
                          <div className="flex flex-col flex-1 justify-between">
                            <div>
                              <h4 className={`text-base sm:text-lg font-bold mb-1 ${isMobile ? "text-black" : "text-gray-800"}`}>{item.title}</h4>
                              {Array.isArray(item.subServices) && item.subServices.length > 0 && (
                                <ul className={`mb-2 mt-1 text-sm sm:text-base space-y-1 ${isMobile ? "text-blue-700" : "text-gray-700"}`}>
                                  {item.subServices.map((sub, subIdx) => (
                                    <li key={subIdx} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                                      <span className="flex-1 pr-2">{sub.title}</span>
                                      <span className="font-semibold">{sub.price && `₹${sub.price}`}</span>
                                    </li>
                                  ))}
                                  {/* Subservices total */}
                                  <li className="flex justify-between items-center pt-2 mt-2 border-t border-blue-300">
                                    <span className="font-semibold text-xs sm:text-sm text-blue-700">Subservices Total</span>
                                    <span className="font-bold text-xs sm:text-base text-blue-700">₹{subTotal}</span>
                                  </li>
                                </ul>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 pt-2">
                              <div className="flex justify-between items-end">
                                <span className={`text-xs font-medium mb-0.5 ${isMobile ? "text-blue-700" : "text-gray-500"}`}>
                                  Visiting Price
                                </span>
                                <span className={`font-bold text-lg ${isMobile ? "text-blue-700" : "text-indigo-700"}`}>₹{item.price}</span>
                              </div>
                              {/* Show total price below visiting price if subservices exist */}
                              {subTotal > 0 && (
                                <div className="flex justify-between items-end">
                                  <span className={`text-xs font-semibold ${isMobile ? "text-blue-900" : "text-indigo-700"}`}>Total (Visiting + Subservices)</span>
                                  <span className={`font-bold text-lg ${isMobile ? "text-blue-900" : "text-indigo-900"}`}>₹{totalPrice}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Cancel Button */}
               {canShowCancelBtn(order, index) && (
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 flex justify-center sm:justify-end">
                  <button
                    onClick={() => cancelOrder(order._id)}
                    className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg ${mobileCancelBtn} text-sm font-medium transition-colors flex items-center justify-center`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}