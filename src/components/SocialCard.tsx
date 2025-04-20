
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Instagram, Twitter } from 'lucide-react';

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
    <div className="social-card absolute bottom-24 left-1/2 transform -translate-x-1/2 w-[80%] max-w-xs p-4 rounded-lg glass-panel animate-fade-in">
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-full bg-black/30"
        aria-label="Close"
      >
        <X className="h-4 w-4 text-white/70" />
      </button>
      
      <div className="flex items-center space-x-4">
        <Avatar className="h-14 w-14 border-2 border-coral">
          <AvatarImage src={user.photoUrl} alt={user.name} />
          <AvatarFallback className="bg-coral/20 text-coral">
            {user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-left">
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <div className="flex mt-2 space-x-3">
            {user.socialLinks.instagram && (
              <a 
                href={`https://instagram.com/${user.socialLinks.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-coral transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            
            {user.socialLinks.twitter && (
              <a 
                href={`https://twitter.com/${user.socialLinks.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-coral transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialCard;
