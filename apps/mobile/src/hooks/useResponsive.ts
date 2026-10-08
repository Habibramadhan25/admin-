import { useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWideDesktop: boolean;
  // Dynamic column counts
  bookColumns: number;
  categoryColumns: number;
  favColumns: number;
  // Exact pixel widths for grid items (prevents percentage-gap overflow glitches)
  bookColumnWidth: number;
  favColumnWidth: number;
  // Container max-width helper
  maxContentWidth: number;
  containerPadding: number;
  gridGap: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 768;
  const isWideDesktop = width >= 1200;

  const maxContentWidth = 1140;
  const containerPadding = isDesktop ? 40 : 32; // Total padding horizontal
  const gridGap = isDesktop ? 16 : 12;

  // Actual content width available inside container
  const actualContainerWidth = Math.min(width, maxContentWidth);
  const availableWidth = Math.max(actualContainerWidth - containerPadding, 260);

  // Column counts for book portrait grids
  let bookColumns = 2; // Default for mobile < 480px (2 comfortable cards)
  if (width >= 1200) {
    bookColumns = 6;
  } else if (width >= 992) {
    bookColumns = 5;
  } else if (width >= 768) {
    bookColumns = 4;
  } else if (width >= 480) {
    bookColumns = 3;
  }

  // Exact column width in pixels (guarantees no wrap/overflow issues)
  const bookColumnWidth = Math.floor(
    (availableWidth - (bookColumns - 1) * gridGap) / bookColumns
  );

  // Favorite & history column counts
  const favColumns = isDesktop ? (width >= 1024 ? 4 : 3) : 2;
  const favColumnWidth = Math.floor(
    (availableWidth - (favColumns - 1) * gridGap) / favColumns
  );

  // Category block columns
  let categoryColumns = 2;
  if (width >= 1024) {
    categoryColumns = 4;
  } else if (width >= 640) {
    categoryColumns = 3;
  }

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWideDesktop,
    bookColumns,
    categoryColumns,
    favColumns,
    bookColumnWidth,
    favColumnWidth,
    maxContentWidth,
    containerPadding,
    gridGap,
  };
}
