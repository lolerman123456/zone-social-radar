import React from "react";
import { Composition } from "remotion";
import "./style.css";
import { ZoneRadar } from "./components/ZoneRadar";
import { defaultZoneRadarProps, zoneRadarSchema } from "./schema";

// The composition tree registered with Remotion. Add new <Composition />
// entries here and they will appear in Remotion Studio (`npm run video`).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ZoneRadar"
        component={ZoneRadar}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        schema={zoneRadarSchema}
        defaultProps={defaultZoneRadarProps}
      />
      {/* Vertical / social variant (9:16) */}
      <Composition
        id="ZoneRadar-Vertical"
        component={ZoneRadar}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
        schema={zoneRadarSchema}
        defaultProps={defaultZoneRadarProps}
      />
    </>
  );
};
