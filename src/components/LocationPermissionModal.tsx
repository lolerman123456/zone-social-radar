
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onRequestPermission: () => void;
  permissionDenied: boolean;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onRequestPermission,
  permissionDenied
}) => {
  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="bg-black/90 border border-white/10 text-white max-w-md">
        <DialogHeader className="space-y-4">
          <div className="mx-auto bg-coral/20 p-4 rounded-full">
            <MapPin className="h-10 w-10 text-coral" />
          </div>
          <DialogTitle className="text-xl text-center">Location Access Required</DialogTitle>
          <DialogDescription className="text-center text-gray-300">
            {permissionDenied ? (
              <>
                <p className="mb-2">Location permission was denied.</p>
                <p>Please enable location access in your browser settings to use Zoned. This app requires your location to connect you with people nearby.</p>
              </>
            ) : (
              <p>Zoned needs access to your location to connect you with people nearby. Your location is only used while the app is open.</p>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          {permissionDenied ? (
            <Button className="w-full bg-coral hover:bg-coral-dark text-white" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          ) : (
            <Button className="w-full bg-coral hover:bg-coral-dark text-white" onClick={onRequestPermission}>
              Grant Access
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPermissionModal;
