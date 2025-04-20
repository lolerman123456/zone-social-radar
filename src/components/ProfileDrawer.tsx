import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Instagram, Twitter, LogOut, Facebook } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import GhostModeToggle from './GhostModeToggle';
import { useNavigate } from 'react-router-dom';

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
    snapchat?: string;
    tiktok?: string;
    facebook?: string;
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
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [snapchat, setSnapchat] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [facebook, setFacebook] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    onUpdateProfile({
      displayName,
      instagram: instagram ? instagram.replace('@', '') : undefined,
      twitter: twitter ? twitter.replace('@', '') : undefined,
      snapchat: snapchat ? snapchat.replace('@', '') : undefined,
      tiktok: tiktok ? tiktok.replace('@', '') : undefined,
      facebook: facebook ? facebook.replace('@', '') : undefined,
    });
    
    setIsSubmitting(false);
    toast.success("Profile updated successfully!");
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onOpenChange(false);
      toast.success("Signed out successfully");
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-black/95 border-l border-white/10 text-white overflow-y-auto" side="right">
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
        
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="snapchat" className="flex items-center">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.206 3c.466.004 3.198.076 4.615 2.097.466.667.7 1.862.466 5.237l-.007.115c-.029.331-.063.742-.063.742s-.049.054-.148.054c-.098 0-1.013-.157-1.332-.157-.319 0-.737.069-1.007.436-.237.32-.187.89-.14 1.206l.008.057c.062.409.302 2.008 1.894 2.335.127.026.217.121.217.233 0 .233-.466.642-.989 1.051-.523.409-1.193.758-1.193 1.517 0 .642.989 1.867 3.363 1.867s3.363-1.226 3.363-1.867c0-.759-.67-1.108-1.193-1.517-.523-.409-.989-.817-.989-1.051 0-.112.09-.207.217-.233 1.592-.327 1.832-1.927 1.894-2.335l.008-.057c.048-.316.097-.885-.14-1.206-.27-.367-.688-.436-1.007-.436-.319 0-1.234.157-1.332.157-.099 0-.148-.054-.148-.054s-.034-.411-.063-.742l-.007-.115c-.234-3.375 0-4.57.466-5.237C16.596 3.076 19.328 3.004 19.794 3h.412v.001c.466.004 3.198.076 4.615 2.097.466.667.7 1.862.466 5.237l-.007.115c-.029.331-.063.742-.063.742s-.049.054-.148.054c-.098 0-1.013-.157-1.332-.157-.319 0-.737.069-1.007.436-.237.32-.187.89-.14 1.206l.008.057c.062.409.302 2.008 1.894 2.335.127.026.217.121.217.233 0 .233-.466.642-.989 1.051-.523.409-1.193.758-1.193 1.517 0 .642.989 1.867 3.363 1.867s3.363-1.226 3.363-1.867c0-.759-.67-1.108-1.193-1.517-.523-.409-.989-.817-.989-1.051 0-.112.09-.207.217-.233 1.592-.327 1.832-1.927 1.894-2.335l.008-.057c.048-.316.097-.885-.14-1.206-.27-.367-.688-.436-1.007-.436-.319 0-1.234.157-1.332.157-.099 0-.148-.054-.148-.054s-.034-.411-.063-.742l-.007-.115c-.234-3.375 0-4.57.466-5.237C8.404 3.076 11.136 3.004 11.602 3h.604zm0 18c-2.374 0-3.363-1.226-3.363-1.867 0-.759.67-1.108 1.193-1.517.523-.409.989-.817.989-1.051 0-.112-.09-.207-.217-.233-1.592-.327-1.832-1.927-1.894-2.335l-.008-.057c-.048-.316-.097-.885.14-1.206.27-.367.688-.436 1.007-.436.319 0 1.234.157 1.332.157.099 0 .148-.054.148-.054s.034-.411.063-.742l.007-.115c.234-3.375 0-4.57-.466-5.237C9.404 3.076 6.672 3.004 6.206 3h-.412c-.466.004-3.198.076-4.615 2.097-.466.667-.7 1.862-.466 5.237l.007.115c.029.331.063.742.063.742s.049.054.148.054c.098 0 1.013-.157 1.332-.157.319 0 .737.069 1.007.436.237.32.187.89.14 1.206l-.008.057c-.062.409-.302 2.008 1.894 2.335.127.026.217.121.217.233 0 .233-.466.642-.989 1.051-.523.409-1.193.758-1.193 1.517 0 .642.989 1.867 3.363 1.867s3.363-1.226 3.363-1.867c0-.759.67-1.108 1.193-1.517-.523-.409-.989-.817-.989-1.051 0-.112-.09-.207-.217-.233-1.592-.327-1.832-1.927-1.894-2.335l-.008-.057c-.048-.316-.097-.885.14-1.206.27-.367.688-.436 1.007-.436.319 0 1.234.157 1.332.157.099 0 .148-.054.148-.054s.034-.411.063-.742l-.007-.115c.234-3.375 0-4.57-.466-5.237C3.404 3.076.672 3.004.206 3H0v-.001C.466 3.004 3.198 3.076 4.615 5.097c.466.667.7 1.862.466 5.237l-.007.115c-.029.331-.063.742-.063.742s-.049.054-.148.054c-.098 0-1.013-.157-1.332-.157-.319 0-.737.069-1.007.436-.237.32-.187.89-.14 1.206l.008.057c-.062.409-.302 2.008 1.894 2.335.127.026.217.121.217.233 0 .233-.466.642-.989 1.051-.523.409-1.193.758-1.193 1.517 0 .642.989 1.867 3.363 1.867s3.363-1.226 3.363-1.867c0-.759-.67-1.108 1.193-1.517-.523-.409-.989-.817-.989-1.051 0-.112.09-.207-.217-.233-1.592-.327-1.832-1.927-1.894-2.335l-.008-.057c-.048-.316-.097-.885.14-1.206.27-.367.688-.436 1.007-.436.319 0 1.234.157 1.332.157.099 0 .148-.054.148-.054s.034-.411.063-.742l-.007-.115c.234-3.375 0-4.57-.466-5.237C15.596 3.076 18.328 3.004 18.794 3h.412z"/>
              </svg>
              Snapchat
            </Label>
            <Input
              id="snapchat"
              value={snapchat}
              onChange={(e) => setSnapchat(e.target.value)}
              placeholder="@username"
              className="bg-white/5 border-white/10 text-white"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktok" className="flex items-center">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              TikTok
            </Label>
            <Input
              id="tiktok"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="@username"
              className="bg-white/5 border-white/10 text-white"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center">
              <Facebook className="h-4 w-4 mr-2" /> Facebook
            </Label>
            <Input
              id="facebook"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="username"
              className="bg-white/5 border-white/10 text-white"
              autoComplete="off"
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
              className="w-full border-white/10 text-white hover:bg-white/5 flex items-center justify-center"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" /> 
              <span className="text-white">Sign Out</span>
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileDrawer;
