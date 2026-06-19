// artifacts/editor/src/hooks/useTheme.ts
import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("editor-theme") as "light" | "dark" | null;
    const isDarkOS = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = savedTheme === "dark" || (!savedTheme && isDarkOS) ? "dark" : "light";
    setTheme(initial);
    if (initial === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("editor-theme", newTheme);
      if (newTheme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return newTheme;
    });
  };

  return { theme, toggleTheme };
}