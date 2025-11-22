import React, { useState, useEffect } from 'react';

const WoodenFish = ({ onHit }) => {
    const [isActive, setIsActive] = useState(false);

    const handleClick = () => {
        setIsActive(true);
        onHit();
        setTimeout(() => setIsActive(false), 100); // Reset animation state
    };

    return (
        <div
            className="wooden-fish-container"
            onClick={handleClick}
            style={{
                cursor: 'pointer',
                transform: isActive ? 'scale(0.95)' : 'scale(1)',
                transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #3a3a3a, #1a1a1a)',
                boxShadow: `
          0 10px 30px rgba(0,0,0,0.5),
          inset 0 2px 5px rgba(255,255,255,0.1),
          0 0 0 4px var(--secondary-color)
        `,
                position: 'relative',
                overflow: 'hidden' // For ripple containment if needed
            }}
        >
            {/* Stylized Wooden Fish Icon (SVG) */}
            <svg
                width="120"
                height="120"
                viewBox="0 0 24 24"
                fill="var(--accent-color)"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
            >
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" opacity="0.3" />
                <path d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7Z" />
                {/* Placeholder for actual Muyu shape, using a cross/plus for now inside a circle, 
            will replace with better path later or generate one */}
            </svg>

            {/* Text label below or inside? */}
        </div>
    );
};

export default WoodenFish;
