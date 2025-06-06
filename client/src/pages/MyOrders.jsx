import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Available time slots for rescheduling
const AVAILABLE_TIME_SLOTS = [
  "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM",
  "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
  "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
  "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"
];

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // For rescheduling
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  // --- Step 2: Reschedule (Time Slot Change) Logic ---
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-3 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Orders</h1>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-8 sm:p-10 rounded-xl shadow-sm text-center max-w-md mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v16a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-5 text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="mt-2 text-gray-500">You haven't placed any orders yet.</p>
          <button
            onClick={() => (window.location.href = "/services")}
            className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold text-gray-800 mr-2">₹{order.totalAmount}</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : order.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Address */}
                <div className="bg-white shadow-md p-6 rounded-xl border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 text-indigo-600"
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
                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-center">
                      <span className="w-28 text-sm text-gray-500">🏠 House No:</span>
                      <span className="text-sm font-medium">{order.address?.houseNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-sm text-gray-500">🛣️ Street:</span>
                      <span className="text-sm font-medium">{order.address?.street}</span>
                    </div>
                    {order.address?.landmark && (
                      <div className="flex items-center">
                        <span className="w-28 text-sm text-gray-500">📍 Landmark:</span>
                        <span className="text-sm font-medium">{order.address.landmark}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="w-28 text-sm text-gray-500">🏷️ Type:</span>
                      <span className="text-sm font-medium">{order.address?.addressType}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-sm text-gray-500">⏰ Time Slot:</span>
                      <span className="text-sm font-medium">
                        {/* Time Slot Reschedule UI */}
                        {order.requestStatus === "NoPartner" ? (
                          editingOrderId === order._id ? (
                            <span className="flex items-center gap-2">
                              <select
                                value={selectedTimeSlot}
                                onChange={handleTimeSlotChange}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="">Select a time slot</option>
                                {AVAILABLE_TIME_SLOTS.map((slot) => (
                                  <option key={slot} value={slot}>{slot}</option>
                                ))}
                              </select>
                              <button
                                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                                onClick={() => handleSaveTimeSlot(order)}
                              >
                                Save
                              </button>
                              <button
                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              {order.address?.timeSlot}
                              <button
                                className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                                onClick={() => handleOpenTimeSlotEditor(order)}
                              >
                                Change
                              </button>
                            </span>
                          )
                        ) : (
                          order.address?.timeSlot
                        )}
                      </span>
                    </div>
                    {/* Time slot warning */}
                    {order.requestStatus === "NoPartner" && (
                      <div className="mt-2 text-xs text-red-500">
                        ⚠️ No partner was available in your selected time slot. Please choose a different time slot.
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items (shows subservices) */}
                <div className="rounded-xl shadow-md bg-white p-4 flex flex-col gap-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-600"
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
                  <div className="flex flex-col gap-4">
                    {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-5 border border-gray-100 rounded-lg p-4 bg-gray-50"
                      >
                        {/* IMAGE LEFT */}
                        <img
                          src={`${BASE_URL}/uploads/${item.imageUrl}`}
                          className="w-32 h-32 object-cover rounded-lg border shadow"
                          alt={item.title}
                          onError={e => {
                            e.target.src = "https://via.placeholder.com/128x128?text=Service";
                          }}
                        />
                        {/* RIGHT: service info, subservices, price */}
                        <div className="flex flex-col flex-1 h-full justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h4>
                            {Array.isArray(item.subServices) && item.subServices.length > 0 && (
                              <ul className="mb-2 mt-1 pl-2 text-gray-700 text-base space-y-1">
                                {item.subServices.map((sub, subIdx) => (
                                  <li key={subIdx} className="flex justify-between items-center">
                                    <span>{sub.title}</span>
                                    <span className="text-gray-800 font-semibold ml-4">₹{sub.price}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="flex flex-col items-end pt-2">
                            <span className="text-xs text-gray-500 font-medium mb-0.5">
                              Visiting Price
                            </span>
                            <span className="text-indigo-700 font-bold text-lg">₹{item.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cancel Button */}
              {order.status !== "Cancelled" && order.status !== "Completed" && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => cancelOrder(order._id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
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