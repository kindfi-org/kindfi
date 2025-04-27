import { useWindowDimensions } from 'react-native';

export const useMobile = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Standard tablet breakpoint

  return {
    isMobile,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
};