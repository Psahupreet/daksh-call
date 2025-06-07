import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PartnersHome = () => {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading your details...</div>;
  if (!partner) return <div>Could not load details. Please try again.</div>;
  if (!partner.isVerified) {
    return (
      <div>
        Your account is under verification. You will be notified once you are verified.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow">
      <h2 className="text-2xl mb-4 font-bold">Welcome, {partner.name}!</h2>
      <p className="mb-2"><b>Job ID:</b> {partner.jobId}</p>
      <p className="mb-4">You are now part of the Daksh Team! 🎉</p>
      <h3 className="text-xl font-semibold mb-2">Services you provide:</h3>
      <ul className="list-disc ml-6">
        {partner.services.map((service) => (
          <li key={service.id}>{service.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default PartnersHome;