import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Wrapper } from "@googlemaps/react-wrapper";
import { useAuth } from '@/hooks/useAuth';
import useLocation from '@/hooks/useLocation';
import RadiusSlider from '@/components/RadiusSlider';
import GhostModeToggle from '@/components/GhostModeToggle';
import RecenterButton from '@/components/RecenterButton';
import LocationPermissionModal from '@/components/LocationPermissionModal';
import ProfileDrawer from '@/components/ProfileDrawer';
import { darkMapStyles } from '@/lib/mapStyles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const API_KEY = "AIzaSyCjIwAJEFHqjHDOABZzeOQtvVg7F8ESYHI";
const METERS_PER_FOOT = 0.3048;

const animateMapTo = (
  map: google.maps.Map, 
  { center, zoom }: { center?: google.maps.LatLngLiteral, zoom?: number },
  duration = 1000
) => {
  if (!map) return;
  
  const startTime = new Date().getTime();
  const startCenter = map.getCenter()?.toJSON();
  const startZoom = map.getZoom();
  
  const targetCenter = center || startCenter;
  const targetZoom = zoom !== undefined ? zoom : startZoom;
  
  const deltaLat = targetCenter.lat - startCenter.lat;
  const deltaLng = targetCenter.lng - startCenter.lng;
  const deltaZoom = targetZoom - startZoom;
  
  const easeInOutCubic = (t: number) => {
    return t < 0.5
      ? 4 * t * t * t
      : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };
  
  const animate = () => {
    const currentTime = new Date().getTime();
    const elapsed = currentTime - startTime;
    
    const progress = Math.min(1, elapsed / duration);
    const easedProgress = easeInOutCubic(progress);
    
    if (deltaLat !== 0 || deltaLng !== 0) {
      map.setCenter({
        lat: startCenter.lat + deltaLat * easedProgress,
        lng: startCenter.lng + deltaLng * easedProgress
      });
    }
    
    if (deltaZoom !== 0) {
      map.setZoom(startZoom + deltaZoom * easedProgress);
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};

const RadarMap: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const radiusCircleRef = useRef<google.maps.Circle | null>(null);
  const nearbyMarkers = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [radiusFeet, setRadiusFeet] = useState(150);
  const [radiusMeters, setRadiusMeters] = useState(150 * METERS_PER_FOOT);
  const [ghostMode, setGhostMode] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [mapDragged, setMapDragged] = useState(false);
  
  const { 
    location, 
    error: locationError, 
    requestPermission, 
    permissionState,
    permissionDenied 
  } = useLocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });

  const showLocationModal = !location && (permissionState === 'prompt' || permissionDenied);

  useEffect(() => {
    if (!location || !mapRef.current || mapLoaded) return;
    
    const initMap = () => {
      const userLocation = { lat: location.latitude, lng: location.longitude };
      
      const map = new google.maps.Map(mapRef.current!, {
        center: userLocation,
        zoom: 18,
        disableDefaultUI: true,
        styles: darkMapStyles,
        gestureHandling: "greedy",
        backgroundColor: '#10141B',
        maxZoom: ZOOM_MAX,
        minZoom: ZOOM_MIN,
      });
      
      const userCircleMarker = new google.maps.Marker({
        position: userLocation,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#ea384c",
          fillOpacity: 1,
          strokeColor: "#ea384c",
          strokeWeight: 2,
          scale: 14
        },
        zIndex: 1000
      });
      
      const radarCircle = new google.maps.Circle({
        map,
        center: userLocation,
        radius: radiusFeet * METERS_PER_FOOT,
        strokeColor: "#ea384c",
        strokeOpacity: 1,
        strokeWeight: 3,
        fillOpacity: 0.10,
        fillColor: "#ea384c",
        zIndex: 500,
      });
      
      map.addListener("dragstart", () => {
        setMapDragged(true);
      });
      
      googleMapRef.current = map;
      userMarkerRef.current = userCircleMarker;
      radiusCircleRef.current = radarCircle;
      nearbyMarkers.current = [];
      setMapLoaded(true);
    };
    
    initMap();
  }, [location, mapLoaded, radiusFeet]);

  useEffect(() => {
    if (!location || !googleMapRef.current || !userMarkerRef.current || !radiusCircleRef.current) return;
    
    const userLocation = { lat: location.latitude, lng: location.longitude };
    
    userMarkerRef.current.setPosition(userLocation);
    radiusCircleRef.current.setCenter(userLocation);
    
    if (!mapDragged) {
      const zoomLevel = getZoomFromRadius(radiusFeet);
      animateMapTo(googleMapRef.current, { center: userLocation, zoom: zoomLevel }, 900);
    }
  }, [location, mapDragged, radiusFeet]);

  useEffect(() => {
    if (!radiusCircleRef.current) return;
    
    const newRadiusMeters = radiusFeet * METERS_PER_FOOT;
    radiusCircleRef.current.setRadius(newRadiusMeters);
    setRadiusMeters(newRadiusMeters);
  }, [radiusFeet]);

  useEffect(() => {
    nearbyMarkers.current.forEach(marker => {
      marker.setVisible(!ghostMode);
    });
  }, [ghostMode]);

  useEffect(() => {
    if (!permissionState) {
      requestPermission();
    }
  }, [permissionState, requestPermission]);

  const handleRecenter = () => {
    if (!googleMapRef.current || !location) return;
    
    const userLocation = { lat: location.latitude, lng: location.longitude };
    
    animateMapTo(googleMapRef.current, {
      center: userLocation,
      zoom: 18
    }, 1500);
    
    setMapDragged(false);
    
    if (userMarkerRef.current) {
      const originalIcon = userMarkerRef.current.getIcon();
      userMarkerRef.current.setIcon({
        ...(originalIcon as google.maps.Symbol),
        scale: 12,
      });
      
      setTimeout(() => {
        if (userMarkerRef.current) {
          userMarkerRef.current.setIcon({
            ...(originalIcon as google.maps.Symbol),
            scale: 9,
          });
        }
      }, 300);
    }
  };

  const getZoomFromRadius = (feet: number) => {
    const meters = feet * METERS_PER_FOOT;
    const baseZoom = 19.5;
    return Math.max(
      ZOOM_MIN,
      Math.min(
        ZOOM_MAX,
        baseZoom - Math.log2(meters / 25)
      )
    );
  };

  const handleRadiusChange = (val: number) => {
    setRadiusFeet(val);

    if (googleMapRef.current && location) {
      const zoomLevel = getZoomFromRadius(val);
      animateMapTo(googleMapRef.current, { zoom: zoomLevel }, 340);
    }
  };

  const handleRadiusChangeComplete = (val: number) => {
    if (googleMapRef.current && location) {
      const zoomLevel = getZoomFromRadius(val);
      animateMapTo(googleMapRef.current, { zoom: zoomLevel }, 1050);
    }
  };

  const handleGhostModeChange = (enabled: boolean) => {
    setGhostMode(enabled);
    if (enabled) {
      toast.success("Ghost mode enabled");
    } else {
      toast.success("Ghost mode disabled");
    }
  };

  const handleUpdateProfile = async (data: any) => {
    if (!user) return;
    
    try {
      console.log("Profile update data:", data);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

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
        <Wrapper apiKey={API_KEY} libraries={["places", "geometry"]}>
          <div className="w-full h-full">
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </Wrapper>
        
        {!location && !locationError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
            <div className="flex flex-col items-center">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="h-16 w-16 bg-coral rounded-full flex items-center justify-center mb-4"
              >
                <div className="h-10 w-10 bg-black rounded-full"></div>
              </motion.div>
              <p className="text-white text-lg">Loading your location...</p>
            </div>
          </div>
        )}
        
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="absolute bottom-36 left-0 right-0 px-6 z-10"
        >
          <RadiusSlider 
            value={radiusFeet}
            min={RADIUS_MIN}
            max={RADIUS_MAX}
            onChange={handleRadiusChange}
            onChangeComplete={handleRadiusChangeComplete}
          />
        </motion.div>
        
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute bottom-10 left-0 right-0 flex justify-between items-center px-6 z-10"
        >
          <div className="w-[45%]">
            <GhostModeToggle 
              enabled={ghostMode} 
              onChange={handleGhostModeChange} 
              className="bg-black/40 backdrop-blur-sm p-3 rounded-full" 
            />
          </div>
          
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="w-[45%]"
          >
            <Button 
              onClick={() => setShowProfileDrawer(true)}
              className="w-full bg-coral hover:bg-coral-dark text-white rounded-full py-6"
            >
              Profile
            </Button>
          </motion.div>
        </motion.div>
        
        <AnimatePresence>
          {mapDragged && (
            <RecenterButton 
              onClick={handleRecenter} 
              className="absolute bottom-60 right-6 z-10"
            />
          )}
        </AnimatePresence>
      </div>
      
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
        onGhostModeChange={handleGhostMode => {
          setGhostMode(handleGhostMode);
          setShowProfileDrawer(false);
        }}
        onUpdateProfile={handleUpdateProfile}
        signOutButtonLabel="Sign out"
        signOutButtonClassName="btn-coral"
      />
    </div>
  );
};

export default RadarMap;
