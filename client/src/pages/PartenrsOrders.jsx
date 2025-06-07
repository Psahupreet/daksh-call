import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PartnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showHappyCodeModal, setShowHappyCodeModal] = useState(false);
  const [showCompleteCodeModal, setShowCompleteCodeModal] = useState(false);
  const [happyCode, setHappyCode] = useState("");
  const [completeCode, setCompleteCode] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const token = localStorage.getItem("partnerToken");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/orders/partner-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setOrders([]);
    }
  };

  // Open Happy Code modal
  const handleStartClick = (orderId) => {
    setCurrentOrderId(orderId);
    setHappyCode("");
    setShowHappyCodeModal(true);
  };

  // Partner submits happy code to start order
  const startOrder = async () => {
    try {
      await axios.post(`${BASE_URL}/api/orders/start/${currentOrderId}`, { happyCode }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowHappyCodeModal(false);
      setHappyCode("");
      setCurrentOrderId(null);
      fetchOrders();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to start order.");
    }
  };

  // Open Complete Code modal
  const handleCompleteClick = (orderId) => {
    setCurrentOrderId(orderId);
    setCompleteCode("");
    setShowCompleteCodeModal(true);
  };

  // Partner submits complete code to complete order
  const completeOrder = async () => {
    try {
      await axios.post(`${BASE_URL}/api/orders/complete/${currentOrderId}`, { completeCode }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowCompleteCodeModal(false);
      setCompleteCode("");
      setCurrentOrderId(null);
      fetchOrders();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to complete order.");
    }
  };

  // Feedback: Only allow one feedback per order (partnerFeedback should be null to allow)
  const submitFeedback = async () => {
    try {
      await axios.post(`${BASE_URL}/api/orders/feedback/${feedbackOrder}`, {
        rating,
        review,
        by: "partner"
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbackOrder(null);
      setRating(0);
      setReview("");
      // Wait for backend to update, then fetch again so latest feedback is present
      setTimeout(fetchOrders, 500); // <-- wait a bit in case backend is slow
    } catch (err) {
      alert("Failed to submit feedback");
    }
  };

  // Helper: only render the map if the address is valid and non-empty!
  const getGoogleMapsEmbedUrl = (order) => {
    if (
      !order ||
      !order.address ||
      !order.address.fullAddress ||
      typeof order.address.fullAddress !== "string"
    ) {
      return null;
    }
    // Trim and check for empty string
    const base = order.address.fullAddress.trim();
    if (!base) return null;

    // Build the address for best geocoding
    const addressParts = [
      base,
      order.address.landmark ? order.address.landmark.trim() : "",
      order.address.addressType ? order.address.addressType.trim() : "",
    ].filter(Boolean);

    // If after filtering, the address is still empty, don't render
    if (addressParts.length === 0) return null;

    const query = encodeURIComponent(addressParts.join(", "));
    if (!query) return null;
    return `https://www.google.com/maps?q=${query}&output=embed`;
  };

  // Filter orders by tab
  const filtered = Array.isArray(orders)
    ? orders.filter((o) => {
        if (activeTab === "All") return true;
        if (activeTab === "Pending") return o.status === "Pending" || (o.status === "Confirmed" && !o.completedAt && !o.startedAt);
        if (activeTab === "Declined") return o.status === "Declined";
        if (activeTab === "Completed") return o.status === "Completed";
        return false;
      })
    : [];

  const now = moment();

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Partner Orders</h1>
      <div className="flex gap-4 flex-wrap mb-6">
        {["All", "Pending", "Completed", "Declined"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-gray-600 mt-4">No orders to display.</div>
      )}

      {filtered.map((order) => {
        // Time slot logic
        const timeSlotMoment = order?.address?.timeSlot
          ? moment(order.address.timeSlot, "YYYY-MM-DD [at] hh:mm A")
          : null;
        const canShowStart = timeSlotMoment && now.isAfter(moment(timeSlotMoment).subtract(5, "minutes")) && !order.startedAt;
        const canShowComplete = order.startedAt && now.isAfter(moment(order.startedAt).add(5, "minutes")) && !order.completedAt;
        // Show customer details only after accepted/started
        const hasAccepted =
          order.requestStatus === "Accepted" ||
          order.status === "processing" ||
          order.status === "Completed";

        // Only get the Google Maps URL if the address is valid and present
        const googleMapsUrl = getGoogleMapsEmbedUrl(order);

        return (
          <div key={order._id} className="border p-3 rounded shadow-sm bg-white mb-4">
            <p><strong>Service:</strong> {order.items[0]?.title}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Time Slot:</strong> {order.address.timeSlot}</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span>
                <strong>Address:</strong> {order.address.fullAddress}
                {order.address.landmark && `, Landmark: ${order.address.landmark}`}
                {order.address.addressType && ` (${order.address.addressType})`}
              </span>
            </div>
            {/* Only render the map for valid addresses */}
            {googleMapsUrl && (
              <div style={{ marginTop: 8, marginBottom: 8 }}>
                <iframe
                  title="Order Location"
                  src={googleMapsUrl}
                  width="100%"
                  height="160"
                  style={{
                    border: 0,
                    borderRadius: 8,
                    marginTop: 4,
                    minWidth: 220,
                    maxWidth: 400,
                  }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            )}

            {/* Customer info only after accept */}
            {hasAccepted && order.user && (
              <div className="mt-2 p-2 rounded bg-blue-50">
                <p><strong>Customer Name:</strong> {order.user.name}</p>
                <p><strong>Customer Email:</strong> {order.user.email}</p>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              {canShowStart && (
                <button
                  onClick={() => handleStartClick(order._id)}
                  className="bg-yellow-500 px-3 py-1 rounded text-white"
                >
                  Start
                </button>
              )}
              {canShowComplete && (
                <button
                  onClick={() => handleCompleteClick(order._id)}
                  className="bg-green-600 px-3 py-1 rounded text-white"
                >
                  Complete
                </button>
              )}
              {/* Feedback: only if order completed and partner hasn't left feedback */}
              {order.completedAt && !order.partnerFeedback && (
                <button
                  onClick={() => setFeedbackOrder(order._id)}
                  className="bg-indigo-600 px-3 py-1 rounded text-white"
                  disabled={!!order.partnerFeedback}
                >
                  Leave Feedback
                </button>
              )}
            </div>

            {/* Feedback summaries */}
            {order.completedAt && order.partnerFeedback && (
              <p className="text-sm text-gray-600 mt-2">
                ✅ Your Feedback: {order.partnerFeedback.rating} stars — {order.partnerFeedback.review}
              </p>
            )}
            {order.completedAt && order.customerFeedback && (
              <p className="text-sm text-gray-600 mt-2">
                🧑‍💼 Customer Feedback: {order.customerFeedback.rating} stars — {order.customerFeedback.review}
              </p>
            )}
          </div>
        );
      })}

      {/* Happy Code Modal */}
      {showHappyCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Enter Happy Code</h2>
            <input
              type="text"
              value={happyCode}
              onChange={e => setHappyCode(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
              placeholder="Ask customer for Happy Code"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowHappyCodeModal(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={startOrder}
                className="bg-blue-600 text-white px-3 py-1 rounded"
                disabled={!happyCode}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Code Modal */}
      {showCompleteCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Enter Complete Code</h2>
            <input
              type="text"
              value={completeCode}
              onChange={e => setCompleteCode(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
              placeholder="Ask customer for Complete Code"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCompleteCodeModal(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={completeOrder}
                className="bg-green-600 text-white px-3 py-1 rounded"
                disabled={!completeCode}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackOrder && (() => {
        // Find the current order being reviewed
        const order = orders.find(o => o._id === feedbackOrder);
        // If partnerFeedback already exists for this order, don't show feedback modal
        if (!order || order.partnerFeedback) return null;
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-xl w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-2">Submit Feedback</h2>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full mb-2 border p-1 rounded"
              >
                <option value={0}>Select Rating</option>
                <option value={1}>1 Star - Bad</option>
                <option value={2}>2 Star - Normal</option>
                <option value={3}>3 Star - Good</option>
                <option value={4}>4 Star - Very Good</option>
                <option value={5}>5 Star - Excellent</option>
              </select>
              <textarea
                placeholder="Write a short review..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full h-20 border p-2 rounded mb-3"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setFeedbackOrder(null)}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  disabled={rating === 0 || !review}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default PartnerOrders;