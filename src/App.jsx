import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScreenTimeProvider } from "./context/ScreenTimeContext"; // 👈 Import the provider

import Register from "./page/Register";
import Login from "./page/Login";
import Home from "./page/Home";
import ForgotPassword from "./page/ForgetPassword";
import ResetPassword from "./page/ResetPassword";
import Meetings from "./page/Meetings";
import CreateMeeting from "./page/CreateMeets";
import MentorList from "./page/Mentor";
import BookMeeting from "./page/BookMeeting";
import Dashboard from "./page/Dashboard";
import UserProfile from "./page/ProfilePage";
import UsersPage from "./page/AllUsers";
import ChatPage from "./page/ChatPage";

import Layout from "./Layout"; // 👈 Your layout with navbar
import SkillLayout from "./page/Skill";

function App() {
  return (

        <Routes>

          {/* Public Routes - No tracking needed (auth pages) */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes with Layout - Screen time tracking active */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/create-meeting" element={<CreateMeeting />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mentors" element={<MentorList />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/:id" element={<UserProfile />} />
            <Route path="/book-meeting/:mentorId" element={<BookMeeting />} />
            <Route path="/skills" element={<SkillLayout />} />
          </Route>

          {/* Optional: Add a catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
    
  );
}

// Simple 404 component (you can create a proper one)
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-gray-600">Page not found</p>
    </div>
  </div>
);

export default App;