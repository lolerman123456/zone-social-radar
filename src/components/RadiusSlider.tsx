
import React, { useEffect, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
  onChangeComplete?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const RadiusSlider: React.FC<RadiusSliderProps> = ({
  value,
  onChange,
  onChangeComplete,
  min = 5,
  max = 15,
  step = 0.5
}) {
  const prevValueRef = useRef(value);
  
  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  const handleValueChange = (vals: number[]) => {
    onChange(vals[0]);
  };
  
  const handleChangeComplete = (vals: number[]) => {
    if (onChangeComplete) {
      onChangeComplete(vals[0]);
    }
  };
  
  return (
    <div className="w-full px-2">
      <motion.div 
        className="flex justify-center mb-2 text-lg font-medium"
        key={value}
        initial={{ opacity: 0.8, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full">
          {value.toFixed(1)} feet radius
        </span>
      </motion.div>
      
      <div className="relative px-2">
        <Slider
          value={[value]}
          max={max}
          min={min}
          step={step}
          onValueChange={handleValueChange}
          onValueCommit={handleChangeComplete}
          className="my-6"
        />
        
        <div className="flex justify-between mt-1 text-sm text-gray-400">
          <span>{min}ft</span>
          <span>{max}ft</span>
        </div>
      </div>
    </div>
  );
};

export default RadiusSlider;
