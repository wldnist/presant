import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude better-sqlite3 from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'better-sqlite3': false,
      };
    }
    
    // Untuk server-side: exclude better-sqlite3 dari bundle
    // Akan di-load secara conditional di runtime
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('better-sqlite3');
      } else if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = (context: any, request: string, callback: any) => {
          if (request === 'better-sqlite3') {
            return callback(null, 'commonjs ' + request);
          }
          return originalExternals(context, request, callback);
        };
      }
    }
    
    return config;
  },
};

export default nextConfig;
