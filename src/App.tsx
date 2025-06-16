import {
  DynamicContextProvider,
  DynamicWidget,
  useIsLoggedIn,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import sdk from "@farcaster/frame-sdk";
import { useEffect } from "react";
import DynamicMethods from "./Methods.tsx";

function ConnectMenu() {
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();

  if (isLoggedIn && primaryWallet) {
    return (
      <div style={{ margin: "20px", textAlign: "center" }}>
        <div style={{ marginBottom: "10px", fontWeight: "600" }}>
          Connected account:
        </div>
        <DynamicWidget />
        {primaryWallet.address && (
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
            {primaryWallet.address}
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
        walletConnectors: [SolanaWalletConnectors],
      }}
    >
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
    </DynamicContextProvider>
  );
}

export default App;
