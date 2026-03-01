import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // 🔥 all users here
  const [loading, setLoading] = useState(true);

  const API = `${(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com"))}/api`;

  // ================= LOAD AUTH USER =================
  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        // ✅ Get Logged In User
        const meRes = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(meRes.data);

        // ✅ Get All Users
        const usersRes = await axios.get(`${API}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(usersRes.data);

      } catch (error) {
        console.log("Auth validation failed");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }

      setLoading(false);
    };

    fetchAuthData();
  }, []);

  // ================= LOGIN =================
  const login = async (userData, token) => {
    if (!userData || !token) {
      console.error("❌ Login failed: Missing user or token");
      return;
    }

    localStorage.setItem("token", token);

    setUser(userData);

    // 🔥 Immediately fetch all users after login
    try {
      const usersRes = await axios.get(`${API}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(usersRes.data);
    } catch (err) {
      console.log("Failed to fetch users after login");
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setUsers([]);
  };

  return (
    <AuthContext.Provider
      value={{ user, users, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
