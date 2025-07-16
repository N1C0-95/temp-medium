import { useEffect, useState } from "react";
/**
 * Custom hook to determine if the viewport width is at least 768px (medium breakpoint).
 * This is useful for responsive design to apply styles or logic based on screen size.
 *
 * @returns {boolean} - Returns true if the viewport width is at least 768px, otherwise false.
 */

export function useIsMdUp() {
  const [isMdUp, setIsMdUp] = useState(
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMdUp(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isMdUp;
}