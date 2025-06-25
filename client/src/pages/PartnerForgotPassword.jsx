import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PartnerForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const timerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await axios.post(`${BASE_URL}/api/partners/forget-password-partner`, { email });
      setMessage(res.data.message);
      setError("");
      setCooldown(300); // Start 5 min cooldown after successful send
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      // Handle cooldown from backend if provided
      if (err.response?.status === 429) {
        const remaining = err.response.data?.remaining;
        setCooldown(remaining || 300);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-600">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={cooldown > 0}
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-lg font-semibold transition ${
              cooldown > 0
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
            disabled={cooldown > 0}
          >
            {cooldown > 0
              ? `Send Reset Link (${formatTime(cooldown)})`
              : "Send Reset Link"}
          </button>
        </form>
        {cooldown > 0 && (
          <p className="mt-4 text-sm text-gray-500 text-center">
            Please wait <span className="font-semibold">{formatTime(cooldown)}</span> before requesting another reset link.
          </p>
        )}
        {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}