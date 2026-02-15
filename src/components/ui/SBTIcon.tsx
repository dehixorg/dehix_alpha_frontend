import React from 'react';

interface SBTIconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

const SBTIcon: React.FC<SBTIconProps> = ({ className = 'h-6 w-6', ...props }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            <path d="M12 2v20" />
            <path d="M2 12h20" />
            <circle cx="12" cy="12" r="10" />
            <path d="M6 12a6 6 0 1 0 12 0 6 6 0 0 0-12 0" />
        </svg>
    );
};

export default SBTIcon;
