import { useEffect, useRef, useState } from "react";

interface UseScrollDirectionOptions {
  threshold?: number; // min px change before direction updates
}

export function useScrollDirection({
  threshold = 10,
}: UseScrollDirectionOptions = {}) {
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  const lastY = useRef(0);
  const lastDocHeight = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    lastDocHeight.current = document.documentElement.scrollHeight;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const currentDocHeight = document.documentElement.scrollHeight;

      // If page height changed, this scroll event is from a layout shift
      // (e.g. sticky header filter panel expanding), not from the user scrolling.
      // Reset baseline and skip direction update.
      if (currentDocHeight !== lastDocHeight.current) {
        lastDocHeight.current = currentDocHeight;
        lastY.current = currentY;
        return;
      }

      const diff = currentY - lastY.current;

      if (Math.abs(diff) < threshold) return;

      setIsScrollingDown(diff > 0);
      lastY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isScrollingDown;
}
