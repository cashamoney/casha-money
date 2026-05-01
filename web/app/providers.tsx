"use client";

import { useEffect, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  var [mounted, setMounted] = useState(false);

  useEffect(function () {
    var saved = localStorage.getItem("casha-theme");
    if (saved === "dark" || saved === "light") {
      document.documentElement.setAttribute("data-theme", saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ minHeight: "100vh", background: "#FFFFFF" }} />;

  return <>{children}</>;
}