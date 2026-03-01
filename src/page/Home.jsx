import React, { useEffect, useState } from "react";
import Logout from "../components/Logout";
import { useTheme } from "../hooks/useTheme";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const fetchUser = async () => {
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com"))}/api/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen ">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`p-6 pt-20 ${
        theme === "light"
          ? " bg-neutral-100 text-black min-h-screen"
          : " bg-neutral-950 text-white min-h-screen"
      }`}
    >
      {user ? (
        <div
          className={`p-6${
            theme === "light"
              ? " rounded-lg shadow-md bg-neutral-200"
              : " rounded-lg shadow-md bg-neutral-900"
          }`}
        >
          <h2 className="text-2xl font-bold mb-3">
            Welcome <span className="text-blue-500">{user.name}</span>
          </h2>

          <p className="mb-1">
            <strong>Email:</strong> {user.email}
          </p>

          <p className="mb-4">
            <strong>Role:</strong> {user.role}
          </p>
        

         
        </div>

      ) : (
        <div className="text-center">
          <p className="text-red-500 text-lg">Please login first</p>
            <Link to={'/register'} className="px-2 sm:px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm transition">Register </Link>

        
        </div>
      )}
    </div>
  );
};

export default Home;
