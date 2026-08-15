import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "LiftNGo Admin",
  version: packageJson.version,
  copyright: `© ${currentYear}, LiftNGo.`,
  meta: {
    title: "LiftNGo Admin",
    description: "Secure LiftNGo operations console",
  },
} as const;
