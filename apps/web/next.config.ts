import type { NextConfig } from "next";

export default {
  transpilePackages: ["@zenncore/ui", "@zenncore/config"],
  experimental: {
    useCache: true,
    ppr: true,
    serverActions: {
      bodySizeLimit: "10MB",
    }
  },
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //       path: false,
  //     };
  //   }

  //   // Enable WebAssembly
  //   config.experiments = {
  //     ...config.experiments,
  //     asyncWebAssembly: true,
  //     layers: true,
  //   };

  //   // Suppress WebAssembly warnings
  //   config.output = {
  //     ...config.output,
  //     webassemblyModuleFilename: 'static/wasm/[modulehash].wasm',
  //   };

  //   return config;
  // },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
} satisfies NextConfig

