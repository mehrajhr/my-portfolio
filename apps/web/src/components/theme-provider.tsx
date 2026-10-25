"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";
const STORAGE_KEY = "portfolio-theme";
const ThemeContext = createContext<{ preference: ThemePreference; setPreference: (theme: ThemePreference) => void }>({
  preference: "system",
  setPreference: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = window.localStorage.getItem(STORAGE_KEY); } catch { /* System preference remains available when storage is blocked. */ }
    const initial: ThemePreference = saved === "light" || saved === "dark" ? saved : "system";
    setPreference(initial);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const apply = (dark: boolean) => { document.documentElement.dataset.theme = dark ? "dark" : "light"; };
    if (preference !== "system") {
      try { window.localStorage.setItem(STORAGE_KEY, preference); } catch { /* The chosen theme still applies for this visit. */ }
      apply(preference === "dark");
      return;
    }
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* Follow the system for this visit. */ }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    apply(media.matches);
    const onChange = (event: MediaQueryListEvent) => apply(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference, ready]);

  return <ThemeContext.Provider value={{ preference, setPreference }}>{children}</ThemeContext.Provider>;
}

export function ThemeControl() {
  const { preference, setPreference } = useContext(ThemeContext);
  return <label className="theme-control">
    <span className="sr-only">Color theme</span>
    <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>
    <select aria-label="Color theme" value={preference} onChange={event => setPreference(event.target.value as ThemePreference)}>
      <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
    </select>
  </label>;
}
