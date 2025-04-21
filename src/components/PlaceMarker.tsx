
import React from 'react';
import { motion } from 'framer-motion';
import { Book, Coffee, HelpCircle } from 'lucide-react';

interface PlaceMarkerProps {
  type: 'library' | 'coffee' | 'unknown';
  className?: string;
}

const PlaceMarker: React.FC<PlaceMarkerProps> = ({ type, className }) => {
  let IconComponent;
  
  switch(type) {
    case 'library':
      IconComponent = Book;
      break;
    case 'coffee':
      IconComponent = Coffee;
      break;
    default:
      IconComponent = HelpCircle;
  }

  return (
    <motion.div
      className={`relative p-2 rounded-full bg-black/70 backdrop-blur-sm ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1,
        opacity: 1
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
    >
      <IconComponent className="w-5 h-5 text-white" />
    </motion.div>
  );
};

export default PlaceMarker;
