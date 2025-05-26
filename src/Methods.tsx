import { isEthereumWallet } from "@dynamic-labs/ethereum";
import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import "./Methods.css";

export default function DynamicMethods() {
  const isLoggedIn = useIsLoggedIn();
  const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
  const userWallets = useUserWallets();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<undefined | string>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("0.01");
  const { sendTransaction } = useSendTransaction();
  const { data: receiptData } = useWaitForTransactionReceipt();

  const isEthereum = primaryWallet && isEthereumWallet(primaryWallet);
  const isSolana = primaryWallet && isSolanaWallet(primaryWallet);

  // Initialize recipient address with appropriate prefix based on wallet type
  useEffect(() => {
    if (isEthereum) {
      setRecipientAddress("0x");
    } else if (isSolana) {
      setRecipientAddress("");
    }
  }, [isEthereum, isSolana]);

  const safeStringify = (obj: unknown): string => {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (_, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) return "[Circular]";
          seen.add(value);
        }
        return value;
      },
      2
    );
  };

  useEffect(() => {
    if (sdkHasLoaded && isLoggedIn && primaryWallet) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [sdkHasLoaded, isLoggedIn, primaryWallet]);

  function clearResult() {
    setResult(undefined);
    setError(null);
  }

  function showUser() {
    try {
      setError(null);
      setResult(safeStringify(user));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to stringify user data"
      );
      setResult(undefined);
    }
  }

  function showUserWallets() {
    try {
      setError(null);
      setResult(safeStringify(userWallets));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to stringify wallet data"
      );
      setResult(undefined);
    }
  }

  async function fetchEthereumPublicClient() {
    if (!isEthereum) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getPublicClient();
      setResult(safeStringify(result));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEthereumWalletClient() {
    if (!isEthereum) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getWalletClient();
      setResult(safeStringify(result));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function signEthereumMessage() {
    if (!isEthereum) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.signMessage("Hello World");
      setResult(result);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEthereumTransaction() {
    if (!isEthereum) return;

    if (
      recipientAddress === "0x0000000000000000000000000000000000000000" ||
      !recipientAddress.startsWith("0x")
    ) {
      setError("Please enter a valid Ethereum recipient address");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult("Sending transaction...");

      sendTransaction(
        {
          to: recipientAddress as `0x${string}`,
          value: parseEther(amount),
        },
        {
          onSuccess: (data) => {
            setResult(`Transaction submitted: ${data}`);
          },
          onError: (error) => {
            setError(`${error.message}`);
          },
        }
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (receiptData) {
      setResult(
        `Transaction confirmed! Block number: ${receiptData.blockNumber}`
      );
    }
  }, [receiptData]);

  async function fetchSolanaConnection() {
    if (!isSolana) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getConnection();
      setResult(safeStringify(result));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSolanaSigner() {
    if (!isSolana) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.getSigner();
      setResult(safeStringify(result));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function signSolanaMessage() {
    if (!isSolana) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await primaryWallet.signMessage("Hello World");
      setResult(safeStringify(result));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSolanaTransaction() {
    if (!isSolana) return;

    if (!recipientAddress || recipientAddress.trim() === "") {
      setError("Please enter a valid Solana recipient address");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult("Preparing Solana transaction...");

      const connection = await primaryWallet.getConnection();
      const publicKey = primaryWallet.address;

      const fromKey = new PublicKey(publicKey);
      const toKey = new PublicKey(recipientAddress);
      const amountInLamports = LAMPORTS_PER_SOL * parseFloat(amount);
      const instructions = [
        SystemProgram.transfer({
          fromPubkey: fromKey,
          lamports: amountInLamports,
          toPubkey: toKey,
        }),
      ];

      const blockhash = await connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        instructions,
        payerKey: fromKey,
        recentBlockhash: blockhash.blockhash,
      }).compileToV0Message();

      const transferTransaction = new VersionedTransaction(messageV0);
      const signer = await primaryWallet.getSigner();
      setResult("Creating and signing transaction...");

      const result = await signer.signAndSendTransaction(
        transferTransaction as unknown as Parameters<
          typeof signer.signAndSendTransaction
        >[0]
      );

      setResult(`Solana transaction sent! Signature: ${result.signature}`);
      const confirmation = await connection.confirmTransaction(
        result.signature
      );

      if (confirmation) {
        setResult(
          `Solana transaction confirmed! Signature: ${result.signature}`
        );
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {!isLoading && (
        <div className="dynamic-methods">
          <div className="methods-container">
            <button className="btn btn-primary" onClick={showUser}>
              Fetch User
            </button>
            <button className="btn btn-primary" onClick={showUserWallets}>
              Fetch User Wallets
            </button>

            {isEthereum && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={fetchEthereumPublicClient}
                >
                  Fetch PublicClient
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={fetchEthereumWalletClient}
                >
                  Fetch WalletClient
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={signEthereumMessage}
                >
                  Sign Message
                </button>
              </>
            )}

            {isSolana && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={fetchSolanaConnection}
                >
                  Fetch Connection
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={fetchSolanaSigner}
                >
                  Fetch Signer
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={signSolanaMessage}
                >
                  Sign Message
                </button>
              </>
            )}
          </div>

          {primaryWallet && (
            <div className="recipient-container">
              <h3>Send {isEthereum ? "Ethereum" : "Solana"} Transaction</h3>
              <div className="transaction-form">
                <div className="form-group">
                  <label htmlFor="recipient-address">Recipient Address</label>
                  <input
                    id="recipient-address"
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder={
                      isEthereum
                        ? "Enter 0x... address"
                        : "Enter SOL address..."
                    }
                    className="address-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tx-amount">Amount</label>
                  <div className="input-group">
                    <input
                      id="tx-amount"
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.01"
                      className="amount-input"
                    />
                    <span className="currency-label">
                      {isEthereum ? "ETH" : "SOL"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="send-btn"
                  onClick={
                    isEthereum
                      ? handleEthereumTransaction
                      : handleSolanaTransaction
                  }
                >
                  Send {isEthereum ? "ETH" : "SOL"}
                </button>
              </div>
            </div>
          )}

          {(result || error) && (
            <div className="results-container">
              {error ? (
                <pre className="results-text error">{error}</pre>
              ) : (
                <pre className="results-text">
                  {result &&
                    (typeof result === "string" && result.startsWith("{")
                      ? JSON.stringify(JSON.parse(result), null, 2)
                      : result)}
                </pre>
              )}
            </div>
          )}

          {(result || error) && (
            <div className="clear-container">
              <button className="btn btn-primary" onClick={clearResult}>
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
