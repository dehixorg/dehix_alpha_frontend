import React from 'react';

interface CustomIconProps {
  className?: string;
  width?: number | string; // Allow width to be a number or string
  height?: number | string; // Allow height to be a number or string
  viewBox?: string;
  path?: string; // Optional path prop if you need to customize the SVG path
}

const CustomIcon: React.FC<CustomIconProps> = ({
  className,
  width = 24, // Default width if not provided
  height = 24, // Default height if not provided
  viewBox = '0 0 24 24', // Default viewBox if not provided
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width} // Use width from props or default
      height={height} // Use height from props or default
      viewBox={viewBox} // Use viewBox from props or default
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-10 h-10 text-gray-500 dark:text-gray-400 ${className}`}
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <path d="M12 11h4"></path>
      <path d="M12 16h4"></path>
      <path d="M8 11h.01"></path>
      <path d="M8 16h.01"></path>
    </svg>
  );
};

export default CustomIcon;
