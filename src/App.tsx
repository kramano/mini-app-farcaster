import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import sdk from "@farcaster/frame-sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAccount, WagmiProvider } from "wagmi";
import DynamicMethods from "./Methods.tsx";
import { config } from "./wagmi.ts";

const queryClient = new QueryClient();

function ConnectMenu() {
  const { isConnected, address } = useAccount();

  if (isConnected) {
    return (
      <div style={{ margin: "20px", textAlign: "center" }}>
        <div style={{ marginBottom: "10px", fontWeight: "600" }}>
          Connected account:
        </div>
        <DynamicWidget />
        {address && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              fontSize: "13px",
              wordBreak: "break-all",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {address}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ margin: "20px", textAlign: "center" }}>
      <DynamicWidget />
    </div>
  );
}

function App() {
  useEffect(() => {
    const setupFarcaster = async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {
        console.error("Error setting up Farcaster:", error);
      }
    };

    setupFarcaster();
  }, []);

  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <div
              style={{
                textAlign: "center",
                padding: "16px",
                backgroundColor: "#ffffff",
                color: "#121212",
                minHeight: "100vh",
                width: "100%",
                margin: "0 auto",
                boxSizing: "border-box",
                overflowX: "hidden",
              }}
            >
              <h1
                style={{
                  fontSize: "28px",
                  marginBottom: "16px",
                  borderBottom: "1px solid #eaeaea",
                  paddingBottom: "15px",
                }}
              >
                Dynamic Mini App
              </h1>
              <div>
                <ConnectMenu />
                <DynamicMethods />
              </div>
            </div>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}

export default App;
