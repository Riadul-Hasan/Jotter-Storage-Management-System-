import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

// Pass Tailwind an absolute config path: its default lookup uses
// process.cwd(), so `@apply bg-dark-900` failed when Vite was started
// from the repo root instead of ./frontend.
export default {
  plugins: {
    tailwindcss: { config: path.resolve(here, "tailwind.config.js") },
    autoprefixer: {},
  },
};
