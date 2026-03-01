import React, { useState, useEffect } from "react";
import { useTheme } from "../hooks/useTheme";

const Register = () => {
  const { theme } = useTheme();

  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com"))}/api/auth/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.log(err);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com"))}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          username,
          role,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("User Registered Successfully ✅");

        // Reset Form
        setName("");
        setEmail("");
        setPassword("");
        setUsername("");
        setRole("student");

        fetchData();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div
      className={
        theme === "light"
          ? "min-h-screen flex items-center justify-center bg-gray-100"
          : "min-h-screen flex items-center justify-center bg-gray-900 text-white"
      }
    >
      <form
        onSubmit={createUser}
        className={
          theme === "light"
            ? "bg-white p-8 rounded-lg shadow-md w-96"
            : "bg-gray-800 p-8 rounded-lg shadow-md w-96"
        }
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Register
        </h2>

        {/* Error */}
        {error && (
          <p className="bg-red-200 text-red-700 p-2 rounded mb-3">
            {error}
          </p>
        )}

        {/* Inputs */}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-3 rounded border text-black"
          required
        />

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-3 rounded border text-black"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 rounded border text-black"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-3 rounded border text-black"
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 mb-4 rounded border text-black"
        >
          <option value="student">Student</option>
          <option value="mentor">Mentor</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 
                     text-white py-2 rounded transition 
                     disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
