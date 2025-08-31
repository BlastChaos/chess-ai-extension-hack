import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Chess AI",
  version: "1.0.0",
  icons: {
    48: "public/logo.png",
  },
  action: {
    default_icon: {
      48: "public/logo.png",
    },
    default_popup: "src/popup/index.html",
  },
  permissions: ["activeTab", "debugger", "storage"],
  background: {
    service_worker: "src/background/background.ts",
    type: "module",
  },
  content_scripts: [
    {
      js: ["src/content/content.ts"],
      matches: ["https://www.chess.com/*"],
    },
  ],
});
