'use client';

import React from 'react';

interface NDAFileIconProps {
  className?: string;
}

export const NDAFileIcon: React.FC<NDAFileIconProps> = ({
  className = 'h-6 w-6',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      textRendering="geometricPrecision"
      shapeRendering="crispEdges"
    >
      <defs>
        <style>{`
          .nda-text {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-weight: 900;
            font-size: 22px;
            fill: currentColor;
            letter-spacing: 0px;
          }
        `}</style>
      </defs>

      {/* File shape fill */}
      <path
        d="M20,10 L65,10 L80,25 L80,90 L20,90 Z"
        fill="currentColor"
        opacity="0.2"
      />

      {/* File shape border */}
      <path
        d="M20,10 L65,10 L80,25 L80,90 L20,90 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Fold corner */}
      <path
        d="M65,10 L65,25 L80,25"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* NDA text */}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        dominantBaseline="middle"
        className="nda-text"
      >
        NDA
      </text>
    </svg>
  );
};

export default NDAFileIcon;
