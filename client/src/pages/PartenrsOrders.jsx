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
  const token = localStorage.getItem("partnerToken");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/orders/partner-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("📦 Orders fetched:", res.data);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to load orders", err);
    }
  };

  const startOrder = async (id) => {
    await axios.post(`${BASE_URL}/api/orders/start/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchOrders();
  };

  const completeOrder = async (id) => {
    await axios.post(`${BASE_URL}/api/orders/complete/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFeedbackOrder(id);
    fetchOrders();
  };

  const submitFeedback = async () => {
    await axios.post(`${BASE_URL}/api/orders/feedback/${feedbackOrder}`, {
      rating,
      review,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFeedbackOrder(null);
    setRating(0);
    setReview("");
    fetchOrders();
  };

  // 🧠 Filtering logic
 const filtered = Array.isArray(orders)
  ? orders.filter((o) => {
      if (activeTab === "All") return true;
      if (activeTab === "Pending") return o.status === "Pending" || (o.status === "Confirmed" && !o.completedAt);
      if (activeTab === "Declined") return o.status === "Declined";
      if (activeTab === "Completed") return !!o.completedAt;
      return false;
    })
  : [];

  const now = moment();

  return (
    <div className="p-4 space-y-4">
      
      <h1 className="text-xl font-bold">Partner Orders</h1>

     <div className="flex gap-4 flex-wrap">
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
        const timeSlot = moment(order.address.timeSlot, "DD/MM/YYYY, h:mm A");
        const canStart = now.isAfter(moment(timeSlot).subtract(1, "minutes"));
        const canComplete = now.isAfter(moment(timeSlot).add(10, "minutes"));

        return (
          <div key={order._id} className="border p-3 rounded shadow-sm bg-white">
            <p><strong>Service:</strong> {order.items[0]?.title}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Time Slot:</strong> {order.address.timeSlot}</p>
            <p><strong>Address:</strong> {order.address.fullAddress}</p>

            <div className="flex gap-3 mt-2">
              {canStart && !order.startedAt && (
                <button
                  onClick={() => startOrder(order._id)}
                  className="bg-yellow-500 px-3 py-1 rounded text-white"
                >
                  Start
                </button>
              )}
              {canComplete && !order.completedAt && order.startedAt && (
                <button
                  onClick={() => completeOrder(order._id)}
                  className="bg-green-600 px-3 py-1 rounded text-white"
                >
                  Complete
                </button>
              )}
            </div>

            {order.completedAt && order.feedback && (
              <p className="text-sm text-gray-600 mt-2">
                ✅ Feedback: {order.feedback.rating} stars — {order.feedback.review}
              </p>
            )}
          </div>
        );
      })}

      {feedbackOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerOrders;
