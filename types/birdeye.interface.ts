export interface BirdEyeTokenItem {
  address: string
  decimals: number
  balance: number
  uiAmount: number
  chainId: string
  name?: string
  symbol?: string
  icon?: string
  logoURI?: string
  priceUsd?: number
  valueUsd?: number
}

export interface BirdEyeWalletPortfolio {
  wallet: string
  totalUsd: number
  items: BirdEyeTokenItem[]
}

export interface BirdEyeBalanceChange {
  amount: number
  symbol: string
  name: string
  decimals: number
  address: string
  logoURI: string
}

export interface BirdEyeContractLabel {
  address: string
  name: string
  metadata: {
    icon: string
  }
}

export interface BirdEyeTransaction {
  txHash: string
  blockNumber: number
  blockTime: string
  status: boolean
  from: string
  to: string
  fee: number
  mainAction: string
  balanceChange: BirdEyeBalanceChange[]
  contractLabel: BirdEyeContractLabel
}

export interface BirdEyeWalletTransactionHistory {
  solana: BirdEyeTransaction[]
}

export interface BirdEyeSearchTokenResult {
  name: string
  symbol: string
  address: string
  network: string
  decimals: number
  logo_uri: string
  verified: boolean
  fdv: number
  market_cap: number
  liquidity: number
  price: number
  price_change_24h_percent: number
  sell_24h: number
  sell_24h_change_percent: number
  buy_24h: number
  buy_24h_change_percent: number
  unique_wallet_24h: number
  unique_wallet_24h_change_percent: number
  trade_24h: number
  trade_24h_change_percent: number
  volume_24h_change_percent: number
  volume_24h_usd: number
  last_trade_unix_time: number
  last_trade_human_time: string
  supply: number
  updated_time: number
}

export interface BirdEyeSearchItem {
  type: string
  result: BirdEyeSearchTokenResult[]
}

export interface BirdEyeSearchResponse {
  items: BirdEyeSearchItem[]
}

export interface BirdEyeWalletBalanceChangeTokenInfo {
  address: string
  decimals: number
  symbol: string
  name: string
  logo_uri: string
}

export interface BirdEyeWalletBalanceChangeItem {
  time: string
  block_number: number
  block_unix_time: number
  address: string
  token_account: string
  tx_hash: string
  pre_balance: string
  post_balance: string
  amount: string
  token_info: BirdEyeWalletBalanceChangeTokenInfo
  type: number
  type_text: string
  change_type: number
  change_type_text: string
}

export interface BirdEyeWalletBalanceChangeResponse
  extends Array<BirdEyeWalletBalanceChangeItem> {}
