
import React from 'react';
import { motion } from 'framer-motion';
import GhostModeToggle from './GhostModeToggle';
import RadiusSlider from './RadiusSlider';
import { Button } from './ui/button';

interface MapControlsProps {
  radiusFeet: number;
  ghostMode: boolean;
  onRadiusChange: (val: number) => void;
  onRadiusChangeComplete: (val: number) => void;
  onGhostModeChange: (enabled: boolean) => void;
  onProfileClick: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  radiusFeet,
  ghostMode,
  onRadiusChange,
  onRadiusChangeComplete,
  onGhostModeChange,
  onProfileClick,
}) => {
  return (
    <>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute bottom-36 left-0 right-0 px-6 z-10"
      >
        <RadiusSlider
          value={radiusFeet}
          min={20}
          max={150}
          onChange={onRadiusChange}
          onChangeComplete={onRadiusChangeComplete}
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
            onChange={onGhostModeChange}
            className="bg-black/40 backdrop-blur-sm p-3 rounded-full"
          />
        </div>

        <motion.div
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          className="w-[45%]"
        >
          <Button
            onClick={onProfileClick}
            className="w-full bg-coral hover:bg-coral-dark text-white rounded-full py-6"
          >
            Profile
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
};

export default MapControls;
