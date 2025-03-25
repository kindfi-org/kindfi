export type ThemeColor = 'green' | 'blue' | 'purple';

export const colorMap: Record<ThemeColor, {
  text: string;
  hover: string;
  rgb: string;
  iconBg: string;
  iconColor: string;
}> = {
  green: {
    text: 'text-green-600',
    hover: 'hover:text-green-700',
    rgb: '144, 238, 144',
    iconBg: 'rgba(235, 246, 235, 0.9)',
    iconColor: '#8BC34A',
  },
  blue: {
    text: 'text-blue-600',
    hover: 'hover:text-blue-700',
    rgb: '173, 216, 230',
    iconBg: 'rgba(235, 242, 255, 0.9)',
    iconColor: '#2196F3',
  },
  purple: {
    text: 'text-purple-600',
    hover: 'hover:text-purple-700',
    rgb: '221, 160, 221',
    iconBg: 'rgba(245, 235, 250, 0.9)',
    iconColor: '#9C27B0',
  },
};