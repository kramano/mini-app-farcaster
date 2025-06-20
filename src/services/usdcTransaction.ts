// src/services/UsdcTransactionService.ts

import {PublicKey, Connection, TransactionMessage, VersionedTransaction} from '@solana/web3.js';
import {
    createTransferInstruction,
    getAssociatedTokenAddress,
    getAccount,
    createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import EmailResolver, {EmailResolverError} from './emailResolver';

export interface SendUsdcParams {
    senderAddress: string;
    email: string;
    amount: string;
    usdcMintAddress: string;
    rpcUrl: string;
    signer: {
        signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>;
    };
}

export interface SendUsdcResult {
    signature: string;
    recipientAddress: string;
    recipientInfo?: {
        email: string;
        name?: string;
        verified: boolean;
    };
    amountSent: string;
    accountCreated: boolean;
}

export class UsdcTransactionError extends Error {
    constructor(
        message: string,
        public code: 'EMAIL_NOT_FOUND' | 'INVALID_AMOUNT' | 'INSUFFICIENT_BALANCE' | 'TRANSACTION_FAILED' | 'NETWORK_ERROR' | 'UNKNOWN',
        public originalError?: Error
    ) {
        super(message);
        this.name = 'UsdcTransactionError';
    }
}

export class UsdcTransaction {
    /**
     * Send USDC to an email address
     */
    static async sendToEmail(params: SendUsdcParams): Promise<SendUsdcResult> {
        const {senderAddress, email, amount, usdcMintAddress, rpcUrl, signer} = params;

        try {
            // Step 1: Validate inputs
            this.validateInputs(email, amount);

            // Step 2: Resolve email to address
            const recipientAddress = await this.resolveRecipient(email);

            // Step 3: Prepare and execute transaction
            const connection = new Connection(rpcUrl, "confirmed");
            const result = await this.executeTransaction({
                connection,
                senderAddress,
                recipientAddress,
                amount,
                usdcMintAddress,
                signer
            });

            // Step 4: Get recipient info
            const recipientInfo = await EmailResolver.getUserByEmail(email);

            return {
                ...result,
                recipientInfo: recipientInfo ? {
                    email: recipientInfo.email,
                    name: recipientInfo.name,
                    verified: recipientInfo.verified
                } : undefined
            };

        } catch (error) {
            console.error('UsdcTransactionService.sendToEmail failed:', error);

            if (error instanceof EmailResolverError) {
                throw new UsdcTransactionError(
                    error.message,
                    'EMAIL_NOT_FOUND',
                    error
                );
            }

            if (error instanceof UsdcTransactionError) {
                throw error;
            }

            throw new UsdcTransactionError(
                error instanceof Error ? error.message : 'Unknown transaction error',
                'UNKNOWN',
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Validate transaction inputs
     */
    private static validateInputs(email: string, amount: string): void {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new UsdcTransactionError(
                'Invalid email format',
                'EMAIL_NOT_FOUND'
            );
        }

        // Validate amount
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            throw new UsdcTransactionError(
                'Amount must be greater than 0',
                'INVALID_AMOUNT'
            );
        }
    }

    /**
     * Resolve email to Solana address
     */
    private static async resolveRecipient(email: string): Promise<string> {
        let recipientAddress: string | null = null;

        try {
            recipientAddress = await EmailResolver.resolveEmailToAddress(email);
        } catch (error) {
            console.error("Error resolving email:", error);
        }

        // If email not found, check if it looks like a direct Solana address
        if (!recipientAddress && email.length > 30 && !email.includes('@')) {
            recipientAddress = email; // Assume it's a direct address
        }

        if (!recipientAddress) {
            const availableEmails = EmailResolver.getRegisteredEmails();
            throw new EmailResolverError(
                `Email ${email} is not registered. Available test emails: ${availableEmails.join(', ')}`,
                'EMAIL_NOT_FOUND'
            );
        }

        return recipientAddress;
    }

    /**
     * Execute the USDC transfer transaction
     */
    private static async executeTransaction(params: {
        connection: Connection;
        senderAddress: string;
        recipientAddress: string;
        amount: string;
        usdcMintAddress: string;
        signer: SendUsdcParams['signer'];
    }): Promise<Omit<SendUsdcResult, 'recipientInfo'>> {
        const {connection, senderAddress, recipientAddress, amount, usdcMintAddress, signer} = params;

        const senderPublicKey = new PublicKey(senderAddress);
        const recipientPublicKey = new PublicKey(recipientAddress);

        // Get token accounts
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

        try {
            const result = await signer.signAndSendTransaction(transferTransaction as any);

            // Confirm transaction
            const confirmation = await connection.confirmTransaction(result.signature);

            if (confirmation.value.err) {
                throw new UsdcTransactionError(
                    `Transaction failed: ${confirmation.value.err}`,
                    'TRANSACTION_FAILED'
                );
            }

            return {
                signature: result.signature,
                recipientAddress,
                amountSent: amount,
                accountCreated: !recipientAccountExists
            };

        } catch (error) {
            if (error instanceof UsdcTransactionError) {
                throw error;
            }

            throw new UsdcTransactionError(
                `Transaction execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'TRANSACTION_FAILED',
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Estimate transaction fee (for UI preview)
     */
    static async estimateTransactionFee(params: {
        senderAddress: string;
        recipientAddress: string;
        usdcMintAddress: string;
        rpcUrl: string;
    }): Promise<{ lamports: number; usd: number }> {
        // This is a simplified estimation
        // In production, you'd want to simulate the actual transaction
        const baseTransactionFee = 5000; // ~0.000005 SOL
        const accountCreationFee = 2039280; // ~0.002 SOL if account creation needed

        // For simplicity, assume account creation might be needed
        const totalLamports = baseTransactionFee + accountCreationFee;
        const solPrice = 20; // Rough estimate, in production you'd fetch real price
        const usdFee = (totalLamports / 1_000_000_000) * solPrice;

        return {
            lamports: totalLamports,
            usd: parseFloat(usdFee.toFixed(3))
        };
    }
}

export default UsdcTransaction;