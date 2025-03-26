import { useState, useEffect } from 'react';


export function useElementVisibility(elementId: string, threshold = 0.1): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      threshold,
    });
    
    const element = document.getElementById(elementId);
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [elementId, threshold]);

  return isVisible;
}