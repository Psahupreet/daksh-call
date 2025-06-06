import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous error

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, form);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setIsAuthenticated(true);
      setUser(user);

      navigate("/");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Server error";
      setError(msg); // Display detailed error from backend
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg mt-10 rounded">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 border rounded"
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>

      <div className="flex justify-between mt-4 text-sm">
        <Link to="/forgot-password" className="text-blue-600 hover:underline">
          Forgot Password?
        </Link>
        <Link to="/signup" className="text-blue-600 hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
