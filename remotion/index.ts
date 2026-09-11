import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

// Entry point for Remotion. This is referenced by remotion.config.ts and the
// package.json "video:*" scripts. registerRoot wires the composition tree into
// the Remotion Studio / renderer.
registerRoot(RemotionRoot);
