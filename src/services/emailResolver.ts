// src/services/emailResolver.ts

import EmailWalletService, { EmailWalletError } from './emailWallet';

export interface AddressMapping {
    email: string;
    address: string;
    name?: string;
    verified: boolean;
}

// Fallback demo mappings for development/testing when Supabase is not available
const FALLBACK_EMAIL_TO_ADDRESS_MAP: AddressMapping[] = [
    {
        email: "alice@example.com",
        address: "GVzuPLLgfNE5FrCKuHnWqghFWYvqFWo6BrW8X5m1Q6Tc",
        name: "Alice Smith",
        verified: true
    },
    {
        email: "bob@example.com",
        address: "DaVDxpJ2KFQRB8PQZHuX4YF8jWdgXYtKmZoQT9HbGbJG",
        name: "Bob Johnson",
        verified: true
    },
    {
        email: "charlie@example.com",
        address: "8W6R2Nz3FjJQJ6YQgGJkKxQ5uMp9NvCx3LrEbHtPqC8D",
        name: "Charlie Brown",
        verified: true
    },
    {
        email: "demo@dynamic.xyz",
        address: "FeH5oJ3QY2UGJb8PcN9xVrZ1LsKpMmWzEtRq4DvFgH7A",
        name: "Dynamic Demo",
        verified: true
    },
    {
        email: "test@solana.com",
        address: "9Gj5NqM8WzF7YxPvU3BsKmH2LzEtRq4DvFgH7AFeH5oJ",
        name: "Solana Test",
        verified: true
    }
];

// Check if Supabase is configured
const isSupabaseConfigured = (): boolean => {
    return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

export class EmailResolver {
    /**
     * Resolve an email address to a Solana wallet address
     * Uses Supabase if configured, otherwise falls back to demo data
     */
    static async resolveEmailToAddress(email: string): Promise<string | null> {
        try {
            if (isSupabaseConfigured()) {
                // Use Supabase service
                return await EmailWalletService.getWalletByEmail(email);
            } else {
                // Fallback to demo data with simulated delay
                console.warn('Supabase not configured, using fallback demo data');
                await new Promise(resolve => setTimeout(resolve, 500));

                const mapping = FALLBACK_EMAIL_TO_ADDRESS_MAP.find(
                    m => m.email.toLowerCase() === email.toLowerCase()
                );

                return mapping?.address || null;
            }
        } catch (error) {
            console.error('Error resolving email to address:', error);
            
            if (error instanceof EmailWalletError) {
                // Re-throw known email wallet errors
                throw new EmailResolverError(error.message, 'EMAIL_NOT_FOUND');
            }
            
            throw new EmailResolverError(
                'Failed to resolve email address',
                'NETWORK_ERROR'
            );
        }
    }

    /**
     * Get user info by email
     * Uses Supabase if configured, otherwise falls back to demo data
     */
    static async getUserByEmail(email: string): Promise<AddressMapping | null> {
        try {
            if (isSupabaseConfigured()) {
                // Use Supabase service
                const userInfo = await EmailWalletService.getUserByEmail(email);
                
                if (!userInfo) {
                    return null;
                }
                
                return {
                    email: userInfo.email,
                    address: userInfo.walletAddress,
                    name: userInfo.name,
                    verified: userInfo.verified
                };
            } else {
                // Fallback to demo data with simulated delay
                console.warn('Supabase not configured, using fallback demo data');
                await new Promise(resolve => setTimeout(resolve, 300));

                return FALLBACK_EMAIL_TO_ADDRESS_MAP.find(
                    m => m.email.toLowerCase() === email.toLowerCase()
                ) || null;
            }
        } catch (error) {
            console.error('Error getting user by email:', error);
            
            if (error instanceof EmailWalletError) {
                // Return null for not found errors (expected behavior)
                if (error.code === 'NOT_FOUND' || error.code === 'INVALID_INPUT') {
                    return null;
                }
                
                throw new EmailResolverError(error.message, 'NETWORK_ERROR');
            }
            
            throw new EmailResolverError(
                'Failed to get user information',
                'NETWORK_ERROR'
            );
        }
    }

    /**
     * Register a new email-to-address mapping
     * Uses Supabase if configured, otherwise updates demo data
     */
    static async registerEmailMapping(email: string, address: string, name?: string): Promise<boolean> {
        try {
            if (isSupabaseConfigured()) {
                // Use Supabase service
                await EmailWalletService.registerEmailWallet({
                    email,
                    walletAddress: address
                });
                return true;
            } else {
                // Fallback to demo data (in-memory only)
                console.warn('Supabase not configured, using fallback demo data (in-memory only)');
                
                const existingIndex = FALLBACK_EMAIL_TO_ADDRESS_MAP.findIndex(
                    m => m.email.toLowerCase() === email.toLowerCase()
                );

                const mapping: AddressMapping = {
                    email: email.toLowerCase(),
                    address,
                    name,
                    verified: false // Would require email verification in production
                };

                if (existingIndex >= 0) {
                    FALLBACK_EMAIL_TO_ADDRESS_MAP[existingIndex] = mapping;
                } else {
                    FALLBACK_EMAIL_TO_ADDRESS_MAP.push(mapping);
                }

                return true;
            }
        } catch (error) {
            console.error('Error registering email mapping:', error);
            
            if (error instanceof EmailWalletError) {
                throw new EmailResolverError(error.message, 'NETWORK_ERROR');
            }
            
            throw new EmailResolverError(
                'Failed to register email mapping',
                'NETWORK_ERROR'
            );
        }
    }

    /**
     * Validate if an email address exists in our system
     * Uses Supabase if configured, otherwise checks demo data
     */
    static async isEmailRegistered(email: string): Promise<boolean> {
        try {
            if (isSupabaseConfigured()) {
                // Use Supabase service
                return await EmailWalletService.isEmailRegistered(email);
            } else {
                // Fallback to demo data
                const user = await this.getUserByEmail(email);
                return user !== null;
            }
        } catch (error) {
            console.error('Error checking email registration:', error);
            return false;
        }
    }

    /**
     * Get all registered emails (for testing/demo purposes)
     * Note: Only works with fallback demo data, not with Supabase
     */
    static getRegisteredEmails(): string[] {
        if (isSupabaseConfigured()) {
            console.warn('getRegisteredEmails() not supported with Supabase - use for testing only');
            return [];
        }
        
        return FALLBACK_EMAIL_TO_ADDRESS_MAP.map(m => m.email);
    }

    /**
     * Generate a deterministic address for unregistered emails
     * This creates a temporary "holding" address based on the email
     * In production, you might create escrow accounts or use a different approach
     */
    static generateTemporaryAddress(email: string): string {
        // This is a simple hash-based approach for demo purposes
        // In production, you'd want a more sophisticated system
        let hash = this.simpleHash(email);

        // Generate a fake but consistent address based on email hash
        const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        let result = "";

        for (let i = 0; i < 44; i++) {
            result += chars[hash % chars.length];
            hash = Math.floor(hash / chars.length);
        }

        return result;
    }

    private static simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
}

// Error types for better error handling
export class EmailResolverError extends Error {
    constructor(
        message: string,
        public code: 'EMAIL_NOT_FOUND' | 'INVALID_EMAIL' | 'NETWORK_ERROR' | 'UNKNOWN'
    ) {
        super(message);
        this.name = 'EmailResolverError';
    }
}

export default EmailResolver;