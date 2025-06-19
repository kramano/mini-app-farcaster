export const WALLET_ACTIONS = {
  SEND: "send",
  RECEIVE: "receive", 
  EARN: "earn",
  TOPUP: "topup",
} as const;

export type WalletAction = typeof WALLET_ACTIONS[keyof typeof WALLET_ACTIONS];

export const USDC_DECIMALS = 6;

export const DEFAULT_BALANCE = "0.00";

export const LOADING_MESSAGES = {
  SDK_INITIALIZING: "Initializing SDK...",
  LOGIN_REQUIRED: "Please log in to continue",
  WALLET_CONNECTION_REQUIRED: "Please connect a wallet",
  TOKEN_BALANCES_LOADING: "Loading token balances...",
} as const;

export const ERROR_MESSAGES = {
  SOLANA_WALLET_REQUIRED: "This application requires a Solana wallet. Please connect a Solana wallet to continue.",
  BALANCE_FETCH_FAILED: "Failed to fetch USDC balance",
  FUNDING_OPTIONS_FAILED: "Failed to open top-up options",
} as const;