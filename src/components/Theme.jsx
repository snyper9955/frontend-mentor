import { useTheme } from "../hooks/useTheme";

const Theme = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-4 flex justify-end">
      <button
        onClick={toggleTheme}
        className={
          theme === "light"
            ? "bg-white text-black px-4 py-2 rounded transition"
            : "bg-black text-white px-4 py-2 rounded transition"
        }
      >
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>
    </div>
  );
};

export default Theme;