import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SwipeNavigationOptions {
  enabled?: boolean;
  threshold?: number;
  routes?: string[];
}

export function useSwipeNavigation(options: SwipeNavigationOptions = {}) {
  const {
    enabled = true,
    threshold = 100,
    routes = []
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    if (!enabled || routes.length === 0) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const diff = touchStartX.current - touchEndX.current;
      const currentIndex = routes.indexOf(location.pathname);

      if (currentIndex === -1) return;

      // Swipe left - go to next route
      if (diff > threshold && currentIndex < routes.length - 1) {
        navigate(routes[currentIndex + 1]);
      }

      // Swipe right - go to previous route
      if (diff < -threshold && currentIndex > 0) {
        navigate(routes[currentIndex - 1]);
      }

      // Reset
      touchStartX.current = 0;
      touchEndX.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, routes, location.pathname, navigate]);

  return {
    currentRoute: location.pathname,
    currentIndex: routes.indexOf(location.pathname),
    totalRoutes: routes.length
  };
}
