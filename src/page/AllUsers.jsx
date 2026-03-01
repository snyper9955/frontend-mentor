import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

const UsersPage = () => {
    const { theme } = useTheme();
  
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `${(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com"))}/api/auth/users`,
          { withCredentials: true }
        );
        setUsers(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className={`min-h-screen p-6 ${
        theme === "light"
          ? " bg-neutral-100 text-black min-h-screen"
          : " bg-neutral-950 text-white min-h-screen"
      }`}>
      <h1 className="text-3xl font-bold mb-6">All Members</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => navigate(`/profile/${user._id}`)}
            className={`cursor-pointer ${
        theme === "light"
          ? " bg-neutral-100 text-black"
          : " bg-neutral-900 text-white "
      } shadow-md rounded-xl p-5 hover:shadow-xl transition`}
          >
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-500">@{user.username}</p>

            <span className={`inline-block mt-3 px-3 py-1 text-sm rounded-full ${
              user.role === "mentor"
                ? "bg-neutral-700 text-green-400"
                : "bg-neutral-700 text-yellow-400"
            }`}>
              {user.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;
