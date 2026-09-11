import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import { Circle } from "@remotion/shapes";
import { noise2D } from "@remotion/noise";
import { loadFont } from "@remotion/google-fonts/Inter";
import type { ZoneRadarProps } from "../schema";

const { fontFamily } = loadFont();

// A radar-style intro that exercises a good chunk of the Remotion toolkit:
// springs, interpolation, @remotion/shapes, @remotion/noise, and
// @remotion/google-fonts. Serves as a working reference composition.
export const ZoneRadar: React.FC<ZoneRadarProps> = ({
  title,
  subtitle,
  accentColor,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const center = { x: width / 2, y: height / 2 };

  // Rotating radar sweep.
  const sweepAngle = interpolate(frame, [0, fps * 4], [0, 720], {
    extrapolateRight: "extend",
  });

  // Title entrance spring.
  const titleProgress = spring({ frame, fps, config: { damping: 200 } });
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);

  const subtitleProgress = spring({
    frame: frame - fps * 0.4,
    fps,
    config: { damping: 200 },
  });

  // Expanding radar rings.
  const rings = [0, 1, 2, 3];

  return (
    <AbsoluteFill style={{ backgroundColor, fontFamily }}>
      {/* Noise-driven ambient dots */}
      {Array.from({ length: 40 }).map((_, i) => {
        const nx = noise2D("x", i * 0.1, frame * 0.01);
        const ny = noise2D("y", i * 0.1, frame * 0.01);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: center.x + nx * width * 0.5,
              top: center.y + ny * height * 0.5,
              width: 4,
              height: 4,
              borderRadius: "50%",
              backgroundColor: accentColor,
              opacity: 0.35,
            }}
          />
        );
      })}

      {/* Radar rings */}
      {rings.map((ring) => {
        const radius = interpolate(
          (frame + ring * (fps / 2)) % (fps * 2),
          [0, fps * 2],
          [0, Math.min(width, height) * 0.45]
        );
        const opacity = interpolate(
          (frame + ring * (fps / 2)) % (fps * 2),
          [0, fps * 2],
          [0.5, 0]
        );
        return (
          <AbsoluteFill
            key={ring}
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <Circle
              radius={radius}
              fill="transparent"
              stroke={accentColor}
              strokeWidth={2}
              style={{ opacity }}
            />
          </AbsoluteFill>
        );
      })}

      {/* Sweep line */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: Math.min(width, height) * 0.45,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accentColor})`,
            transformOrigin: "left center",
            transform: `rotate(${sweepAngle}deg)`,
          }}
        />
      </AbsoluteFill>

      {/* Center pulse */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Circle radius={8} fill={accentColor} />
      </AbsoluteFill>

      {/* Text */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: height * 0.12,
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: width * 0.06,
            fontWeight: 800,
            margin: 0,
            opacity: titleProgress,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            color: accentColor,
            fontSize: width * 0.025,
            fontWeight: 500,
            marginTop: 12,
            opacity: subtitleProgress,
          }}
        >
          {subtitle}
        </p>
      </AbsoluteFill>

      {/* Fade out near the end */}
      <Sequence from={durationInFrames - fps}>
        <AbsoluteFill
          style={{
            backgroundColor,
            opacity: interpolate(
              frame,
              [durationInFrames - fps, durationInFrames],
              [0, 1],
              { extrapolateLeft: "clamp" }
            ),
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
