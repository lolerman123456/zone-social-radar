
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`relative ${sizes[size]} ${className || ''}`}>
      <img 
        src="/lovable-uploads/2b396bbb-453b-4126-9400-8479ac043b32.png" 
        alt="Zoned Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
