import type { NextConfig } from "next";

// App desktop: o Electron carrega o export estático gerado em out/.
// trailingSlash gera /rota/index.html, que o electron-serve encontra sozinho.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
