import { io } from "socket.io-client";

const socket = io((import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com")), {
  withCredentials: true,
});

export default socket;
