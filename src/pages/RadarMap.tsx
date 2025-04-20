
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ChevronLeft } from 'lucide-react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, GeoPoint } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

// No more mock users

const API_KEY = "AIzaSyCjIwAJEFHqjHDOABZzeOQtvVg7F8ESYHI";
const METERS_PER_FOOT = 0.3048;

const RadarMap: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const radiusCircleRef = useRef<google.maps.Circle | null>(null);
  const nearbyMarkers = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [radiusFeet, setRadiusFeet] = useState(10);
  const [radiusMeters, setRadiusMeters] = useState(10 * METERS_PER_FOOT);
  const [ghostMode, setGhostMode] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [mapDragged, setMapDragged] = useState(false);
  
  // Get user location
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

  // Check if a modal should be shown for location permissions
  const showLocationModal = !location && (permissionState === 'prompt' || permissionDenied);

  // Initialize map when location is available
  useEffect(() => {
    if (!location || !mapRef.current || mapLoaded) return;
    
    const initMap = () => {
      const userLocation = { lat: location.latitude, lng: location.longitude };
      
      // Create Google Map instance
      const map = new google.maps.Map(mapRef.current!, {
        center: userLocation,
        zoom: 18,
        disableDefaultUI: true,
        styles: darkMapStyles,
        gestureHandling: "greedy",
        backgroundColor: '#000000',
        maxZoom: 20,
        minZoom: 15,
      });
      
      // Create user marker
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#FF6F61",
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 9
        },
        zIndex: 999
      });
      
      // Create radius circle
      const radiusCircle = new google.maps.Circle({
        map,
        center: userLocation,
        radius: radiusMeters,
        strokeColor: "#FF6F61",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF6F61",
        fillOpacity: 0.15,
        zIndex: 1
      });
      
      // Add map event listeners
      map.addListener("dragstart", () => {
        setMapDragged(true);
      });
      
      googleMapRef.current = map;
      userMarkerRef.current = userMarker;
      radiusCircleRef.current = radiusCircle;
      nearbyMarkers.current = [];
      setMapLoaded(true);
    };

    initMap();
  }, [location, mapLoaded, radiusMeters]);

  // Update user position and radius circle when location changes
  useEffect(() => {
    if (!location || !googleMapRef.current || !userMarkerRef.current || !radiusCircleRef.current) return;
    
    const userLocation = { lat: location.latitude, lng: location.longitude };
    
    userMarkerRef.current.setPosition(userLocation);
    radiusCircleRef.current.setCenter(userLocation);
    
    if (!mapDragged) {
      googleMapRef.current.panTo(userLocation);
    }
  }, [location, mapDragged]);

  // Update radius circle when radius changes
  useEffect(() => {
    if (!radiusCircleRef.current) return;
    
    const newRadiusMeters = radiusFeet * METERS_PER_FOOT;
    radiusCircleRef.current.setRadius(newRadiusMeters);
    setRadiusMeters(newRadiusMeters);
  }, [radiusFeet]);

  // Update nearby markers visibility based on ghost mode
  useEffect(() => {
    nearbyMarkers.current.forEach(marker => {
      marker.setVisible(!ghostMode);
    });
  }, [ghostMode]);

  // Request location permission on mount if not already granted
  useEffect(() => {
    if (!permissionState) {
      requestPermission();
    }
  }, [permissionState, requestPermission]);

  // Recenter the map on user location
  const handleRecenter = () => {
    if (!googleMapRef.current || !location) return;
    
    const userLocation = { lat: location.latitude, lng: location.longitude };
    
    // Use smooth animation to pan and zoom
    googleMapRef.current.panTo(userLocation);
    googleMapRef.current.setZoom(18);
    setMapDragged(false);
    
    // Flash the user marker briefly
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

  const handleRadiusChange = (value: number) => {
    setRadiusFeet(value);
  };
  
  const handleRadiusChangeComplete = (value: number) => {
    // When radius change is complete, adjust zoom level
    if (googleMapRef.current && location) {
      // Calculate appropriate zoom based on radius
      // Smaller radius = higher zoom number
      const minZoom = 16;
      const maxZoom = 19;
      const minRadius = 5;
      const maxRadius = 15;
      
      // Calculate a zoom level between minZoom and maxZoom based on the radius
      const zoomLevel = maxZoom - ((value - minRadius) / (maxRadius - minRadius)) * (maxZoom - minZoom);
      
      // Apply the zoom with animation
      googleMapRef.current.animateCamera({
        zoom: zoomLevel,
        duration: 500
      });
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
      // In a real app, you'd update the profile in Firestore
      console.log("Profile update data:", data);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };
  
  // Render Google Maps with wrapper
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Top header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="absolute top-0 left-0 right-0 z-10 flex items-center px-4 py-3 glass-panel"
      >
        <motion.button 
          onClick={() => navigate(-1)} 
          className="mr-3 rounded-full p-2 hover:bg-white/10"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </motion.button>
        <h1 className="text-xl font-semibold text-white">Home</h1>
      </motion.div>

      {/* Main content with map */}
      <div className="w-full h-full">
        {/* App title */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute top-20 left-0 right-0 z-10 text-center p-3"
        >
          <h1 className="text-4xl font-bold text-white mb-1">Zoned</h1>
          <p className="text-gray-300 text-lg">Your proximity-based social radar</p>
        </motion.div>

        {/* Map container */}
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
        
        {/* Radius slider */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="absolute bottom-36 left-0 right-0 px-6 z-10"
        >
          <RadiusSlider 
            value={radiusFeet} 
            onChange={handleRadiusChange} 
            onChangeComplete={handleRadiusChangeComplete}
          />
        </motion.div>
        
        {/* Bottom controls */}
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
        
        {/* Recenter button - always visible with animation */}
        <AnimatePresence>
          {mapDragged && (
            <RecenterButton 
              onClick={handleRecenter} 
              className="absolute bottom-48 right-6 z-10"
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Permission modal */}
      <LocationPermissionModal 
        isOpen={showLocationModal}
        onRequestPermission={requestPermission}
        permissionDenied={permissionDenied}
      />
      
      {/* Profile drawer */}
      <ProfileDrawer 
        open={showProfileDrawer}
        onOpenChange={setShowProfileDrawer}
        user={user}
        ghostMode={ghostMode}
        onGhostModeChange={handleGhostMode => {
          setGhostMode(handleGhostMode);
          setShowProfileDrawer(false); // Close drawer when toggling ghost mode
        }}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
};

export default RadarMap;
