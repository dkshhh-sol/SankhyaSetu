/* Two dependencies are deliberately held one major back, both because the
   Next lint stack has not caught up to them:

   - typescript is pinned to 6.x. TypeScript 7 (the native compiler) builds
     fine under `next build`, but typescript-eslint throws outright on the
     TS 7 API, which takes this whole config down with it.
   - eslint is pinned to 9.x. ESLint 10 changed the rule context API and
     eslint-plugin-react (pulled in by eslint-config-next) still calls the
     old `context.getFilename()`, crashing on every React rule.

   Revisit both when typescript-eslint ships TS 7 support and
   eslint-plugin-react ships ESLint 10 support. */

import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "tools/**"] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Cropped design assets are served from /public as plain files; the
      // Next image optimiser adds nothing for these small static crops.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
