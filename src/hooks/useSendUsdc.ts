// src/hooks/useSendUsdc.ts

import {useState, useCallback} from 'react';
import {useDynamicContext} from '@dynamic-labs/sdk-react-core';
import {isSolanaWallet} from '@dynamic-labs/solana';
import {useToast} from '@/hooks/use-toast';
import EmailResolver from '@/services/emailResolver';
import GaslessTransactionService from '@/services/gaslessTransactionService';

export interface UseSendUsdcOptions {
    usdcMintAddress?: string;
    rpcUrl?: string;
    onSuccess?: (signature: string) => void;
    onError?: (error: string) => void;
}

export interface UseSendUsdcReturn {
    sendUsdc: (email: string, amount: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    transactionSignature: string | null;
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
    const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

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
        setTransactionSignature(null);

        try {
            // Step 1: Show resolving toast
            toast({
                title: "Resolving recipient...",
                description: `Looking up wallet for ${email}`,
            });

            console.log('📧 Resolving email to wallet address...');
            // Resolve email to wallet address
            const resolvedAddress = await EmailResolver.resolveEmailToAddress(email);

            if (!resolvedAddress) {
                throw new Error(`No wallet found for email: ${email}`);
            }

            console.log('✅ Email resolved to:', resolvedAddress);

            // Convert amount to lamports (USDC has 6 decimals)
            const amountInLamports = Math.round(parseFloat(amount) * 1_000_000);

            console.log('💸 Sending USDC amount:', amountInLamports, 'base units');

            // Step 2: Show preparing toast
            toast({
                title: "Preparing transaction...",
                description: "Setting up USDC transfer",
            });

            // Create gasless transaction
            console.log('🎯 Creating gasless transaction...');
            const gaslessTransaction = await GaslessTransactionService.createGaslessTransaction({
                senderAddress: primaryWallet.address,
                recipientAddress: resolvedAddress,
                amount: amountInLamports,
            });

            // Step 3: Get signer
            const signer = await primaryWallet.getSigner();

            console.log('✍️ User signing gasless transaction...');
            // User signs the gasless transaction (fee payer already signed)
            const { signature } = await signer.signAndSendTransaction(gaslessTransaction);

            console.log('✅ Gasless transaction successful:', signature);
            setTransactionSignature(signature);

            toast({
                title: "Transaction Successful! 🎉",
                description: `Sent ${amount} USDC to ${email}`,
            });

            // Call success callback
            onSuccess?.(signature);

        } catch (err) {
            console.error('❌ Gasless transaction failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
            setError(errorMessage);

            toast({
                title: "Transaction Failed",
                description: errorMessage,
                variant: "destructive",
            });

            onError?.(errorMessage);
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
        transactionSignature,
        clearError,
        isReady
    };
};

export default useSendUsdc;