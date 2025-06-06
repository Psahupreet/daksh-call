import React, { useEffect, useState } from 'react';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PartnersHome = () => {
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const token = localStorage.getItem("partnerToken");
        const { data } = await axios.get(`${BASE_URL}/api/partners/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPartner(data);
      } catch (err) {
        // handle error or redirect to login
      }
    };
    fetchPartner();
  }, []);

  if (!partner) {
    return <div className="p-6">Loading your details...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow text-center mt-10">
      <h1 className="text-2xl font-bold text-green-700 mb-5">
        🎉 Welcome to the Daksh Team!
      </h1>
      <p className="text-lg font-medium text-gray-800 mb-4">
        Your account is verified. You can now provide your services on our platform.
      </p>
      <div className="mt-6 text-left space-y-2">
        <div>
          <span className="font-semibold">Service:</span>{" "}
          <span className="text-blue-700">{partner.category}</span>
        </div>
        <div>
          <span className="font-semibold">Name:</span>{" "}
          <span>{partner.name}</span>
        </div>
        <div>
          <span className="font-semibold">Job ID:</span>{" "}
          <span>{partner._id}</span>
        </div>
      </div>
    </div>
  );
};

export default PartnersHome;