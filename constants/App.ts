import { ENV } from './Env'

export const Keys = {
  PRIVY_ACCESS_TOKEN: 'privy_access_token',
}

export const ENDPOINTS = {
  // Use the SERVER_URL from env
  serverBase: ENV.SERVER_URL,
  // Jupiter endpoints – these default values can be overridden by changing SERVER_URL if needed.
  jupiter: {
    quote: 'https://api.jup.ag/swap/v1/quote',
    swap: ENV.SERVER_URL + '/api/jupiter/swap',
  },
  // Raydium endpoints
  raydium: {
    swapApi: 'https://transaction-v1.raydium.io',
    v3Api: 'https://api-v3.raydium.io',
  },
  // Jito block engine endpoint.
  jito: {
    blockEngine: 'https://mainnet.block-engine.jito.wtf:443/api/v1/bundles',
  },
  // Helius RPC endpoint from env
  helius: `https://mainnet.helius-rpc.com/?api-key=${ENV.HELIUS_API_KEY}`,
  tensorFlowBaseUrl: 'https://api.mainnet.tensordev.io',
}

export const PUBLIC_KEYS = {
  wSolMint: 'So11111111111111111111111111111111111111112',
  // Default receiver public key for transfers
  defaultReceiver: '24MDwQXG2TWiST8ty1rjcrKgtaYaMiLdRxFQawYgZh4v',
  jitoTipAccounts: [
    '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
    'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe',
    'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
    'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
    'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
    'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
    'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
    '3AVi9Tg9Uo68tJfuvoKvqKNWKc5wPdSSdeBnizKZ6jT',
  ],
}
