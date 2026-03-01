import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com"))}/api/auth/me`,
          { withCredentials: true }
        );

        setUser(res.data);
      }catch (err) {
  console.error("Error fetching user:", err.response?.data || err.message);
}
    };

    fetchUser();
  }, [id]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold">{user.name}</h2>
        <p className="text-gray-500">@{user.username}</p>
        <p>{user.email}</p>

        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
          {user.role}
        </span>
<Link to={`/chat/${user._id}`}>
  <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
    Message
  </button>
</Link>
     
      </div>
    </div>
  );
};

export default UserProfile;
