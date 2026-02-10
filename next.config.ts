import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Otimizações de build para reduzir uso de memória
  experimental: {
    // Reduz uso de memória durante build
    webpackBuildWorker: true,
  },
  
  // Configurações de produção
  productionBrowserSourceMaps: false, // Desabilita source maps em produção
  
  // Otimizações de imagem
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Webpack customizado para otimizar memória
  webpack: (config, { isServer }) => {
    // Otimizações de memória
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };
    
    // Reduz uso de memória em builds grandes
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
