
import React from 'react';
import { motion } from 'framer-motion';
import { Book, Coffee, HelpCircle } from 'lucide-react';

interface PlaceMarkerProps {
  type: 'library' | 'coffee' | 'unknown';
  className?: string;
}

const PlaceMarker: React.FC<PlaceMarkerProps> = ({ type, className }) => {
  const IconComponent = {
    library: Book,
    coffee: Coffee,
    unknown: HelpCircle
  }[type];

  return (
    <motion.div
      className={`relative p-2 rounded-full bg-black/50 backdrop-blur-sm ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: [0.8, 1.1, 0.8],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <IconComponent className="w-5 h-5 text-white" />
    </motion.div>
  );
};

export default PlaceMarker;
