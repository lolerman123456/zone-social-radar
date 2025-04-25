
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import useLocation from '@/hooks/useLocation';
import { useNearbyUsers } from '@/hooks/useNearbyUsers';
import { useLocationUpdater } from '@/hooks/useLocationUpdater';
import LocationPermissionModal from '@/components/LocationPermissionModal';
import ProfileDrawer from '@/components/ProfileDrawer';
import MapControls from '@/components/MapControls';
import RecenterButton from '@/components/RecenterButton';
import { getDatabase, ref, set } from "firebase/database";
import Map from '@/components/Map';

const RADIUS_MIN = 20;
const RADIUS_MAX = 150;

const RadarMap: React.FC = () => {
  const { user } = useAuth();
  const [radiusFeet, setRadiusFeet] = useState(RADIUS_MIN);
  const [ghostMode, setGhostMode] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [mapDragged, setMapDragged] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { location, error: locationError, requestPermission, permissionState, permissionDenied } = useLocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });

  const { otherUsers } = useNearbyUsers();
  useLocationUpdater(location, ghostMode);

  const handleUpdateProfile = async (data: any) => {
    if (!user) return;

    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, {
        uid: user.uid,
        lat: location?.latitude || 0,
        lng: location?.longitude || 0,
        ghostMode,
        updatedAt: Date.now(),
        socials: {
          instagram: data.instagram || '',
          snapchat: data.snapchat || '',
          tiktok: data.tiktok || '',
        },
        name: data.name || '',
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleRecenter = () => {
    setMapDragged(false);
    setIsAnimating(true);
  };

  const handleGhostModeChange = (enabled: boolean) => {
    setGhostMode(enabled);
    if (enabled) {
      toast.success("Ghost mode enabled");
    } else {
      toast.success("Ghost mode disabled");
    }
  };

  useEffect(() => {
    if (!permissionState) {
      requestPermission();
    }
  }, [permissionState, requestPermission]);

  const showLocationModal = !location && (permissionState === 'prompt' || permissionDenied);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#10141B]">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute top-0 left-0 right-0 z-10 flex items-center px-4 py-3 glass-panel"
      >
        <h1 className="text-2xl font-outfit font-bold text-white">Zoned</h1>
      </motion.div>

      <div className="w-full h-full">
        <Map 
          location={location}
          radiusFeet={radiusFeet}
          otherUsers={otherUsers}
          onMapDrag={() => setMapDragged(true)}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
        />
      </div>

      <MapControls
        radiusFeet={radiusFeet}
        ghostMode={ghostMode}
        onRadiusChange={setRadiusFeet}
        onRadiusChangeComplete={setRadiusFeet}
        onGhostModeChange={handleGhostModeChange}
        onProfileClick={() => setShowProfileDrawer(true)}
      />

      {mapDragged && (
        <RecenterButton
          onClick={handleRecenter}
          className="absolute bottom-60 right-6 z-10"
        />
      )}

      <LocationPermissionModal
        isOpen={showLocationModal}
        onRequestPermission={requestPermission}
        permissionDenied={permissionDenied}
      />

      <ProfileDrawer
        open={showProfileDrawer}
        onOpenChange={setShowProfileDrawer}
        user={user}
        ghostMode={ghostMode}
        onGhostModeChange={handleGhostModeChange}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
};

export default RadarMap;
