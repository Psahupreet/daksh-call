import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from "recharts";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const notificationSound = new Audio("/notificationn.mp3"); // 🔔 Add your mp3 file in public folder

export default function PartnerDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    earnings: 0,
    completedOrders: 0,
    incompleteOrders: 0,
  });

  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("partnerToken");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await axios.get(`${BASE_URL}/api/partners/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(statsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/orders/partner-pending-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Play sound only if new requests arrived
        if (Array.isArray(res.data) && res.data.length > pendingRequests.length && res.data.length > 0) {
          notificationSound.play();
        }
        setPendingRequests(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching requests", err);
      }
    };

    fetchDashboardData();
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [token, pendingRequests.length]);

  // ⏹️ Stop notification sound when no pending requests!
  useEffect(() => {
    if (pendingRequests.length === 0) {
      notificationSound.pause();
      notificationSound.currentTime = 0;
    }
  }, [pendingRequests]);

  const handleResponse = async (orderId, response) => {
    try {
      await axios.post(
        `${BASE_URL}/api/orders/respond/${orderId}`,
        { response },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Stop notification sound after accepting/declining
      notificationSound.pause();
      notificationSound.currentTime = 0;
      setPendingRequests((prev) => prev.filter((r) => r._id !== orderId));
    } catch (err) {
      console.error("Response failed:", err);
    }
  };

  const chartData = [
    { name: "Completed", value: stats.completedOrders, color: "#10B981" },
    { name: "Incomplete", value: stats.incompleteOrders, color: "#EF4444" },
  ];

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      color: "bg-blue-500",
      onClick: () => navigate("/partner-orders"),
    },
    {
      title: "Earnings",
      value: `₹${stats.earnings.toLocaleString()}`,
      color: "bg-green-500",
      onClick: () => navigate("/partner-earnings"),
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders,
      color: "bg-purple-500",
      onClick: () => navigate("/partner-orders?filter=Completed"),
    },
    {
      title: "Incomplete Orders",
      value: stats.incompleteOrders,
      color: "bg-red-500",
      onClick: () => navigate("/partner-orders?filter=Incomplete"),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Partner Dashboard</h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={card.onClick}
              className={`cursor-pointer ${card.color} text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="text-3xl mt-2 font-bold">{card.value}</p>
                </div>
              </div>
              <div className="mt-4 text-sm font-medium opacity-80">
                Click to view details →
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Order Statistics</h3>
            <div className="flex space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span className="text-sm">Incomplete</span>
              </div>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280" }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#6B7280" }} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "8px" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {pendingRequests.map((req) => (
        <div
          key={req._id}
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        >
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">New Service Request</h2>
            <p><strong>Service:</strong> {req.items?.[0]?.title}</p>
            <p><strong>Customer:</strong> {req.user?.name}</p>
            <p><strong>Address:</strong> {req.address?.fullAddress}</p>
            <p><strong>Time Slot:</strong> {req.address?.timeSlot}</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => handleResponse(req._id, "Declined")}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Decline
              </button>
              <button
                onClick={() => handleResponse(req._id, "Accepted")}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}