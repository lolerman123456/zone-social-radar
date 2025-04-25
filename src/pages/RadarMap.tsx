
import React, { useState, useEffect, useRef } from 'react';
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
import { getAuth } from "firebase/auth";

const RADIUS_MIN = 20;
const RADIUS_MAX = 150;
const METERS_PER_FOOT = 0.3048;

const RadarMap: React.FC = () => {
const { user } = useAuth();
const [radiusFeet, setRadiusFeet] = useState(RADIUS_MIN);
const [ghostMode, setGhostMode] = useState(false);
const [showProfileDrawer, setShowProfileDrawer] = useState(false);
const [mapDragged, setMapDragged] = useState(false);
const [isAnimating, setIsAnimating] = useState(false);

const mapRef = useRef<HTMLDivElement>(null);
const googleMapRef = useRef<google.maps.Map | null>(null);
const userMarkerRef = useRef<google.maps.Marker | null>(null);
const radiusCircleRef = useRef<google.maps.Circle | null>(null);
const nearbyMarkers = useRef<google.maps.Marker[]>([]);

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
const userRef = ref(getDatabase(), `users/${user.uid}`);
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

useEffect(() => {
if (!location || !mapRef.current || googleMapRef.current) return;

const map = new google.maps.Map(mapRef.current, {
center: { lat: location.latitude, lng: location.longitude },
zoom: 19,
disableDefaultUI: true,
gestureHandling: 'greedy',
styles: [/* your dark map styles if any */]
});

googleMapRef.current = map;

const userMarker = new google.maps.Marker({
map,
position: { lat: location.latitude, lng: location.longitude },
icon: {
path: google.maps.SymbolPath.CIRCLE,
scale: 8,
fillColor: "#ea384c",
fillOpacity: 1,
strokeWeight: 2,
strokeColor: "#ffffff",
},
zIndex: 999
});

userMarkerRef.current = userMarker;

const radiusCircle = new google.maps.Circle({
map,
center: { lat: location.latitude, lng: location.longitude },
radius: radiusFeet * METERS_PER_FOOT,
fillColor: "#ea384c",
fillOpacity: 0.1,
strokeColor: "#ea384c",
strokeWeight: 2,
});

radiusCircleRef.current = radiusCircle;
}, [location]);

// Smoothly move marker when location updates
useEffect(() => {
if (!location || !googleMapRef.current || !userMarkerRef.current || !radiusCircleRef.current) return;

const target = { lat: location.latitude, lng: location.longitude };
const current = userMarkerRef.current.getPosition();
if (!current) return;

const deltaLat = (target.lat - current.lat()) / 10;
const deltaLng = (target.lng - current.lng()) / 10;

let step = 0;
const interval = setInterval(() => {
if (step >= 10 || !userMarkerRef.current) {
clearInterval(interval);
return;
}
userMarkerRef.current.setPosition({
lat: current.lat() + deltaLat * step,
lng: current.lng() + deltaLng * step,
});
step++;
}, 50);

radiusCircleRef.current.setCenter(target);

if (!mapDragged) {
googleMapRef.current.panTo(target);
}
}, [location, mapDragged]);

// Draw other users
useEffect(() => {
if (!googleMapRef.current || !otherUsers) return;

nearbyMarkers.current.forEach(marker => marker.setMap(null));
nearbyMarkers.current = [];

otherUsers.forEach(otherUser => {
const marker = new google.maps.Marker({
position: { lat: otherUser.lat, lng: otherUser.lng },
map: googleMapRef.current!,
animation: google.maps.Animation.BOUNCE,
icon: {
path: google.maps.SymbolPath.CIRCLE,
fillColor: "#50C878",
fillOpacity: 1,
strokeColor: "#ffffff",
strokeWeight: 2,
scale: 8,
},
title: otherUser.name || "User Nearby"
});

marker.addListener('click', () => {
alert(`
Name: ${otherUser.name || "Unknown"}
Instagram: ${otherUser.socials?.instagram || "Not Linked"}
Snapchat: ${otherUser.socials?.snapchat || "Not Linked"}
TikTok: ${otherUser.socials?.tiktok || "Not Linked"}
`);
});

nearbyMarkers.current.push(marker);
});
}, [otherUsers]);

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
<div ref={mapRef} className="w-full h-full" />
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