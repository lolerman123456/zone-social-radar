import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Typed, editable props for the showcase composition. Because we use
// @remotion/zod-types, colors get a proper color-picker in Remotion Studio.
export const zoneRadarSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  accentColor: zColor(),
  backgroundColor: zColor(),
});

export type ZoneRadarProps = z.infer<typeof zoneRadarSchema>;

export const defaultZoneRadarProps: ZoneRadarProps = {
  title: "Zone Social Radar",
  subtitle: "See what's happening around you",
  accentColor: "#6366f1",
  backgroundColor: "#0b1020",
};
