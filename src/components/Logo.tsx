import React from 'react';
import { useTranslation } from 'react-i18next';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = 'medium', showText = true, className = '' }: LogoProps) => {
  const { t } = useTranslation();
  
  // Set dimensions based on size
  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        return { iconSize: 28, fontSize: 'text-sm' };
      case 'large':
        return { iconSize: 56, fontSize: 'text-2xl' };
      case 'medium':
      default:
        return { iconSize: 40, fontSize: 'text-lg' };
    }
  };

  const { iconSize, fontSize } = getSizeDimensions();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="rounded-full bg-gradient-to-br from-budget-blue to-blue-500 text-white flex items-center justify-center overflow-hidden shadow-lg border-2 border-white/20 transition-transform hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg 
          width={iconSize * 0.6} 
          height={iconSize * 0.6} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          <path 
            d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" 
            fill="currentColor"
          />
          <path 
            d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" 
            fill="currentColor"
          />
          <circle
            cx="12"
            cy="12"
            r="4"
            fill="currentColor"
            fillOpacity="0.3"
          />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col items-start">
          <span className={`font-bold ${fontSize} text-transparent bg-clip-text bg-gradient-to-r from-budget-blue to-blue-400 tracking-tight`}>MyBudget</span>
          {size !== 'small' && (
            <span className="text-xs text-muted-foreground">{t('tagline')}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
