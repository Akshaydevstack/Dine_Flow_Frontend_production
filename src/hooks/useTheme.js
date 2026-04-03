import { useEffect, useState } from "react";

export default function useTheme() {

  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || getSystemTheme();
  });

  useEffect(() => {
 
    document.documentElement.classList.toggle("dark", theme === "dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}