
import React from 'react';
import { Slider } from "@/components/ui/slider";

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const RadiusSlider: React.FC<RadiusSliderProps> = ({
  value,
  onChange,
  min = 5,
  max = 55,
  step = 1
}) => {
  const handleValueChange = (vals: number[]) => {
    onChange(vals[0]);
  };
  
  return (
    <div className="w-full px-2">
      <div className="flex justify-center mb-2 text-lg font-medium">
        {value} feet radius
      </div>
      
      <div className="relative px-2">
        <Slider
          defaultValue={[value]}
          max={max}
          min={min}
          step={step}
          onValueChange={handleValueChange}
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
