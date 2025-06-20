// src/services/transferIntentService.ts

import { supabase } from '@/lib/supabase';
import EmailInvitationService from './emailInvitationService';
import { ENV_CONFIG } from '@/config/environment';

export interface TransferIntent {
    id: string;
    senderWalletAddress: string;
    recipientEmail: string;
    amount: number; // Amount in USDC base units (6 decimals)
    status: 'pending' | 'claimed' | 'expired';
    createdAt: string;
    claimedAt?: string;
    expiresAt: string;
}

export interface CreateTransferIntentParams {
    senderWalletAddress: string;
    senderEmail?: string; // Optional sender email
    recipientEmail: string;
    amount: number; // Amount in USDC base units (6 decimals)
}

export class TransferIntentService {
    /**
     * Create a new transfer intent for an unregistered recipient
     */
    static async createTransferIntent(params: CreateTransferIntentParams): Promise<TransferIntent> {
        const { senderWalletAddress, senderEmail, recipientEmail, amount } = params;

        console.log('🎯 Creating transfer intent:', {
            sender: senderWalletAddress,
            recipient: recipientEmail,
            amount: amount / 1_000_000 // Log in USDC units for readability
        });

        try {
            // Set expiration to 30 days from now
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            const { data, error } = await supabase
                .from('transfer_intents')
                .insert({
                    sender_wallet: senderWalletAddress,
                    recipient_email: recipientEmail.toLowerCase(),
                    token_mint: ENV_CONFIG.usdcMintAddress,
                    token_symbol: 'USDC',
                    amount: amount / 1_000_000, // Convert to USDC units (numeric with 6 decimals)
                    status: 'pending',
                    expires_at: expiresAt.toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase error creating transfer intent:', error);
                throw new TransferIntentError(
                    'Failed to create transfer intent',
                    'DATABASE_ERROR'
                );
            }

            console.log('✅ Transfer intent created successfully:', data.id);

            const transferIntent = {
                id: data.id,
                senderWalletAddress: data.sender_wallet,
                recipientEmail: data.recipient_email,
                amount: Math.round(data.amount * 1_000_000), // Convert back to base units
                status: data.status,
                createdAt: data.created_at,
                claimedAt: data.claimed_at,
                expiresAt: data.expires_at
            };

            // Send invitation email automatically
            try {
                if (EmailInvitationService.isConfigured()) {
                    console.log('📧 Sending invitation email...');
                    const emailResult = await EmailInvitationService.sendInvitationEmail({
                        transferIntentId: data.id,
                        senderEmail: senderEmail || `${data.sender_wallet.slice(0, 6)}...${data.sender_wallet.slice(-4)}`,
                        recipientEmail: data.recipient_email,
                        amount: Math.round(data.amount * 1_000_000), // Convert back to base units
                        expirationDate: data.expires_at
                    });

                    if (emailResult.success) {
                        console.log('✅ Invitation email sent successfully:', emailResult.emailId);
                    } else {
                        console.warn('⚠️ Failed to send invitation email:', emailResult.error);
                    }
                } else {
                    console.warn('⚠️ Email service not configured, skipping invitation email');
                }
            } catch (emailError) {
                console.error('❌ Error sending invitation email:', emailError);
                // Don't fail the transfer intent creation if email fails
            }

            return transferIntent;
        } catch (error) {
            if (error instanceof TransferIntentError) {
                throw error;
            }

            console.error('❌ Failed to create transfer intent:', error);
            throw new TransferIntentError(
                'Failed to create transfer intent',
                'UNKNOWN_ERROR'
            );
        }
    }

    /**
     * Get pending transfer intents for a recipient email
     */
    static async getUnclaimedTransfers(recipientEmail: string): Promise<TransferIntent[]> {
        try {
            const { data, error } = await supabase
                .from('transfer_intents')
                .select('*')
                .eq('recipient_email', recipientEmail.toLowerCase())
                .eq('status', 'pending')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Supabase error getting unclaimed transfers:', error);
                throw new TransferIntentError(
                    'Failed to get unclaimed transfers',
                    'DATABASE_ERROR'
                );
            }

            return data.map(item => ({
                id: item.id,
                senderWalletAddress: item.sender_wallet_address,
                recipientEmail: item.recipient_email,
                amount: item.amount_usdc,
                status: item.status,
                createdAt: item.created_at,
                claimedAt: item.claimed_at,
                expiresAt: item.expires_at
            }));
        } catch (error) {
            if (error instanceof TransferIntentError) {
                throw error;
            }

            console.error('❌ Failed to get unclaimed transfers:', error);
            throw new TransferIntentError(
                'Failed to get unclaimed transfers',
                'UNKNOWN_ERROR'
            );
        }
    }

    /**
     * Claim a transfer intent (to be implemented when claiming flow is built)
     */
    static async claimTransferIntent(intentId: string, recipientWallet: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('transfer_intents')
                .update({
                    status: 'claimed',
                    claimed_at: new Date().toISOString(),
                    claimed_by_wallet: recipientWallet
                })
                .eq('id', intentId)
                .eq('status', 'pending')
                .select()
                .single();

            if (error || !data) {
                console.error('❌ Supabase error claiming transfer intent:', error);
                return false;
            }

            console.log('✅ Transfer intent claimed successfully:', intentId);
            return true;
        } catch (error) {
            console.error('❌ Failed to claim transfer intent:', error);
            return false;
        }
    }

    /**
     * Get transfer intent by ID
     */
    static async getTransferIntent(intentId: string): Promise<TransferIntent | null> {
        try {
            const { data, error } = await supabase
                .from('transfer_intents')
                .select('*')
                .eq('id', intentId)
                .single();

            if (error || !data) {
                return null;
            }

            return {
                id: data.id,
                senderWalletAddress: data.sender_wallet,
                recipientEmail: data.recipient_email,
                amount: Math.round(data.amount * 1_000_000), // Convert back to base units
                status: data.status,
                createdAt: data.created_at,
                claimedAt: data.claimed_at,
                expiresAt: data.expires_at
            };
        } catch (error) {
            console.error('❌ Failed to get transfer intent:', error);
            return null;
        }
    }
}

// Error class for transfer intent operations
export class TransferIntentError extends Error {
    constructor(
        message: string,
        public code: 'DATABASE_ERROR' | 'INVALID_INPUT' | 'NOT_FOUND' | 'UNKNOWN_ERROR'
    ) {
        super(message);
        this.name = 'TransferIntentError';
    }
}

export default TransferIntentService;