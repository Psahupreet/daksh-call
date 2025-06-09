import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FiLogOut, FiHelpCircle, FiUser } from "react-icons/fi";

const BASE_URL = "http://localhost:8080";

export default function CustomerProfile() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      axios
        .get(`${BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          setUser(res.data);
        })
        .catch((err) => {
          console.error("Failed to load profile:", err);
        });
    }
  }, [isAuthenticated]);

  if (!user) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            {user.profilePicUrl ? (
              <img
                src={user.profilePicUrl}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border"
              />
            ) : (
              <FiUser className="text-blue-600 text-2xl" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
            <p className="text-gray-500">Manage your account information</p>
          </div>
        </div>

        <button className="text-blue-600 hover:text-blue-800 flex items-center">
          <FiHelpCircle className="mr-1" />
          Help
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{user.phone || "Not Provided"}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Account Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{user.location || "Not Set"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="font-medium text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {/* Edit Profile button has been removed */}
        <button
          className="flex items-center px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          onClick={logout}
        >
          <FiLogOut className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
}