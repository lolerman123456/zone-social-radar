
import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface GhostModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

const GhostModeToggle: React.FC<GhostModeToggleProps> = ({ enabled, onChange, className }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  
  // When enabled changes to true, show overlay with a slight delay
  useEffect(() => {
    if (enabled) {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [enabled]);

  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center space-x-3 ${className || ''}`}
      >
        <Switch
          checked={enabled}
          onCheckedChange={onChange}
          className="data-[state=checked]:bg-coral"
        />
        <span className="font-medium">Ghost mode</span>
      </motion.div>

      {/* Ghost Mode Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
              className="text-center p-6"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [1, 0.8, 1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                <Ghost className="w-20 h-20 text-white mx-auto mb-6" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Ghost Mode Active</h2>
              <p className="text-gray-200 text-lg mb-8">You are invisible to others and cannot see other users</p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => onChange(false)}
                  className="bg-coral hover:bg-coral-dark text-white px-8 py-6 rounded-full text-lg"
                >
                  Disable Ghost Mode
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GhostModeToggle;
