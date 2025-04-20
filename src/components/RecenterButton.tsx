
import React from 'react';
import { Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecenterButtonProps {
  onClick: () => void;
  className?: string;
}

const RecenterButton: React.FC<RecenterButtonProps> = ({ onClick, className }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex justify-center items-center bg-coral w-12 h-12 rounded-full shadow-lg",
        "hover:bg-coral-dark transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-white/20",
        "animate-fade-in",
        className
      )}
      aria-label="Recenter map"
    >
      <Navigation className="w-5 h-5 text-white" />
    </button>
  );
};

export default RecenterButton;
