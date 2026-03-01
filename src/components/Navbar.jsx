import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { RiMessage2Line } from "react-icons/ri";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav
      className={`w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 ${
        theme === "light"
          ? "bg-neutral-100 shadow-md"
          : "bg-neutral-900 text-white shadow-md"
      }`}
    >
      {/* Logo */}
      <Link to="/" className="text-lg sm:text-xl font-bold">
        Mentor<span className="text-yellow-400">Hub</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-6">
        <Link to="/dashboard" className="hover:text-yellow-400 transition">
          Dashboard
        </Link>

        {user?.role === "mentor" && (
          <Link to="/create-meeting" className="hover:text-yellow-400 transition">
            Create Meeting
          </Link>
        )}
        <div className="hidden md:flex gap-6">
        <Link to="/skills" className="hover:text-yellow-400 transition">
          Skills
        </Link>
        </div>

        <Link to="/meetings" className="hover:text-yellow-400 transition">
          Request for meeting
        </Link>

        <Link to="/chat" className="hover:text-yellow-400 transition flex items-center gap-1">
          Chat
        </Link>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 sm:gap-6 relative">
        {user && (
          <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded bg-blue-200 text-black">
            {user.role}
          </span>
        )}

        <button
          onClick={toggleTheme}
          className="px-2 sm:px-3 py-1 rounded bg-black text-white text-xs sm:text-sm"
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>

        {/* Messages Icon */}
        {user && (
          <Link to="/chat" className="relative cursor-pointer hover:text-[#25D366] transition flex items-center">
            <RiMessage2Line size={24} />
          </Link>
        )}

        {/* Login / Logout */}
        {user ? (
          <button
            onClick={logout}
            className="px-2 sm:px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm transition"
          >
            Logout
          </button>
        ) : (
          <Link to={'/login'} className="px-2 sm:px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm transition">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;