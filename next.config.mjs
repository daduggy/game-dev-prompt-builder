const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");

/** @type {import("next").NextConfig} */
const config = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default config;
