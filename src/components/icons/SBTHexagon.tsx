'use client';

import React from 'react';

interface SBTHexagonProps {
  className?: string;
}

export const SBTHexagon: React.FC<SBTHexagonProps> = ({
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
                    .sbt-text {
                        font-family: 'Arial', 'Helvetica', sans-serif;
                        font-weight: 900;
                        font-size: 28px;
                        fill: currentColor;
                        letter-spacing: 0px;
                    }
                `}</style>
      </defs>

      {/* Hexagon fill */}
      <polygon
        points="50,10 85,30 85,70 50,90 15,70 15,30"
        fill="currentColor"
        opacity="0.2"
      />

      {/* Hexagon border */}
      <polygon
        points="50,10 85,30 85,70 50,90 15,70 15,30"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* SBT text - rendered with high quality */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        dominantBaseline="middle"
        className="sbt-text"
      >
        SBT
      </text>
    </svg>
  );
};

export default SBTHexagon;
