
import React from 'react';
import { LocateFixed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from "framer-motion";

interface RecenterButtonProps {
  onClick: () => void;
  className?: string;
}

const RecenterButton: React.FC<RecenterButtonProps> = ({ onClick, className }) => {
  return (
    <motion.button 
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        "flex justify-center items-center bg-coral w-14 h-14 rounded-full shadow-lg",
        "hover:bg-coral-dark transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-white/20",
        "mb-4", // Added margin bottom for spacing
        className
      )}
      aria-label="Recenter map"
    >
      <LocateFixed className="w-6 h-6 text-white" />
    </motion.button>
  );
};

export default RecenterButton;
