import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const ScreenTimeContext = createContext();

export const ScreenTimeProvider = ({ children }) => {
  const [todayTotal, setTodayTotal] = useState(0);
  const [reportData, setReportData] = useState([]);
  const [reportType, setReportType] = useState("daily");

  // ✅ NEW STATES
  const [dayWiseData, setDayWiseData] = useState([]);
  const [dayWiseSummary, setDayWiseSummary] = useState(null);

  const sessionRef = useRef(0);
  const location = useLocation();

  const API = `${(import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://backend-mentor.onrender.com"))}/api/activity`;

  // ==============================
  // Format Time
  // ==============================
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // ==============================
  // Fetch Today
  // ==============================
  const fetchToday = async () => {
    try {
      const res = await axios.get(`${API}/today`, {
        withCredentials: true,
      });
      setTodayTotal(res.data.totalTime || 0);
    } catch (err) {
      console.error("Today fetch error", err);
    }
  };

  // ==============================
  // Fetch Report (daily/weekly/monthly/yearly)
  // ==============================
  const fetchReport = async (type = reportType) => {
    try {
      const res = await axios.get(`${API}/report/${type}`, {
        withCredentials: true,
      });

      setReportData(res.data.data || []);
      setReportType(type);
    } catch (err) {
      console.error("Report fetch error", err);
    }
  };

  // ==============================
  // ✅ Fetch Day Wise Report (ALL PREVIOUS DAYS)
  // ==============================
  const fetchDayWiseReport = async () => {
    try {
      const res = await axios.get(`${API}/day-wise-report`, {
        withCredentials: true,
      });

      setDayWiseData(res.data.data || []);
      setDayWiseSummary(res.data.summary || null);
    } catch (err) {
      console.error("Day wise fetch error", err);
    }
  };

  // ==============================
  // UPDATE (Increment Today)
  // ==============================
  const updateTime = async (seconds) => {
    try {
      const res = await axios.post(
        `${API}/update`,
        { seconds },
        { withCredentials: true }
      );

      if (res.data.totalTime !== undefined) {
        setTodayTotal(res.data.totalTime);
      }
    } catch (err) {
      console.error("Update error", err);
    }
  };

  // ==============================
  // SAVE (Full Session Entry)
  // ==============================
  const saveSession = async (seconds) => {
    try {
      await axios.post(
        `${API}/save`,
        { timeSpent: seconds },
        { withCredentials: true }
      );

      fetchToday();
      fetchReport();
      fetchDayWiseReport(); // ✅ refresh day wise
    } catch (err) {
      console.error("Save error", err);
    }
  };

  // ==============================
  // Start Timer
  // ==============================
  useEffect(() => {
    fetchToday();
    fetchReport("daily");
    fetchDayWiseReport(); // ✅ load all previous days on start

    const interval = setInterval(() => {
      if (!document.hidden) {
        sessionRef.current += 1;
        setTodayTotal((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ==============================
  // Auto Save Every 30 sec
  // ==============================
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (sessionRef.current >= 30) {
        updateTime(30);
        sessionRef.current -= 30;
      }
    }, 30000);

    return () => clearInterval(autoSave);
  }, []);

  // ==============================
  // Flush Remaining Time
  // ==============================
  const flushSession = async () => {
    if (sessionRef.current > 0) {
      await saveSession(sessionRef.current);
      sessionRef.current = 0;
    }
  };

  // Route change save
  useEffect(() => {
    flushSession();
  }, [location.pathname]);

  // Tab hidden save
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        flushSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Browser close save
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionRef.current > 0) {
        navigator.sendBeacon(
          `${API}/save`,
          JSON.stringify({ timeSpent: sessionRef.current })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <ScreenTimeContext.Provider
      value={{
        todayTotal,
        formattedToday: formatTime(todayTotal),

        reportData,
        reportType,
        changeReport: fetchReport,

        // ✅ NEW VALUES
        dayWiseData,
        dayWiseSummary,
        refreshDayWise: fetchDayWiseReport,
      }}
    >
      {children}
    </ScreenTimeContext.Provider>
  );
};

export const useScreenTime = () => useContext(ScreenTimeContext);
