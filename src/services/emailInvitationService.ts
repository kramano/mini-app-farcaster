// src/services/emailInvitationService.ts

import { supabase } from '@/lib/supabase';

export interface EmailInvitationParams {
    transferIntentId: string;
    senderEmail: string;
    recipientEmail: string;
    amount: number; // Amount in USDC base units (6 decimals)
    expirationDate: string;
}

export interface EmailInvitationResult {
    emailId: string;
    success: boolean;
    error?: string;
}

export class EmailInvitationService {
    /**
     * Send invitation email for a transfer intent via Supabase function
     */
    static async sendInvitationEmail(params: EmailInvitationParams): Promise<EmailInvitationResult> {
        const { transferIntentId, senderEmail, recipientEmail, amount, expirationDate } = params;

        console.log('📧 Sending invitation email for transfer intent:', transferIntentId);

        try {
            // Convert amount to USDC display format
            const amountUsdc = (amount / 1_000_000).toFixed(2);
            
            // Format expiration date
            const expirationDisplay = new Date(expirationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Get application URL from environment variable (fallback to current origin for development)
            const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
            
            // Create claim URL with recipient email parameter
            const claimUrl = `${appUrl}?email=${encodeURIComponent(recipientEmail)}`;

            // Call Supabase function to send email with template data
            const { data, error } = await supabase.functions.invoke('resend-email', {
                body: {
                    to: recipientEmail,
                    subject: `You've received ${amountUsdc} USDC!`,
                    appUrl,
                    templateData: {
                        senderEmail,
                        recipientEmail,
                        amount: amountUsdc,
                        claimUrl,
                        expirationDate: expirationDisplay,
                        currentDate: new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                        })
                    }
                }
            });

            if (error) {
                console.error('❌ Supabase function error:', error);
                
                // Log failed email notification
                await this.logEmailNotification(transferIntentId, recipientEmail, 'failed', error.message);
                
                return {
                    emailId: '',
                    success: false,
                    error: error.message
                };
            }

            console.log('✅ Email sent successfully via Supabase function:', data?.emailId);

            // Log successful email notification
            await this.logEmailNotification(transferIntentId, recipientEmail, 'sent');

            return {
                emailId: data?.emailId || '',
                success: true
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Failed to send invitation email:', error);

            // Log failed email notification
            await this.logEmailNotification(transferIntentId, recipientEmail, 'failed', errorMessage);

            return {
                emailId: '',
                success: false,
                error: errorMessage
            };
        }
    }


    /**
     * Log email notification to database
     */
    private static async logEmailNotification(
        transferIntentId: string,
        recipientEmail: string,
        status: 'sent' | 'failed',
        errorMessage?: string
    ): Promise<void> {
        try {
            const { error } = await supabase
                .from('transfer_notifications')
                .insert({
                    transfer_intent_id: transferIntentId,
                    notification_type: 'created',
                    email: recipientEmail,
                    status,
                    error_message: errorMessage
                });

            if (error) {
                console.error('❌ Failed to log email notification:', error);
            }
        } catch (error) {
            console.error('❌ Error logging email notification:', error);
        }
    }
    /**
     * Check if email service is properly configured
     */
    static isConfigured(): boolean {
        return !!import.meta.env.VITE_RESEND_FUNCTION_URL;
    }
}

export default EmailInvitationService;