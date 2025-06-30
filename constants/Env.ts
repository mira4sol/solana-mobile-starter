export const ENV = {
  PRIVY_APP_ID: process.env.EXPO_PUBLIC_PRIVY_APP_ID,
  PRIVY_APP_CLIENT_ID: process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID,
  RPC_URL:
    process.env.EXPO_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com',
  SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL,
}
