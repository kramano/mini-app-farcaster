// App.tsx
import {
    DynamicContextProvider,
} from "@dynamic-labs/sdk-react-core";
import {SolanaWalletConnectors} from "@dynamic-labs/solana";
import sdk from "@farcaster/frame-sdk";
import {useEffect} from "react";
import ConnectMenu from "@/components/ConnectMenu";
import Layout from "@/components/Layout";
import WalletErrorBoundary from "@/components/WalletErrorBoundary";
import Wallet from "@/Wallet.tsx";

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

    const cssOverrides = `
  /* Change modal border radius, width, and overlay */
  .dynamic-widget-modal {
    border-radius: 24px !important;
    width: 440px !important;
  }

  .dynamic-widget-modal__backdrop {
    background: rgba(0, 0, 0, 0.5) !important;
  }

  /* Example button color override */
  .dynamic-connect-button {
    background-color: #1e40af !important;
    color: white !important;
  }

  /* Fonts */
  .dynamic-text {
    font-family: 'Inter', sans-serif !important;
  }

   /* Hide wallet selector row (avatar, address, 3-dot menu) */
  .dynamic-widget-header {
    display: none !important;
  }
`;


    return (
        <DynamicContextProvider
            settings={{
                environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
                walletConnectors: [SolanaWalletConnectors],
                cssOverrides,

            }}
        >
            <WalletErrorBoundary>
                <Layout>
                    <ConnectMenu/>
                    <Wallet/>
                </Layout>
            </WalletErrorBoundary>
        </DynamicContextProvider>
    );
}

export default App;
