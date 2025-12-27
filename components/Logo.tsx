
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", showText = false }) => {
  return (
    <div className={`flex items-center gap-4 ${showText ? 'w-auto' : ''}`}>
      <svg 
        viewBox="0 0 100 100" 
        className={className} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="planetGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E5E5E5" />
            <stop offset="100%" stopColor="#737373" />
          </radialGradient>
          <linearGradient id="ringGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Rear part of the ring (behind planet) */}
        <path 
          d="M10 55 C 10 30, 90 30, 90 55" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeOpacity="0.15" 
          strokeDasharray="1 2"
        />
        <path 
          d="M15 52 C 15 35, 85 35, 85 52" 
          stroke="white" 
          strokeWidth="0.5" 
          strokeOpacity="0.2" 
        />

        {/* The Planet */}
        <circle cx="50" cy="50" r="28" fill="url(#planetGrad)" />
        
        {/* Subtle shadow on the planet from the ring */}
        <ellipse cx="50" cy="53" rx="42" ry="3" fill="black" fillOpacity="0.1" />

        {/* Front part of the ring (in front of planet) */}
        <path 
          d="M5 55 C 5 80, 95 80, 95 55" 
          stroke="url(#ringGrad)" 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />
        
        {/* Inner glow/accent on the front ring */}
        <path 
          d="M20 62 C 35 68, 65 68, 80 62" 
          stroke="white" 
          strokeWidth="0.5" 
          strokeOpacity="0.5" 
        />
      </svg>
      {showText && (
        <span className="text-2xl font-light tracking-[0.6em] text-white uppercase ml-2">Orbit</span>
      )}
    </div>
  );
};

export default Logo;
