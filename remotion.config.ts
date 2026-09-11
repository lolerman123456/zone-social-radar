import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind";

// Remotion CLI configuration. See https://www.remotion.dev/docs/config
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setEntryPoint("./remotion/index.ts");

// Let compositions use the same Tailwind (v3) classes as the app.
Config.overrideWebpackConfig((currentConfig) => {
  return enableTailwind(currentConfig);
});
