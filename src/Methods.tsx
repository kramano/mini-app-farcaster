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
  Connection,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useEffect, useState } from "react";
import "./Methods.css";

export default function DynamicMethods() {
  const isLoggedIn = useIsLoggedIn();
  const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
  const userWallets = useUserWallets();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<undefined | string>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [recipientIdentifier, setRecipientIdentifier] = useState<string>("");
  const [amount, setAmount] = useState<string>("1.00");

  // USDC balance and wallet state
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Earn feature state
  const [isEarning, setIsEarning] = useState(false);
  const [stakedAmount, setStakedAmount] = useState<string>("0.00");
  const [earnings, setEarnings] = useState<string>("0.00");
  const [apy] = useState<string>("5.5");

  // Tab state for UI
  const [activeTab, setActiveTab] = useState<'send' | 'receive' | 'earn'>('send');

  const isSolana = primaryWallet && isSolanaWallet(primaryWallet);

  // USDC mint address from environment variables
  const usdcMintAddress = import.meta.env.VITE_USDC_MINT_ADDRESS;
  const solanaRpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com";

  // Initialize recipient address
  useEffect(() => {
    if (isSolana) {
      setRecipientAddress("");
    }
  }, [isSolana]);

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
      // Fetch USDC balance when wallet is connected
      fetchUsdcBalance();
    } else {
      setIsLoading(true);
    }
  }, [sdkHasLoaded, isLoggedIn, primaryWallet]);

  // Function to fetch USDC balance
  async function fetchUsdcBalance() {
    if (!isSolana || !usdcMintAddress) return;

    try {
      setIsLoadingBalance(true);
      setError(null);

      const connection = new Connection(solanaRpcUrl, "confirmed");
      const walletPublicKey = new PublicKey(primaryWallet.address);

      // Get the associated token account for this wallet and USDC mint
      const tokenAccount = await getAssociatedTokenAddress(
        new PublicKey(usdcMintAddress),
        walletPublicKey
      );

      try {
        // Try to get the token account info
        const tokenAccountInfo = await getAccount(connection, tokenAccount);

        // Calculate balance (SPL tokens use decimals, typically 6 for USDC)
        const balance = Number(tokenAccountInfo.amount) / Math.pow(10, 6);
        setUsdcBalance(balance.toFixed(2));
      } catch (err) {
        // If account doesn't exist yet, balance is 0
        setUsdcBalance("0.00");
      }
    } catch (error) {
      console.error("Error fetching USDC balance:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch USDC balance"
      );
    } finally {
      setIsLoadingBalance(false);
    }
  }

  // Set up interval to update USDC balance and earnings
  useEffect(() => {
    if (isLoggedIn && primaryWallet) {
      // Initial fetch
      fetchUsdcBalance();

      // Set up interval to update balance every 30 seconds
      const intervalId = setInterval(() => {
        fetchUsdcBalance();

        // Update earnings if user is earning
        if (isEarning && parseFloat(stakedAmount) > 0) {
          const apyDecimal = parseFloat(apy) / 100;
          // Calculate earnings per second (APY / seconds in a year)
          const earningsPerSecond = (parseFloat(stakedAmount) * apyDecimal) / (365 * 24 * 60 * 60);
          // Simulate 30 seconds of earnings
          const newEarnings = parseFloat(earnings) + (earningsPerSecond * 30);
          setEarnings(newEarnings.toFixed(6));
        }
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [isLoggedIn, primaryWallet, isEarning, stakedAmount, apy, earnings]);

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

  // Function to resolve Farcaster handle or email to a wallet address
  // In a real implementation, this would query a database or API
  async function resolveIdentifierToAddress(identifier: string): Promise<string | null> {
    // This is a mock implementation
    // In a real app, you would query your backend or a service to resolve the identifier

    // For demo purposes, we'll just return a mock address if the identifier looks like an email or Farcaster handle
    if (identifier.includes('@')) {
      // This is a mock - in a real implementation, you would look up the actual address
      return primaryWallet.address; // Just for testing, return the user's own address
    }

    return null; // Couldn't resolve
  }

  // Send SOL transaction (original function, kept for reference)
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

  // Earn feature functions
  function handleStartEarning() {
    if (!isSolana || parseFloat(usdcBalance) <= 0) {
      setError("You need USDC in your wallet to start earning");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // For demo purposes, we'll stake 50% of the user's balance
      const amountToStake = parseFloat(usdcBalance) * 0.5;

      // Update the staked amount and balance
      setStakedAmount(amountToStake.toFixed(2));
      setUsdcBalance((parseFloat(usdcBalance) - amountToStake).toFixed(2));
      setIsEarning(true);
      setEarnings("0.00");

      setResult(`Started earning with ${amountToStake.toFixed(2)} USDC at ${apy}% APY`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to start earning"
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleStopEarning() {
    if (!isEarning) return;

    try {
      setIsLoading(true);
      setError(null);

      // Return staked amount plus earnings to balance
      const totalReturn = parseFloat(stakedAmount) + parseFloat(earnings);
      setUsdcBalance((parseFloat(usdcBalance) + totalReturn).toFixed(2));

      // Reset earning state
      setStakedAmount("0.00");
      setEarnings("0.00");
      setIsEarning(false);

      setResult(`Stopped earning. Returned ${totalReturn.toFixed(6)} USDC to your wallet.`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to stop earning"
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Receive USDC from faucet
  async function handleReceiveUsdc() {
    if (!isSolana || !usdcMintAddress) return;

    try {
      setIsLoading(true);
      setError(null);
      setResult("Preparing to claim USDC...");

      const connection = new Connection(solanaRpcUrl, "confirmed");
      const recipientPublicKey = new PublicKey(primaryWallet.address);

      // Get the faucet private key from environment variables
      const faucetPrivateKeyString = import.meta.env.VITE_FAUCET_PRIVATE_KEY;

      // In a real implementation, you would securely manage this key on a server
      // For demo purposes, we're using a mock implementation
      // This is just a placeholder - in production, this should be handled by a backend service
      const mockFaucetPrivateKey = new Uint8Array(32).fill(1); // Mock private key

      setResult("Connecting to faucet wallet...");

      // Get the token accounts for faucet and recipient
      const recipientTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(usdcMintAddress),
        recipientPublicKey
      );

      // Check if recipient token account exists
      let recipientAccountExists = true;
      try {
        await getAccount(connection, recipientTokenAccount);
      } catch (error) {
        recipientAccountExists = false;
      }

      setResult("Processing your USDC claim...");

      // In a real implementation, this would be a server-side operation
      // For demo purposes, we'll simulate a successful transaction

      // Simulate a delay for the transaction
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update the balance (in a real implementation, this would be a real transaction)
      const currentBalance = parseFloat(usdcBalance);
      const claimAmount = parseFloat(amount);
      setUsdcBalance((currentBalance + claimAmount).toFixed(2));

      setResult(`Successfully claimed ${amount} USDC! Your new balance is ${(currentBalance + claimAmount).toFixed(2)} USDC.`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to claim USDC"
      );
      setResult(undefined);
    } finally {
      setIsLoading(false);
    }
  }

  // Send USDC transaction
  async function handleSendUsdc() {
    if (!isSolana || !usdcMintAddress) return;

    if (!recipientIdentifier || recipientIdentifier.trim() === "") {
      setError("Please enter a valid Farcaster handle or email address");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult("Resolving recipient...");

      // Try to resolve the identifier to an address
      let recipientAddr = await resolveIdentifierToAddress(recipientIdentifier);

      // If we couldn't resolve it and it looks like a direct address, use it
      if (!recipientAddr && recipientIdentifier.length > 30) {
        recipientAddr = recipientIdentifier;
      }

      if (!recipientAddr) {
        setError("Could not resolve recipient. Please check the Farcaster handle or email address.");
        setIsLoading(false);
        return;
      }

      setResult("Preparing USDC transaction...");

      const connection = new Connection(solanaRpcUrl, "confirmed");
      const senderPublicKey = new PublicKey(primaryWallet.address);
      const recipientPublicKey = new PublicKey(recipientAddr);

      // Get the token accounts for sender and recipient
      const senderTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(usdcMintAddress),
        senderPublicKey
      );

      const recipientTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(usdcMintAddress),
        recipientPublicKey
      );

      // Check if recipient token account exists
      let recipientAccountExists = true;
      try {
        await getAccount(connection, recipientTokenAccount);
      } catch (error) {
        recipientAccountExists = false;
      }

      // Create instructions array
      const instructions = [];

      // If recipient token account doesn't exist, create it
      if (!recipientAccountExists) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            senderPublicKey,
            recipientTokenAccount,
            recipientPublicKey,
            new PublicKey(usdcMintAddress)
          )
        );
      }

      // Add transfer instruction
      const amountInTokenUnits = parseFloat(amount) * Math.pow(10, 6); // USDC has 6 decimals
      instructions.push(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          senderPublicKey,
          BigInt(Math.floor(amountInTokenUnits))
        )
      );

      // Create and send transaction
      const blockhash = await connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        instructions,
        payerKey: senderPublicKey,
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

      setResult(`USDC transaction sent! Signature: ${result.signature}`);
      const confirmation = await connection.confirmTransaction(
        result.signature
      );

      if (confirmation) {
        setResult(
          `USDC transaction confirmed! Signature: ${result.signature}`
        );
        // Refresh balance after sending
        fetchUsdcBalance();
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
          {/* Wallet Overview */}
          {primaryWallet && isSolana && (
            <div className="wallet-overview">
              <h2 className="text-xl font-bold mb-2">USDC Yield Wallet</h2>
              <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Your Address</p>
                  <p className="text-sm font-mono">
                    {primaryWallet.address.substring(0, 6)}...
                    {primaryWallet.address.substring(primaryWallet.address.length - 4)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">USDC Balance</p>
                  <p className="text-2xl font-bold">
                    {isLoadingBalance ? "Loading..." : usdcBalance}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          {primaryWallet && isSolana && (
            <div className="tab-navigation mb-4">
              <div className="flex border-b">
                <button
                  className={`flex-1 py-2 font-medium text-center ${
                    activeTab === 'send' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('send')}
                >
                  Send
                </button>
                <button
                  className={`flex-1 py-2 font-medium text-center ${
                    activeTab === 'receive' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('receive')}
                >
                  Receive
                </button>
                <button
                  className={`flex-1 py-2 font-medium text-center ${
                    activeTab === 'earn' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('earn')}
                >
                  Earn
                </button>
              </div>
            </div>
          )}

          {/* Send USDC Tab */}
          {primaryWallet && isSolana && activeTab === 'send' && (
            <div className="send-container">
              <div className="transaction-form">
                <div className="form-group mb-4">
                  <label htmlFor="recipient-identifier" className="block text-sm font-medium text-gray-700 mb-1">
                    Send to
                  </label>
                  <input
                    id="recipient-identifier"
                    type="text"
                    value={recipientIdentifier}
                    onChange={(e) => setRecipientIdentifier(e.target.value)}
                    placeholder="@farcaster_handle or email@example.com"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="form-group mb-4">
                  <label htmlFor="usdc-amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="flex items-center">
                    <input
                      id="usdc-amount"
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="1.00"
                      className="flex-1 p-2 border border-gray-300 rounded-l-md"
                    />
                    <span className="bg-gray-100 p-2 border border-l-0 border-gray-300 rounded-r-md text-gray-500">
                      USDC
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                  onClick={handleSendUsdc}
                >
                  Send USDC
                </button>
              </div>
            </div>
          )}

          {/* Receive USDC Tab */}
          {primaryWallet && isSolana && activeTab === 'receive' && (
            <div className="receive-container">
              <div className="transaction-form">
                <div className="form-group mb-4">
                  <label htmlFor="claim-amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Claim
                  </label>
                  <div className="flex items-center">
                    <input
                      id="claim-amount"
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="1.00"
                      className="flex-1 p-2 border border-gray-300 rounded-l-md"
                    />
                    <span className="bg-gray-100 p-2 border border-l-0 border-gray-300 rounded-r-md text-gray-500">
                      USDC
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                  onClick={handleReceiveUsdc}
                >
                  Claim USDC
                </button>
              </div>
            </div>
          )}

          {/* Earn Tab */}
          {primaryWallet && isSolana && activeTab === 'earn' && (
            <div className="earn-container">
              {isEarning ? (
                <div className="earning-status p-4 bg-blue-50 rounded-lg mb-4">
                  <h3 className="text-lg font-medium mb-2">Your Yield Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount Staked</p>
                      <p className="text-xl font-bold">{stakedAmount} USDC</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">APY</p>
                      <p className="text-xl font-bold">{apy}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Earnings</p>
                      <p className="text-xl font-bold text-green-500">+{earnings} USDC</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                    onClick={handleStopEarning}
                  >
                    Stop Earning
                  </button>
                </div>
              ) : (
                <div className="start-earning p-4 bg-gray-50 rounded-lg mb-4">
                  <h3 className="text-lg font-medium mb-2">Start Earning {apy}% APY</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Stake your USDC to earn interest. Your earnings will be updated in real-time.
                  </p>
                  <button
                    type="button"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                    onClick={handleStartEarning}
                    disabled={parseFloat(usdcBalance) <= 0}
                  >
                    Start Earning
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Display */}
          {(result || error) && (
            <div className="results-container mt-4 p-4 bg-gray-50 rounded-lg">
              {error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <div className="text-gray-700">
                  {result &&
                    (typeof result === "string" && result.startsWith("{")
                      ? JSON.stringify(JSON.parse(result), null, 2)
                      : result)}
                </div>
              )}
              <button
                className="mt-2 text-sm text-blue-500"
                onClick={clearResult}
              >
                Clear
              </button>
            </div>
          )}

          {/* Debug Buttons - Hidden in Production */}
          <div className="hidden">
            <button className="btn btn-primary" onClick={showUser}>
              Fetch User
            </button>
            <button className="btn btn-primary" onClick={showUserWallets}>
              Fetch User Wallets
            </button>
            <button className="btn btn-primary" onClick={fetchSolanaConnection}>
              Fetch Connection
            </button>
            <button className="btn btn-primary" onClick={fetchSolanaSigner}>
              Fetch Signer
            </button>
            <button className="btn btn-primary" onClick={signSolanaMessage}>
              Sign Message
            </button>
          </div>
        </div>
      )}
    </>
  );
}
