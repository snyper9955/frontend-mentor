import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com"))}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // 🔥 important
      });

      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h2>Welcome</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
