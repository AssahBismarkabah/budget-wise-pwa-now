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
        className="rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg border-2 border-white/20 transition-transform hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <img 
          src="/logo.png" 
          alt="MyBudget Logo" 
          width={iconSize} 
          height={iconSize} 
          style={{ objectFit: 'contain', width: iconSize, height: iconSize }}
        />
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
