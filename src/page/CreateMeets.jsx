import React, { useEffect, useState } from "react";
import { useTheme } from "../hooks/useTheme";

const CreateMeeting = () => {
  const { theme } = useTheme();

  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [googleMeetLink, setGoogleMeetLink] = useState("");

  // Fetch Students
  const fetchStudents = async () => {
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com"))}/api/auth/users`, {
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        const onlyStudents = data.filter(
          (user) => user.role === "student"
        );
        setStudents(onlyStudents);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com"))}/api/auth/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          student,
          scheduledAt,
          googleMeetLink,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Meeting Created Successfully ✅");
        setStudent("");
        setScheduledAt("");
        setGoogleMeetLink("");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={
        theme === "light"
          ? "min-h-screen p-6 bg-gray-100 text-black"
          : "min-h-screen p-6 bg-gray-900 text-white"
      }
    >
      <div
        className={
          theme === "light"
            ? "max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md"
            : "max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-md"
        }
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Meeting
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Select Student */}
          <div>
            <label className="block mb-1 font-medium">
              Select Student
            </label>

            <select
              value={student}
              onChange={(e) => setStudent(e.target.value)}
              required
              className="w-full p-2 rounded border text-black"
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.email}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block mb-1 font-medium">
              Date & Time
            </label>

            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="w-full p-2 rounded border text-black"
            />
          </div>

          {/* Google Meet Link */}
          <div>
            <label className="block mb-1 font-medium">
              Google Meet Link
            </label>

            <input
              type="text"
              placeholder="https://meet.google.com/..."
              value={googleMeetLink}
              onChange={(e) => setGoogleMeetLink(e.target.value)}
              required
              className="w-full p-2 rounded border text-black"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 
                       text-white py-2 rounded transition"
          >
            Create Meeting
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateMeeting;
