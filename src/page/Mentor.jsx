import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MentorList = () => {
  const [mentors, setMentors] = useState([]);
  const navigate = useNavigate();

  const fetchMentors = async () => {
    const res = await fetch(`${(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com"))}/api/auth/mentors`, {
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok) {
      setMentors(data);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Mentors</h2>

      {mentors.map((mentor) => (
        <div
          key={mentor._id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <p>Name: {mentor.name}</p>
          <p>Email: {mentor.email}</p>

          <button
            onClick={() =>
              navigate(`/book-meeting/${mentor._id}`)
            }
          >
            Book Meeting
          </button>
        </div>
      ))}
    </div>
  );
};

export default MentorList;
