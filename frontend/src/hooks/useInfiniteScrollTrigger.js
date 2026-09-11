import { useEffect, useRef } from "react";

export const useInfiniteScrollTrigger = (onIntersect, enabled) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect();
      },
      { rootMargin: "1200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return sentinelRef;
};