import React, { useEffect, useState } from "react";
import { useTheme } from "../hooks/useTheme";

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const { theme } = useTheme();

  const fetchMeetings = async () => {
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com"))}/api/auth/meetings`, {
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setMeetings(data);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div
      className={`p-6 min-h-screen ${
        theme === "light"
          ? " bg-neutral-100 text-black"
          : " bg-neutral-950 text-white"
      }`}
    >
      <h2 className="text-2xl font-bold mb-6">My Meetings</h2>

      {meetings.length === 0 ? (
        <p className="text-gray-500">No meetings found</p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className={`w-full${
              theme === "light"
                ? "order border-neutral-300"
                : " border border-neutral-700"
            }`}
          >
            <thead
              className={
                theme === "light"
                  ? "bg-neutral-200"
                  : "bg-neutral-900"
              }
            >
              <tr>
                <th className="p-3 border">Mentor</th>
                <th className="p-3 border">Student</th>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Meet Link</th>
              </tr>
            </thead>

            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting._id}
                    className="hover:bg-neutral-300 dark:hover:bg-neutral-800 transition">

                  <td className="p-3 border">
                    {meeting.mentor?.email}
                  </td>

                  <td className="p-3 border">
                    {meeting.student?.email}
                  </td>

                  <td className="p-3 border">
                    {new Date(meeting.scheduledAt).toLocaleString()}
                  </td>

                  <td className="p-3 border">
                    {meeting.status}
                  </td>

                  <td className="p-3 border">
                    <a
                      href={meeting.googleMeetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 underline"
                    >
                      Join
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Meetings;
