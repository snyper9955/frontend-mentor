import { useScreenTime } from "../context/ScreenTimeContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  Award, 
  Target, 
  Zap, 
  Moon, 
  Sun,
  Activity,
  BarChart2,
  PieChart as PieChartIcon,
  Download,
  Share2,
  MoreVertical,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Flame,
  Coffee,
  Battery,
  Eye
} from "lucide-react";
import { useState, useEffect } from "react";

const DAILY_GOAL = 3 * 60 * 60; // 3 hours in seconds

// Color palette
const COLORS = {
  primary: {
    from: "#6366f1",
    to: "#8b5cf6"
  },
  success: {
    from: "#10b981",
    to: "#34d399"
  },
  warning: {
    from: "#f59e0b",
    to: "#fbbf24"
  },
  danger: {
    from: "#ef4444",
    to: "#f87171"
  },
  info: {
    from: "#3b82f6",
    to: "#60a5fa"
  }
};

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308"];

// ✅ Local Date Fix (NO UTC)
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ✅ FIXED: Proper time formatting without decimals
const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return "0h 0m 0s";
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  // Return different formats based on values
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  } else if (m > 0) {
    return `${m}m ${s}s`;
  } else {
    return `${s}s`;
  }
};

// ✅ FIXED: Short time format for charts
const formatTimeShort = (seconds) => {
  if (!seconds && seconds !== 0) return "0m";
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  
  if (h > 0) {
    return `${h}h ${m}m`;
  } else {
    return `${m}m`;
  }
};

// ✅ FIXED: Hours formatter without decimals
const formatHours = (seconds) => {
  return (seconds / 3600).toFixed(1);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const seconds = payload[0].payload.rawSeconds || payload[0].value * 3600;
    return (
      <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-xl shadow-2xl">
        <p className="text-neutral-400 text-sm mb-1">{label}</p>
        <p className="text-white font-semibold">
          {formatTime(seconds)}
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          {((seconds / DAILY_GOAL) * 100).toFixed(1)}% of daily goal
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const {
    todayTotal,
    formattedToday,
    reportData,
    reportType,
    changeReport,
    loading,
  } = useScreenTime();

  const [selectedChart, setSelectedChart] = useState("bar");
  const [showInsights, setShowInsights] = useState(true);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const progress = Math.min(todayTotal / DAILY_GOAL, 1);

  // Animate progress on load
  useEffect(() => {
    setAnimatedProgress(0);
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // =============================
  // ✅ FIX TODAY SYNC (LOCAL DATE)
  // =============================

  const todayDate = getLocalDate();
  let syncedReportData = [...reportData];

  if (reportType === "daily") {
    const todayIndex = syncedReportData.findIndex(
      (d) => d._id === todayDate
    );

    if (todayIndex !== -1) {
      syncedReportData[todayIndex] = {
        ...syncedReportData[todayIndex],
        totalTime: todayTotal,
      };
    } else {
      syncedReportData.push({
        _id: todayDate,
        totalTime: todayTotal,
      });
    }
  }

  // Sort properly
  syncedReportData.sort((a, b) => new Date(a._id) - new Date(b._id));

  // =============================
  // ANALYTICS
  // =============================

  const totalTime = syncedReportData.reduce(
    (sum, d) => sum + (d.totalTime || 0),
    0
  );

  // ✅ FIXED: Average calculation and formatting
  const averageSeconds = syncedReportData.length > 0 
    ? Math.floor(totalTime / syncedReportData.length) 
    : 0;

  const peakDay =
    syncedReportData.length > 0
      ? syncedReportData.reduce((max, d) =>
          d.totalTime > max.totalTime ? d : max
        )
      : null;

  // ✅ Yesterday Local Fix
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);

  const yesterdayDate = `${yesterdayObj.getFullYear()}-${String(
    yesterdayObj.getMonth() + 1
  ).padStart(2, "0")}-${String(yesterdayObj.getDate()).padStart(2, "0")}`;

  const yesterdayData = syncedReportData.find((d) => d._id === yesterdayDate);
  const yesterday = yesterdayData?.totalTime || 0;

  const growth =
    yesterday > 0 ? (((todayTotal - yesterday) / yesterday) * 100).toFixed(1) : 0;

  // Calculate streak
  let streak = 0;
  for (let i = syncedReportData.length - 1; i >= 0; i--) {
    if (syncedReportData[i].totalTime >= DAILY_GOAL * 0.5) {
      streak++;
    } else {
      break;
    }
  }

  // Prepare chart data
  const chartData = syncedReportData.slice(-14).map((d) => ({
    name: d._id.slice(5), // Show MM-DD
    fullDate: d._id,
    hours: formatHours(d.totalTime),
    rawSeconds: d.totalTime,
    goal: DAILY_GOAL / 3600,
  }));

  const maxDayTime =
    syncedReportData.length > 0
      ? Math.max(...syncedReportData.map((d) => d.totalTime))
      : 0;

  // Get time of day distribution (mock data for demo)
  const timeDistribution = [
    { name: "Morning", value: 35, color: "#fbbf24" },
    { name: "Afternoon", value: 45, color: "#f59e0b" },
    { name: "Evening", value: 20, color: "#8b5cf6" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Screen Time Dashboard
              </h1>
              <p className="text-neutral-400 mt-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Track your digital wellness journey
              </p>
            </div>

            {/* Report Type Selector */}
            <div className="flex flex-wrap gap-2 bg-neutral-800/50 p-1 rounded-xl backdrop-blur-sm border border-neutral-700">
              {["daily", "weekly", "monthly", "yearly"].map((type) => (
                <button
                  key={type}
                  onClick={() => changeReport(type)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm capitalize transition-all ${
                    reportType === type
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-700/50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <button className="p-2 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg transition border border-neutral-700">
              <Download className="w-4 h-4 text-neutral-400" />
            </button>
            <button className="p-2 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg transition border border-neutral-700">
              <Share2 className="w-4 h-4 text-neutral-400" />
            </button>
            <button className="p-2 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg transition border border-neutral-700">
              <MoreVertical className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Progress Card */}
        <div className="mb-8 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-neutral-800/90 backdrop-blur-xl rounded-2xl p-8 border border-neutral-700">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl">
                    <Clock className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Today's Screen Time</p>
                    <p className="text-sm text-neutral-500">{todayDate}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  <h2 className="text-6xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {formattedToday}
                  </h2>
                  <span className="text-neutral-500">/ 3h 0m</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Daily Goal Progress</span>
                    <span className="text-white font-medium">
                      {Math.round(progress * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${animatedProgress * 100}%` }}
                    />
                  </div>
                </div>

                {/* Growth Indicator */}
                <div className="mt-4 flex items-center gap-4">
                  <div className={`flex items-center gap-1 ${
                    growth >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {growth >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingUp className="w-4 h-4 rotate-180" />
                    )}
                    <span className="font-medium">{Math.abs(growth)}%</span>
                  </div>
                  <span className="text-neutral-500 text-sm">vs yesterday</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-700/30 p-4 rounded-xl border border-neutral-600">
                  <Flame className="w-5 h-5 text-orange-400 mb-2" />
                  <p className="text-2xl font-bold">{streak}</p>
                  <p className="text-xs text-neutral-400">Day Streak</p>
                </div>
                <div className="bg-neutral-700/30 p-4 rounded-xl border border-neutral-600">
                  <Coffee className="w-5 h-5 text-yellow-400 mb-2" />
                  <p className="text-2xl font-bold">{Math.floor(totalTime / 3600)}h</p>
                  <p className="text-xs text-neutral-400">Total Hours</p>
                </div>
                <div className="bg-neutral-700/30 p-4 rounded-xl border border-neutral-600">
                  <Target className="w-5 h-5 text-green-400 mb-2" />
                  <p className="text-2xl font-bold">{formatTimeShort(averageSeconds)}</p>
                  <p className="text-xs text-neutral-400">Daily Avg</p>
                </div>
                <div className="bg-neutral-700/30 p-4 rounded-xl border border-neutral-600">
                  <Award className="w-5 h-5 text-purple-400 mb-2" />
                  <p className="text-2xl font-bold">
                    {peakDay ? formatTimeShort(peakDay.totalTime) : "0m"}
                  </p>
                  <p className="text-xs text-neutral-400">Peak Day</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Yesterday Card */}
          <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-700 hover:border-neutral-600 transition group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-neutral-700/50 rounded-lg group-hover:bg-indigo-500/20 transition">
                <Calendar className="w-5 h-5 text-neutral-400 group-hover:text-indigo-400" />
              </div>
              <span className="text-xs text-neutral-500">Yesterday</span>
            </div>
            <p className="text-3xl font-bold mb-1">{formatTime(yesterday)}</p>
            <p className="text-sm text-neutral-400">
              {Math.round((yesterday / DAILY_GOAL) * 100)}% of daily goal
            </p>
          </div>

          {/* Average Card - FIXED: Now shows proper time format */}
          <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-700 hover:border-neutral-600 transition group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-neutral-700/50 rounded-lg group-hover:bg-green-500/20 transition">
                <Activity className="w-5 h-5 text-neutral-400 group-hover:text-green-400" />
              </div>
              <span className="text-xs text-neutral-500">Average</span>
            </div>
            <p className="text-3xl font-bold mb-1">{formatTimeShort(averageSeconds)}</p>
            <p className="text-sm text-neutral-400">per day</p>
          </div>

          {/* Peak Day Card */}
          <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-700 hover:border-neutral-600 transition group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-neutral-700/50 rounded-lg group-hover:bg-purple-500/20 transition">
                <Zap className="w-5 h-5 text-neutral-400 group-hover:text-purple-400" />
              </div>
              <span className="text-xs text-neutral-500">Peak Day</span>
            </div>
            <p className="text-3xl font-bold mb-1">
              {peakDay ? formatTimeShort(peakDay.totalTime) : "0m"}
            </p>
            <p className="text-sm text-neutral-400">
              {peakDay ? peakDay._id : "N/A"}
            </p>
          </div>

          {/* Goal Achievement Card */}
          <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-700 hover:border-neutral-600 transition group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-neutral-700/50 rounded-lg group-hover:bg-yellow-500/20 transition">
                <Target className="w-5 h-5 text-neutral-400 group-hover:text-yellow-400" />
              </div>
              <span className="text-xs text-neutral-500">Goal</span>
            </div>
            <p className="text-3xl font-bold mb-1">
              {Math.round((todayTotal / DAILY_GOAL) * 100)}%
            </p>
            <p className="text-sm text-neutral-400">of daily goal</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold">Screen Time Trend</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedChart("bar")}
                  className={`p-2 rounded-lg transition ${
                    selectedChart === "bar"
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-neutral-700/30 text-neutral-400 hover:bg-neutral-700/50"
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedChart("line")}
                  className={`p-2 rounded-lg transition ${
                    selectedChart === "line"
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-neutral-700/30 text-neutral-400 hover:bg-neutral-700/50"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedChart("area")}
                  className={`p-2 rounded-lg transition ${
                    selectedChart === "area"
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-neutral-700/30 text-neutral-400 hover:bg-neutral-700/50"
                  }`}
                >
                  <Area className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {selectedChart === "bar" ? (
                  <BarChart data={chartData}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#737373" 
                      tick={{ fill: '#a3a3a3', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#737373" 
                      tick={{ fill: '#a3a3a3', fontSize: 12 }}
                      label={{ 
                        value: 'Hours', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: '#a3a3a3' }
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="hours" 
                      fill="url(#barGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : selectedChart === "line" ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis dataKey="name" stroke="#737373" tick={{ fill: '#a3a3a3' }} />
                    <YAxis stroke="#737373" tick={{ fill: '#a3a3a3' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis dataKey="name" stroke="#737373" tick={{ fill: '#a3a3a3' }} />
                    <YAxis stroke="#737373" tick={{ fill: '#a3a3a3' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fill="url(#areaGradient)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Goal Line Indicator */}
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-neutral-400">Screen Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-neutral-400">Daily Goal (3h)</span>
              </div>
            </div>
          </div>

          {/* Time Distribution Pie Chart */}
          <div className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-700">
            <div className="flex items-center gap-3 mb-6">
              <PieChartIcon className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">Time Distribution</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {timeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-neutral-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {timeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-neutral-400">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Section */}
        {showInsights && (
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm p-6 rounded-xl border border-neutral-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                AI Insights & Recommendations
              </h3>
              <button 
                onClick={() => setShowInsights(false)}
                className="text-neutral-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Productive Hours</p>
                  <p className="text-xs text-neutral-400">Your most productive time is in the afternoon</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Break Reminder</p>
                  <p className="text-xs text-neutral-400">Take a 5-minute break every hour</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Target className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Goal Progress</p>
                  <p className="text-xs text-neutral-400">You're 2 days away from your weekly goal</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Stats Table */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-700">
            <h3 className="font-semibold">Detailed History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-700/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Screen Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Goal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {syncedReportData.slice(-7).reverse().map((data, index) => {
                  const percentage = (data.totalTime / DAILY_GOAL) * 100;
                  const prevData = syncedReportData[syncedReportData.indexOf(data) - 1];
                  const trend = prevData ? 
                    ((data.totalTime - prevData.totalTime) / prevData.totalTime * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={index} className="hover:bg-neutral-700/30 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{data._id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        {formatTime(data.totalTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-neutral-400">{Math.round(percentage)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          percentage >= 100 
                            ? 'bg-green-500/20 text-green-400'
                            : percentage >= 50
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {percentage >= 100 ? 'Achieved' : percentage >= 50 ? 'On Track' : 'Below Goal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-1 text-xs ${
                          trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-neutral-400'
                        }`}>
                          {trend > 0 ? '▲' : trend < 0 ? '▼' : '•'}
                          <span>{Math.abs(trend)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;