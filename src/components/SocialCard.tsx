
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Instagram, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserSocial {
  id: string;
  name: string;
  photoUrl?: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
  };
}

interface SocialCardProps {
  user: UserSocial;
  onClose: () => void;
}

const SocialCard: React.FC<SocialCardProps> = ({ user, onClose }) => {
  return (
    <motion.div 
      className="social-card absolute bottom-32 left-1/2 transform -translate-x-1/2 w-[80%] max-w-xs p-4 rounded-lg glass-panel z-30"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      }}
    >
      <motion.button 
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-full bg-black/30"
        whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.5)" }}
        whileTap={{ scale: 0.9 }}
        aria-label="Close"
      >
        <X className="h-4 w-4 text-white/70" />
      </motion.button>
      
      <div className="flex items-center space-x-4">
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Avatar className="h-14 w-14 border-2 border-coral">
            <AvatarImage src={user.photoUrl} alt={user.name} />
            <AvatarFallback className="bg-coral/20 text-coral">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        
        <div className="flex-1 text-left">
          <motion.h3 
            className="text-lg font-semibold"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {user.name}
          </motion.h3>
          <motion.div 
            className="flex mt-2 space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {user.socialLinks.instagram && (
              <motion.a 
                href={`https://instagram.com/${user.socialLinks.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-coral transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
            )}
            
            {user.socialLinks.twitter && (
              <motion.a 
                href={`https://twitter.com/${user.socialLinks.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-coral transition-colors"
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SocialCard;
