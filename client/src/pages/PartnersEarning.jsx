import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { FiDollarSign, FiCheckCircle, FiClock, FiAlertTriangle,FiRefreshCw , FiUser, FiMapPin, FiCalendar } from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PartnersEarning = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalEarnings, setTotalEarnings] = useState(0);

  const token = localStorage.getItem("partnerToken");

  useEffect(() => {
    fetchEarnings();
    // eslint-disable-next-line
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/api/orders/partner-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const completed = data.filter(order => order.status === "Completed");
      setOrders(completed);

      let earnings = 0;
      completed.forEach(order => {
        earnings += (order.partnerEarning || order.partnerShare || order.totalAmount || 0);
      });
      setTotalEarnings(earnings);
    } catch (err) {
      setError("Failed to load earnings. Please try again later.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Earnings</h1>
          <p className="text-gray-500 mt-1">Overview of your completed orders and earnings</p>
        </div>
        <button 
          onClick={fetchEarnings}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Earnings Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium mb-1 flex items-center gap-2">
              <FiDollarSign className="h-5 w-5" />
              Total Earnings
            </h2>
            <p className="text-blue-100">From {orders.length} completed orders</p>
          </div>
          <div className="text-3xl sm:text-4xl font-bold">₹{totalEarnings.toLocaleString()}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading your earnings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <FiAlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">Error loading earnings</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button 
              onClick={fetchEarnings}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
            <FiDollarSign className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No earnings yet</h3>
          <p className="text-gray-500">Your completed orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <div className="bg-green-100 p-1.5 rounded-full">
                    <FiCheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Completed on {order.completedAt ? moment(order.completedAt).format("MMM D, YYYY") : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                  <span className="text-green-700 font-bold">
                    +₹{(order.partnerEarning || order.partnerShare || order.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Order Details */}
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <FiUser className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</h3>
                      <p className="font-medium text-gray-800">{order.user?.name || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <FiCalendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</h3>
                      <p className="font-medium text-gray-800">{order.address?.timeSlot || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-amber-50 p-2 rounded-lg">
                      <FiClock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Placed On</h3>
                      <p className="font-medium text-gray-800">
                        {order.createdAt ? moment(order.createdAt).format("MMM D, YYYY h:mm A") : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <FiMapPin className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</h3>
                      <p className="font-medium text-gray-800 text-sm">
                        {order.address?.fullAddress?.split(",")[0] || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Service Details</h3>
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      <ul className="divide-y divide-gray-100">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-800">{item.title}</h4>
                                {item.subServices && item.subServices.length > 0 && (
                                  <ul className="mt-1 space-y-1">
                                    {item.subServices.map((sub, subIdx) => (
                                      <li key={subIdx} className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                        <span>{sub.title}</span>
                                        <span className="ml-auto font-medium">₹{sub.price}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <div className="font-bold text-green-600">₹{item.price}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 text-center text-gray-500">No service details available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnersEarning;