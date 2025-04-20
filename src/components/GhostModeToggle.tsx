
import React from 'react';
import { Switch } from "@/components/ui/switch";

interface GhostModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

const GhostModeToggle: React.FC<GhostModeToggleProps> = ({ enabled, onChange, className }) => {
  return (
    <div className={`flex items-center space-x-3 ${className || ''}`}>
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-coral"
      />
      <span className="font-medium">Ghost mode</span>
    </div>
  );
};

export default GhostModeToggle;
