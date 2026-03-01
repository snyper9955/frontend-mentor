import { useState } from "react";
import axios from "axios";

const ProfileCard = ({ user }) => {
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/messages",
        {
          receiver: user._id,
          text: message,
        },
        { withCredentials: true }
      );

      alert("Message Sent!");
      setMessage("");
    } catch (error) {
      alert("Error sending message");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold">{user.name}</h2>
      <p className="text-gray-600">@{user.username}</p>
      <p className="text-gray-600">{user.email}</p>
      <p className="text-sm mt-2 bg-blue-100 text-blue-700 inline-block px-3 py-1 rounded-full">
        {user.role}
      </p>

      <div className="mt-4">
        <textarea
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Write your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={sendMessage}
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Message
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;