import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../context/AuthContext"; // ✅ Import AuthContext

const Login = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { login } = useAuth(); // ✅ Get login function

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ LOGIN FUNCTION
  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ IMPORTANT: Save user + token
      if (data.user && data.token) {
        login(data.user, data.token);
      }

      // ✅ Redirect after login
      navigate("/");

    } catch (err) {
      console.error("Login Error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={
        theme === "light"
          ? "min-h-screen flex items-center justify-center bg-gray-100"
          : "min-h-screen flex items-center justify-center bg-gray-900"
      }
    >
      <form
        onSubmit={loginUser}
        className={
          theme === "light"
            ? "bg-white p-8 rounded-lg shadow-md w-96"
            : "bg-gray-800 p-8 rounded-lg shadow-md w-96 text-white"
        }
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        {/* Error Message */}
        {error && (
          <p className="bg-red-200 text-red-700 p-2 rounded mb-3">
            {error}
          </p>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 rounded border text-black"
          required
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded border text-black"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-blue-500">
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;