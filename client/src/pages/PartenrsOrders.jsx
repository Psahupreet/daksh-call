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
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("partnerToken");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/orders/partner-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartClick = (orderId) => {
    setCurrentOrderId(orderId);
    setHappyCode("");
    setShowHappyCodeModal(true);
  };

  const startOrder = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/orders/start/${currentOrderId}`,
        { happyCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowHappyCodeModal(false);
      setHappyCode("");
      setCurrentOrderId(null);
      fetchOrders();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to start order.");
    }
  };

  const handleCompleteClick = (orderId) => {
    setCurrentOrderId(orderId);
    setCompleteCode("");
    setShowCompleteCodeModal(true);
  };

  const completeOrder = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/orders/complete/${currentOrderId}`,
        { completeCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCompleteCodeModal(false);
      setCompleteCode("");
      setCurrentOrderId(null);
      fetchOrders();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to complete order.");
    }
  };

  const submitFeedback = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/orders/feedback/${feedbackOrder}`,
        {
          rating,
          review,
          by: "partner"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbackOrder(null);
      setRating(0);
      setReview("");
      fetchOrders();
    } catch (err) {
      alert("Failed to submit feedback");
    }
  };

  const getGoogleMapsEmbedUrl = (order) => {
    if (
      !order ||
      !order.address ||
      !order.address.fullAddress ||
      typeof order.address.fullAddress !== "string"
    ) {
      return null;
    }
    const base = order.address.fullAddress.trim();
    if (!base) return null;

    const addressParts = [
      base,
      order.address.landmark ? order.address.landmark.trim() : "",
      order.address.addressType ? order.address.addressType.trim() : "",
    ].filter(Boolean);

    if (addressParts.length === 0) return null;

    const query = encodeURIComponent(addressParts.join(", "));
    if (!query) return null;
    return `https://www.google.com/maps?q=${query}&output=embed`;
  };

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

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Confirmed: "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
    Declined: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["All", "Pending", "Completed", "Declined"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-gray-500">
              {activeTab === "All" 
                ? "You don't have any orders yet." 
                : `You don't have any ${activeTab.toLowerCase()} orders.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const timeSlotMoment = order?.address?.timeSlot
                ? moment(order.address.timeSlot, "YYYY-MM-DD [at] hh:mm A")
                : null;
              const canShowStart = timeSlotMoment && now.isAfter(moment(timeSlotMoment).subtract(5, "minutes")) && !order.startedAt;
              const canShowComplete = order.startedAt && now.isAfter(moment(order.startedAt).add(5, "minutes")) && !order.completedAt;
              const hasAccepted =
                order.requestStatus === "Accepted" ||
                order.status === "processing" ||
                order.status === "Completed";
              const googleMapsUrl = getGoogleMapsEmbedUrl(order);

              return (
                <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {order.items[0]?.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700">{order.address.timeSlot}</span>
                          </div>
                          
                          <div className="flex items-start">
                            <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div>
                              <span className="text-gray-700">{order.address.fullAddress}</span>
                              {order.address.landmark && (
                                <p className="text-sm text-gray-500">Landmark: {order.address.landmark}</p>
                              )}
                              {order.address.addressType && (
                                <p className="text-sm text-gray-500">Type: {order.address.addressType}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Customer info only after accept */}
                        {hasAccepted && order.user && (
                          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                            <h4 className="font-medium text-blue-800 mb-1">Customer Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center">
                                <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{order.user.name}</span>
                              </div>
                              <div className="flex items-center">
                                <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>{order.user.email}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Map */}
                      {googleMapsUrl && (
                        <div className="w-full md:w-64 h-48 rounded-lg overflow-hidden border border-gray-200">
                          <iframe
                            title="Order Location"
                            src={googleMapsUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          ></iframe>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {canShowStart && (
                        <button
                          onClick={() => handleStartClick(order._id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Start Order
                        </button>
                      )}
                      {canShowComplete && (
                        <button
                          onClick={() => handleCompleteClick(order._id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Complete Order
                        </button>
                      )}
                      {order.completedAt && !order.partnerFeedback && (
                        <button
                          onClick={() => setFeedbackOrder(order._id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Leave Feedback
                        </button>
                      )}
                    </div>
                    
                    {/* Feedback summaries */}
                    {(order.completedAt && (order.partnerFeedback || order.customerFeedback)) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback</h4>
                        {order.partnerFeedback && (
                          <div className="mb-2">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-700 mr-2">Your feedback:</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`h-4 w-4 ${i < order.partnerFeedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            {order.partnerFeedback.review && (
                              <p className="text-sm text-gray-600 mt-1">"{order.partnerFeedback.review}"</p>
                            )}
                          </div>
                        )}
                        {order.customerFeedback && (
                          <div>
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-700 mr-2">Customer feedback:</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`h-4 w-4 ${i < order.customerFeedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            {order.customerFeedback.review && (
                              <p className="text-sm text-gray-600 mt-1">"{order.customerFeedback.review}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Happy Code Modal */}
      {showHappyCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Start Order</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">Please ask the customer for their Happy Code to begin the service.</p>
              <input
                type="text"
                value={happyCode}
                onChange={e => setHappyCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Happy Code"
                autoFocus
              />
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowHappyCodeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={startOrder}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={!happyCode}
              >
                Confirm Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Code Modal */}
      {showCompleteCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-green-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Complete Order</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">Please ask the customer for their Complete Code to finish the service.</p>
              <input
                type="text"
                value={completeCode}
                onChange={e => setCompleteCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter Complete Code"
                autoFocus
              />
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowCompleteCodeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                onClick={completeOrder}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                disabled={!completeCode}
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Leave Feedback</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`h-8 w-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                  Review
                </label>
                <textarea
                  id="review"
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Share your experience with this customer..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setFeedbackOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={rating === 0 || !review}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerOrders;