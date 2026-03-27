import React from 'react';

export const RoundIcon = ({
    className = "w-6 h-6",
    color = "currentColor"
}) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer Circle */}
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke={color}
                strokeWidth="1.5"
            />

            {/* Star Facets */}
            <path
                d="M12 4L14.5 9L20 12L14.5 15L12 20L9.5 15L4 12L9.5 9L12 4Z"
                stroke={color}
                strokeWidth="1"
                strokeLinejoin="round"
                opacity="0.8"
            />

            {/* Cross Facets */}
            <line
                x1="12"
                y1="2"
                x2="12"
                y2="22"
                stroke={color}
                strokeWidth="0.8"
                opacity="0.5"
            />
            <line
                x1="2"
                y1="12"
                x2="22"
                y2="12"
                stroke={color}
                strokeWidth="0.8"
                opacity="0.5"
            />

            {/* Diagonal Facets */}
            <line
                x1="5"
                y1="5"
                x2="19"
                y2="19"
                stroke={color}
                strokeWidth="0.8"
                opacity="0.4"
            />
            <line
                x1="19"
                y1="5"
                x2="5"
                y2="19"
                stroke={color}
                strokeWidth="0.8"
                opacity="0.4"
            />
        </svg>
    );
};

export const PrincessIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="4" y="4" width="16" height="16" stroke={color} strokeWidth="1.5" />
        <path d="M4 4L12 12L20 4 M4 20L12 12L20 20 M12 4V20 M4 12H20" stroke={color} strokeWidth="1" opacity="0.6" />
        <path d="M4 4L8 8 M16 4L20 8 M4 20L8 16 M16 20L20 16" stroke={color} strokeWidth="0.8" opacity="0.4" />
    </svg>
);

export const EmeraldIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M7 4H17L20 7V17L17 20H7L4 17V7L7 4Z" stroke={color} strokeWidth="1.5" />
        <path d="M8 6H16V18H8V6Z" stroke={color} strokeWidth="1" opacity="0.7" />
        <path d="M4 7L8 6 M20 7L16 6 M4 17L8 18 M20 17L16 18" stroke={color} strokeWidth="0.8" opacity="0.4" />
        <path d="M12 4V20 M4 12H20" stroke={color} strokeWidth="0.8" opacity="0.3" />
    </svg>
);

export const PearIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 4C12 4 6 11 6 16C6 19.3137 8.68629 22 12 22C15.3137 22 18 19.3137 18 16C18 11 12 4 12 4Z" stroke={color} strokeWidth="1.5" />
        <path d="M12 4L14 10L18 16L12 22L6 16L10 10L12 4Z" stroke={color} strokeWidth="0.8" opacity="0.6" />
        <path d="M6 16H18 M12 4V22" stroke={color} strokeWidth="0.8" opacity="0.3" />
    </svg>
);

export const OvalIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <ellipse cx="12" cy="12" rx="7" ry="10" stroke={color} strokeWidth="1.5" />
        <path d="M12 2L15 8L19 12L15 16L12 22L9 16L5 12L9 8L12 2Z" stroke={color} strokeWidth="0.8" opacity="0.6" />
        <path d="M5 12H19 M12 2V22" stroke={color} strokeWidth="0.8" opacity="0.3" />
    </svg>
);

export const CushionIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M5 4C3 4 3 6 3 8V16C3 18 3 20 5 20H19C21 20 21 18 21 16V8C21 6 21 4 19 4H5Z" stroke={color} strokeWidth="1.5" />
        <path d="M5 4L12 12L19 4 M5 20L12 12L19 20 M3 12H21 M12 4V20" stroke={color} strokeWidth="0.8" opacity="0.5" />
        <path d="M3 8L8 4 M16 4L21 8 M3 16L8 20 M16 20L21 16" stroke={color} strokeWidth="0.8" opacity="0.3" />
    </svg>
);

export const MarquiseIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 3C12 3 5 10 5 12C5 14 12 21 12 21C12 21 19 14 19 12C19 10 12 3 12 3Z" stroke={color} strokeWidth="1.5" />
        <path d="M12 3L9 9L5 12L9 15L12 21L15 15L19 12L15 9L12 3Z" stroke={color} strokeWidth="0.8" opacity="0.6" />
        <path d="M5 12H19 M12 3V21" stroke={color} strokeWidth="0.8" opacity="0.3" />
    </svg>
);

export const HeartIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 20L4.5 13C2.5 11 2 8 4 5C6 3 9 3 11 5L12 6L13 5C15 3 18 3 20 5C22 8 21.5 11 19.5 13L12 20Z" stroke={color} strokeWidth="1.5" />
        <path d="M12 20L8 14L4 8L7 4L12 8L17 4L20 8L16 14L12 20Z" stroke={color} strokeWidth="0.8" opacity="0.6" />
        <path d="M12 6V20" stroke={color} strokeWidth="0.8" opacity="0.3" />
    </svg>
);

export const RadiantIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M7 4H17L20 7V17L17 20H7L4 17V7L7 4Z" stroke={color} strokeWidth="1.5" />
        <path d="M4 7L20 17 M4 17L20 7 M12 4V20 M4 12H20" stroke={color} strokeWidth="1" opacity="0.5" />
        <path d="M7 4L12 12L17 4 M7 20L12 12L17 20" stroke={color} strokeWidth="0.8" opacity="0.4" />
    </svg>
);

export const ShapeIcon = ({ shape, className, color }) => {
    switch (shape?.toLowerCase()) {
        case 'round': return <RoundIcon className={className} color={color} />;
        case 'princess': return <PrincessIcon className={className} color={color} />;
        case 'emerald': return <EmeraldIcon className={className} color={color} />;
        case 'pear': return <PearIcon className={className} color={color} />;
        case 'oval': return <OvalIcon className={className} color={color} />;
        case 'cushion': return <CushionIcon className={className} color={color} />;
        case 'marquise': return <MarquiseIcon className={className} color={color} />;
        case 'heart': return <HeartIcon className={className} color={color} />;
        case 'radiant': return <RadiantIcon className={className} color={color} />;
        default: return <RoundIcon className={className} color={color} />;
    }
};

