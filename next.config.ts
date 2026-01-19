// @ts-check
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'

const nextConfig = (phase: string): NextConfig => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER

  return {
    output: 'standalone',
    assetPrefix: isDev ? undefined : 'https://ftidev-bo-static.azureedge.net/order-search-es-dashboard',
  }
}

export default nextConfig;
