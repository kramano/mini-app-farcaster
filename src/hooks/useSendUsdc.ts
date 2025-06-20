// src/hooks/useSendUsdc.ts

import {useState, useCallback} from 'react';
import {useDynamicContext} from '@dynamic-labs/sdk-react-core';
import {isSolanaWallet} from '@dynamic-labs/solana';
import {useToast} from '@/hooks/use-toast';
import UsdcTransaction, {
    UsdcTransactionError,
    SendUsdcResult
} from '@/services/usdcTransaction';

export interface UseSendUsdcOptions {
    usdcMintAddress?: string;
    rpcUrl?: string;
    onSuccess?: (result: SendUsdcResult) => void;
    onError?: (error: UsdcTransactionError) => void;
}

export interface UseSendUsdcReturn {
    sendUsdc: (email: string, amount: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    lastResult: SendUsdcResult | null;
    clearError: () => void;
    isReady: boolean;
}

export const useSendUsdc = (options: UseSendUsdcOptions = {}): UseSendUsdcReturn => {
    const {primaryWallet} = useDynamicContext();
    const {toast} = useToast();

    const {
        usdcMintAddress,
        rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com",
        onSuccess,
        onError
    } = options;

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<SendUsdcResult | null>(null);

    // Check if we're ready to send
    const isSolana = primaryWallet && isSolanaWallet(primaryWallet);
    const isReady = !!(isSolana && usdcMintAddress && rpcUrl);

    // Main send function
    const sendUsdc = useCallback(async (email: string, amount: string) => {
        if (!isReady) {
            const errorMsg = "Wallet not ready for USDC transactions";
            setError(errorMsg);
            toast({
                title: "Transaction Failed",
                description: errorMsg,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Step 1: Show resolving toast
            toast({
                title: "Resolving recipient...",
                description: `Looking up wallet for ${email}`,
            });

            // Step 2: Get signer
            const signer = await primaryWallet.getSigner();

            // Step 3: Execute transaction via service
            toast({
                title: "Preparing transaction...",
                description: "Setting up USDC transfer",
            });

            const result = await UsdcTransaction.sendToEmail({
                senderAddress: primaryWallet.address,
                email,
                amount,
                usdcMintAddress: usdcMintAddress!,
                rpcUrl,
                signer
            });

            // Step 4: Success handling
            setLastResult(result);

            const recipientName = result.recipientInfo?.name || email;
            const successMessage = `Sent ${amount} USDC to ${recipientName}`;

            toast({
                title: "Transaction Successful! 🎉",
                description: successMessage,
            });

            // Call success callback
            onSuccess?.(result);

        } catch (err) {
            console.error('useSendUsdc: Transaction failed:', err);

            let errorTitle = "Transaction Failed";
            let errorDescription = "Please try again";

            if (err instanceof UsdcTransactionError) {
                switch (err.code) {
                    case 'EMAIL_NOT_FOUND':
                        errorTitle = "Recipient Not Found";
                        errorDescription = err.message;
                        break;
                    case 'INVALID_AMOUNT':
                        errorTitle = "Invalid Amount";
                        errorDescription = err.message;
                        break;
                    case 'INSUFFICIENT_BALANCE':
                        errorTitle = "Insufficient Balance";
                        errorDescription = err.message;
                        break;
                    case 'TRANSACTION_FAILED':
                        errorTitle = "Transaction Failed";
                        errorDescription = err.message;
                        break;
                    default:
                        errorDescription = err.message;
                }
            } else if (err instanceof Error) {
                errorDescription = err.message;
            }

            setError(errorDescription);

            toast({
                title: errorTitle,
                description: errorDescription,
                variant: "destructive",
            });

            // Call error callback
            if (err instanceof UsdcTransactionError) {
                onError?.(err);
            }
        } finally {
            setIsLoading(false);
        }
    }, [
        isReady,
        primaryWallet,
        usdcMintAddress,
        rpcUrl,
        toast,
        onSuccess,
        onError
    ]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        sendUsdc,
        isLoading,
        error,
        lastResult,
        clearError,
        isReady
    };
};

export default useSendUsdc;