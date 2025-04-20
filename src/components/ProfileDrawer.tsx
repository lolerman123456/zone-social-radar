
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Instagram, Twitter, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import GhostModeToggle from './GhostModeToggle';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null;
  ghostMode: boolean;
  onGhostModeChange: (enabled: boolean) => void;
  onUpdateProfile: (data: {
    displayName: string;
    instagram?: string;
    twitter?: string;
  }) => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ 
  open, 
  onOpenChange,
  user,
  ghostMode,
  onGhostModeChange,
  onUpdateProfile
}) => {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    onUpdateProfile({
      displayName,
      instagram: instagram ? instagram.replace('@', '') : undefined,
      twitter: twitter ? twitter.replace('@', '') : undefined,
    });
    
    setIsSubmitting(false);
    toast.success("Profile updated successfully!");
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onOpenChange(false);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-black/95 border-l border-white/10 text-white" side="right">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-white text-2xl">Your Profile</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-24 w-24 border-2 border-coral mb-4">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
            <AvatarFallback className="bg-coral/20 text-coral text-xl">
              {user.displayName?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-lg font-semibold">{user.displayName || 'User'}</h3>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center">
              <Instagram className="h-4 w-4 mr-2" /> Instagram
            </Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@username"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center">
              <Twitter className="h-4 w-4 mr-2" /> Twitter
            </Label>
            <Input
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@username"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          
          <GhostModeToggle 
            enabled={ghostMode} 
            onChange={onGhostModeChange} 
            className="py-2"
          />
          
          <div className="pt-4 space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-coral hover:bg-coral-dark text-white"
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/5"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileDrawer;
