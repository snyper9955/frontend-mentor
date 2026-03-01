import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

const ActivityChart = () => {
  const [data, setData] = useState([]);

useEffect(() => {
  const fetchActivity = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/weekly", {
        withCredentials: true,
      });

      console.log("Response:", res.data);

      const activityArray =
        Array.isArray(res.data)
          ? res.data
          : res.data.data || res.data.weeklyData || [];

      const formattedData = activityArray.map((item) => ({
        date: item._id,
        minutes: Math.round((item.totalTime || 0) / 60),
      }));

      setData(formattedData);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
    }
  };

  fetchActivity();
}, []);

  return (
    <div className="bg-white p-5 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Weekly Study Time</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="minutes" stroke="#4f46e5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;