import React, { useState } from "react";
import axios from "axios";
import { FiMail } from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PartnerSupportPage = () => {
  const [form, setForm] = useState({ subject: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const token = localStorage.getItem("partnerToken");
      await axios.post(`${BASE_URL}/api/partners/support`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus("sent");
      setForm({ subject: "", message: "" });
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="bg-white shadow-xl rounded-xl max-w-md w-full p-8">
        <div className="flex items-center gap-2 mb-4">
          <FiMail className="text-indigo-500 h-6 w-6" />
          <h2 className="text-xl font-bold">Partner Support</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-600">Subject</label>
            <input
              className="w-full border rounded p-2"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-600">Message</label>
            <textarea
              className="w-full border rounded p-2"
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending..." : "Send Support Request"}
          </button>
          {status === "sent" && (
            <div className="text-green-600 mt-2 text-sm">Support query sent!</div>
          )}
          {status === "error" && (
            <div className="text-red-600 mt-2 text-sm">Failed to send. Try again.</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PartnerSupportPage;