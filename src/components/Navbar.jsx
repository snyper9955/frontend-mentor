import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { RiMessage2Line } from "react-icons/ri";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = (
    <>
      <Link to="/dashboard" className="hover:text-yellow-400 transition">
        Dashboard
      </Link>

      {user?.role === "mentor" && (
        <Link to="/create-meeting" className="hover:text-yellow-400 transition">
          Create Meeting
        </Link>
      )}

      <Link to="/skills" className="hover:text-yellow-400 transition">
        Skills
      </Link>

      <Link to="/meetings" className="hover:text-yellow-400 transition">
        Request for Meeting
      </Link>

      <Link
        to="/chat"
        className="hover:text-yellow-400 transition flex items-center gap-1"
      >
        Chat
      </Link>
    </>
  );

  return (
    <nav
      className={`w-full px-4 sm:px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 ${
        theme === "light"
          ? "bg-neutral-100 shadow-md"
          : "bg-neutral-900 text-white shadow-md"
      }`}
    >
      {/* Logo */}
      <Link to="/" className="text-xl font-bold">
        Mentor<span className="text-yellow-400">Hub</span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 items-center">
        {navLinks}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-xs px-3 py-1 rounded bg-blue-200 text-black">
            {user.role}
          </span>
        )}

        <button
          onClick={toggleTheme}
          className="px-3 py-1 rounded bg-black text-white text-xs"
        >
          {theme === "light" ? "Dark" : "Light"}
        </button>

        {user && (
          <Link
            to="/chat"
            className="hover:text-[#25D366] transition"
          >
            <RiMessage2Line size={22} />
          </Link>
        )}

        {user ? (
          <button
            onClick={logout}
            className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs transition"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs transition"
          >
            Login
          </Link>
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 w-full flex flex-col gap-4 px-6 py-4 md:hidden ${
            theme === "light"
              ? "bg-neutral-100"
              : "bg-neutral-900 text-white"
          }`}
        >
          {navLinks}
        </div>
      )}
    </nav>
  );
};

export default Navbar;