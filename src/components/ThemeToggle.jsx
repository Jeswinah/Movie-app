import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const getInitialTheme = () => {
  if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
    return "dark";
  }
  return "light";
};

const ThemeToggle = ({ floating = false, className = "" }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      console.error("Could not save theme:", error);
    }
  }, [theme]);

  const isDark = theme === "dark";

  const baseStyles =
    "flex items-center justify-center rounded-full transition-all duration-300 hover:scale-105";
  const floatingStyles =
    "fixed bottom-6 left-6 z-50 w-11 h-11 shadow-lg border bg-white/95 text-slate-700 border-slate-200 hover:text-red-600 dark:bg-[#0f141a]/95 dark:text-yellow-300 dark:border-white/20 dark:hover:text-yellow-200 backdrop-blur-sm";
  const inlineStyles =
    "w-10 h-10 border bg-white text-slate-700 border-slate-200 hover:text-red-600 hover:border-red-300 dark:bg-white/10 dark:text-yellow-300 dark:border-white/20 dark:hover:text-yellow-200";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      className={`${baseStyles} ${floating ? floatingStyles : inlineStyles} ${className}`}
    >
      {isDark ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
    </button>
  );
};

export default ThemeToggle;
