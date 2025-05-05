
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const Logo = ({ size = 'medium', showText = true }: LogoProps) => {
  // Set dimensions based on size
  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        return { iconSize: 24, fontSize: 'text-sm' };
      case 'large':
        return { iconSize: 48, fontSize: 'text-xl' };
      case 'medium':
      default:
        return { iconSize: 36, fontSize: 'text-lg' };
    }
  };

  const { iconSize, fontSize } = getSizeDimensions();

  return (
    <div className="flex items-center gap-2">
      <div 
        className="rounded-full bg-budget-blue text-white flex items-center justify-center overflow-hidden"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg 
          width={iconSize * 0.7} 
          height={iconSize * 0.7} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
            fill="currentColor"
          />
          <path 
            d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" 
            fill="currentColor"
          />
          <path 
            d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" 
            fill="currentColor"
          />
        </svg>
      </div>
      {showText && (
        <span className={`font-bold ${fontSize} text-budget-blue`}>MyBudget</span>
      )}
    </div>
  );
};

export default Logo;
