
import React from 'react';
import { LocateFixed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from "framer-motion";

interface RecenterButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const RecenterButton: React.FC<RecenterButtonProps> = ({ 
  onClick, 
  className,
  disabled = false
}) => {
  return (
    <motion.button 
      onClick={onClick}
      disabled={disabled}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95, rotate: 20 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 15,
        mass: 0.4
      }}
      className={cn(
        "flex justify-center items-center bg-coral w-14 h-14 rounded-full shadow-lg",
        "hover:bg-coral-dark transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-white/20",
        "backdrop-blur-sm",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
      aria-label="Recenter map"
    >
      <LocateFixed className="w-6 h-6 text-white" />
    </motion.button>
  );
};

export default RecenterButton;
