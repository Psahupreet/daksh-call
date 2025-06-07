import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUser, FiCheckCircle, FiClock, FiAlertCircle, FiBriefcase } from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PartnersHome = () => {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const token = localStorage.getItem("partnerToken");
        const res = await axios.get(`${BASE_URL}/api/partners/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPartner(res.data);
      } catch (err) {
        setPartner(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-800">Loading your details...</h3>
          <p className="text-gray-500 mt-1">Please wait while we fetch your information</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FiAlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">Could not load details</h3>
          <p className="text-gray-500 mt-2">Please try again or contact support if the problem persists</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!partner.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <FiClock className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">Account Verification Pending</h3>
          <p className="text-gray-500 mt-2">
            Your account is under verification. We'll notify you via email once you're verified.
          </p>
          <div className="mt-6 bg-blue-50 rounded-lg p-4 text-left">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> This process typically takes 1-2 business days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {partner.name}!</h1>
                <p className="mt-2 opacity-90">You are now part of the Daksh Team! 🎉</p>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white bg-opacity-20">
                  <FiUser className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Partner Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiUser className="text-indigo-500" />
                  Partner Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Job ID</p>
                    <p className="font-medium text-gray-800">{partner.jobId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center gap-1">
                      <FiCheckCircle className="text-green-500" />
                      <span className="font-medium text-green-600">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiBriefcase className="text-indigo-500" />
                  Your Services
                </h3>
                <ul className="space-y-2">
                  {partner.category && (
                    <li className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-xs border border-gray-100">
                      <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                      <span className="font-medium text-gray-800">{partner.category}</span>
                      <span className="ml-2 text-xs text-gray-400">(Main Category)</span>
                    </li>
                  )}
                  {(partner.services || []).map((service, i) => (
                    <li
                      key={service.id || service._id || service || i}
                      className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-xs border border-gray-100"
                    >
                      <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
                      <span className="font-medium text-gray-800">{service.name || service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-indigo-300 hover:shadow-sm transition-all"
                  onClick={() => navigate("/partner-orders")}
                >
                  <h4 className="font-medium text-gray-800">View Schedule</h4>
                  <p className="text-sm text-gray-500 mt-1">Check your upcoming appointments</p>
                </button>
                <button
                  className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-indigo-300 hover:shadow-sm transition-all"
                  onClick={() => navigate("/partner-update-profile")}
                >
                  <h4 className="font-medium text-gray-800">Update Profile</h4>
                  <p className="text-sm text-gray-500 mt-1">Edit your personal details</p>
                </button>
                <button
                  className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-indigo-300 hover:shadow-sm transition-all"
                  onClick={() => navigate("/PartnerSupport-page")}
                >
                  <h4 className="font-medium text-gray-800">Support</h4>
                  <p className="text-sm text-gray-500 mt-1">Get help from our team</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersHome;