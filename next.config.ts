import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  trailingSlash: false, // On force : PAS de slash à la fin
  skipTrailingSlashRedirect: true, // On interdit les redirections auto
};

export default nextConfig;